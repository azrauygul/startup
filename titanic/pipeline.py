"""Kaggle Titanic pipeline.

Reads data/train.csv and data/test.csv, builds features from the passenger
record, and picks a model by stratified cross-validation on the training set.
test.csv has no Survived column; predictions are written to output/submission.csv.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import (
    GradientBoostingClassifier,
    HistGradientBoostingClassifier,
    RandomForestClassifier,
    VotingClassifier,
)
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
from sklearn.model_selection import StratifiedKFold, cross_val_predict, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
OUTPUT_DIR = ROOT / "output"

REQUIRED_COLUMNS = [
    "Pclass",
    "Name",
    "Sex",
    "Age",
    "SibSp",
    "Parch",
    "Ticket",
    "Fare",
    "Cabin",
    "Embarked",
]

TITLE_MAP = {
    "Mr": "Mr",
    "Mrs": "Mrs",
    "Miss": "Miss",
    "Master": "Master",
    "Ms": "Miss",
    "Mlle": "Miss",
    "Mme": "Mrs",
    "Lady": "Rare",
    "Countess": "Rare",
    "Capt": "Rare",
    "Col": "Rare",
    "Don": "Rare",
    "Dr": "Rare",
    "Major": "Rare",
    "Rev": "Rare",
    "Sir": "Rare",
    "Jonkheer": "Rare",
    "Dona": "Rare",
}

NUMERIC_FEATURES = [
    "Age",
    "LogFare",
    "FarePerPerson",
    "FamilySize",
    "SibSp",
    "Parch",
    "TicketGroup",
    "Pclass",
    "IsAlone",
    "HasCabin",
    "IsChild",
]
CATEGORICAL_FEATURES = ["Sex", "Embarked", "Title", "Deck", "AgeBand"]
MODEL_FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES


@dataclass
class Report:
    baseline_accuracy: float
    scores: pd.DataFrame
    best_model: str
    oof_accuracy: float
    oof_by_group: pd.DataFrame
    submission_path: Path
    submission: pd.DataFrame


def extract_title(name: object) -> str:
    if not isinstance(name, str):
        return "Rare"
    try:
        title = name.split(",")[1].split(".")[0].strip()
    except IndexError:
        return "Rare"
    return TITLE_MAP.get(title, "Rare")


def ticket_frequency(train: pd.DataFrame, test: pd.DataFrame) -> dict[str, int]:
    """How many passengers share a ticket, counted across train and test.

    The count uses only the Ticket string. It does not use Survived.
    """
    tickets = pd.concat(
        [train["Ticket"].astype(str), test["Ticket"].astype(str)],
        ignore_index=True,
    )
    return {ticket: int(count) for ticket, count in tickets.value_counts().items()}


class TitanicFeatures(BaseEstimator, TransformerMixin):
    """Row-wise Titanic features. Age, fare, and embarkation statistics are fit per fold."""

    def __init__(self, ticket_counts: dict | None = None):
        self.ticket_counts = ticket_counts

    def fit(self, X, y=None):
        df = self._frame(X)
        self._require_columns(df)
        titled = df["Name"].map(extract_title)
        embarked = df["Embarked"].dropna()
        self.embarked_mode_ = embarked.mode().iloc[0] if len(embarked) else "S"
        grouped = df.assign(Title=titled)
        self.age_by_group_ = grouped.groupby(["Title", "Pclass"])["Age"].median()
        self.age_by_title_ = grouped.groupby("Title")["Age"].median()
        self.age_global_ = float(df["Age"].median())
        self.fare_by_class_ = df.groupby("Pclass")["Fare"].median()
        self.fare_global_ = float(df["Fare"].median())
        self.feature_names_in_ = list(df.columns)
        return self

    def transform(self, X):
        df = self._frame(X)
        self._require_columns(df)
        title = df["Name"].map(extract_title)
        family_size = df["SibSp"].fillna(0).to_numpy(dtype=float) + df["Parch"].fillna(0).to_numpy(dtype=float) + 1
        pclass = df["Pclass"].astype(int)
        age = self._fill_age(title, pclass, df["Age"])
        fare = self._fill_fare(pclass, df["Fare"])
        counts = self.ticket_counts or {}
        ticket_group = df["Ticket"].astype(str).map(counts).fillna(1).to_numpy(dtype=float)
        ticket_group = np.maximum(ticket_group, 1.0)
        cabin = df["Cabin"]
        deck = cabin.fillna("U").astype(str).str[0]
        deck = deck.where(deck.isin(list("ABCDEFG")), "U")
        age_band = pd.cut(
            age,
            bins=[0, 5, 12, 18, 35, 55, 120],
            labels=["Infant", "Child", "Teen", "Young", "Adult", "Senior"],
            include_lowest=True,
        )

        out = pd.DataFrame(index=df.index)
        out["Age"] = age
        out["LogFare"] = np.log1p(fare)
        out["FarePerPerson"] = fare / ticket_group
        out["FamilySize"] = family_size
        out["SibSp"] = df["SibSp"].fillna(0).to_numpy(dtype=float)
        out["Parch"] = df["Parch"].fillna(0).to_numpy(dtype=float)
        out["TicketGroup"] = ticket_group
        out["Pclass"] = pclass.to_numpy(dtype=float)
        out["IsAlone"] = (family_size == 1).astype(float)
        out["HasCabin"] = cabin.notna().to_numpy(dtype=float)
        out["IsChild"] = (age < 16).astype(float)
        out["Sex"] = df["Sex"].fillna("male").astype(str)
        out["Embarked"] = df["Embarked"].fillna(self.embarked_mode_).astype(str)
        out["Title"] = title.astype(str)
        out["Deck"] = deck.astype(str)
        out["AgeBand"] = pd.Series(age_band, index=df.index).astype(str)
        return out[MODEL_FEATURES]

    def _fill_age(self, title: pd.Series, pclass: pd.Series, age: pd.Series) -> np.ndarray:
        filled = age.to_numpy(dtype=float).copy()
        group_index = pd.MultiIndex.from_arrays([title.to_numpy(), pclass.to_numpy()])
        group_values = self.age_by_group_.reindex(group_index).to_numpy(dtype=float)
        title_values = title.map(self.age_by_title_).to_numpy(dtype=float)
        missing = np.isnan(filled)
        np.putmask(filled, missing, group_values)
        missing = np.isnan(filled)
        np.putmask(filled, missing, title_values)
        missing = np.isnan(filled)
        filled[missing] = self.age_global_
        return filled

    def _fill_fare(self, pclass: pd.Series, fare: pd.Series) -> np.ndarray:
        filled = fare.to_numpy(dtype=float).copy()
        class_values = pclass.map(self.fare_by_class_).to_numpy(dtype=float)
        missing = np.isnan(filled)
        np.putmask(filled, missing, class_values)
        missing = np.isnan(filled)
        filled[missing] = self.fare_global_
        return filled

    def _frame(self, X) -> pd.DataFrame:
        if isinstance(X, pd.DataFrame):
            return X.copy()
        names = getattr(self, "feature_names_in_", None)
        if names is None:
            raise TypeError("TitanicFeatures expected a pandas DataFrame.")
        return pd.DataFrame(np.asarray(X), columns=names)

    @staticmethod
    def _require_columns(df: pd.DataFrame) -> None:
        missing = [column for column in REQUIRED_COLUMNS if column not in df.columns]
        if missing:
            raise ValueError(f"Eksik kolonlar: {missing}")


def load_data(data_dir: Path = DATA_DIR) -> tuple[pd.DataFrame, pd.DataFrame]:
    train = pd.read_csv(data_dir / "train.csv")
    test = pd.read_csv(data_dir / "test.csv")
    if "Survived" not in train.columns:
        raise ValueError("train.csv içinde Survived kolonu yok.")
    if "Survived" in test.columns:
        raise ValueError(
            "test.csv içinde Survived kolonu var. Bu pipeline yalnızca etiketsiz test dosyasını kabul eder."
        )
    expected_test = set(REQUIRED_COLUMNS) | {"PassengerId"}
    if not expected_test.issubset(test.columns):
        raise ValueError(f"test.csv kolonları eksik: {sorted(expected_test - set(test.columns))}")
    if not (expected_test | {"Survived"}).issubset(train.columns):
        raise ValueError("train.csv kolonları eksik.")
    _check_sample_rows(train, test)
    return train, test


def _check_sample_rows(train: pd.DataFrame, test: pd.DataFrame) -> None:
    """Confirm the files match the Kaggle sample shown alongside this project."""
    if len(train) != 891 or len(test) != 418:
        raise ValueError(f"Beklenen boyutlar train=891 ve test=418, gelenler {len(train)} ve {len(test)}.")
    if not str(train.loc[0, "Name"]).startswith("Braund"):
        raise ValueError("train.csv ilk satırı Kaggle Titanic örneği değil.")
    if int(test.loc[0, "PassengerId"]) != 892 or not str(test.loc[0, "Name"]).startswith("Kelly"):
        raise ValueError("test.csv ilk satırı Kaggle Titanic örneği değil.")


def gender_rule_accuracy(train: pd.DataFrame) -> float:
    prediction = (train["Sex"] == "female").astype(int)
    return float(accuracy_score(train["Survived"].astype(int), prediction))


def _preprocessor() -> ColumnTransformer:
    numeric = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )
    categorical = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
        ]
    )
    return ColumnTransformer(
        transformers=[
            ("num", numeric, NUMERIC_FEATURES),
            ("cat", categorical, CATEGORICAL_FEATURES),
        ]
    )


def build_models(ticket_counts: dict[str, int], seed: int = 42) -> dict[str, Pipeline]:
    forest = RandomForestClassifier(
        n_estimators=500,
        max_depth=6,
        min_samples_leaf=4,
        max_features="sqrt",
        random_state=seed,
        n_jobs=1,
    )
    boosting = GradientBoostingClassifier(
        n_estimators=250,
        learning_rate=0.05,
        max_depth=3,
        subsample=0.9,
        min_samples_leaf=5,
        random_state=seed,
    )
    hist = HistGradientBoostingClassifier(
        learning_rate=0.06,
        max_depth=4,
        max_iter=300,
        min_samples_leaf=20,
        l2_regularization=0.1,
        random_state=seed,
    )
    logistic = LogisticRegression(C=0.5, max_iter=2000, random_state=seed)
    vote = VotingClassifier(
        estimators=[
            ("forest", forest),
            ("boosting", boosting),
            ("hist", hist),
            ("logistic", logistic),
        ],
        voting="soft",
    )
    members = {
        "logistic": logistic,
        "random_forest": forest,
        "gradient_boosting": boosting,
        "hist_gradient_boosting": hist,
        "soft_vote": vote,
    }
    return {
        name: Pipeline(
            steps=[
                ("features", TitanicFeatures(ticket_counts=ticket_counts)),
                ("prep", _preprocessor()),
                ("model", model),
            ]
        )
        for name, model in members.items()
    }


def make_cv(seed: int = 42) -> StratifiedKFold:
    return StratifiedKFold(n_splits=5, shuffle=True, random_state=seed)


def evaluate(train: pd.DataFrame, models: dict[str, Pipeline], seed: int = 42) -> tuple[pd.DataFrame, str, np.ndarray]:
    x = train.drop(columns=["Survived"])
    y = train["Survived"].astype(int)
    cv = make_cv(seed)
    rows = []
    fold_scores: dict[str, np.ndarray] = {}
    for name, model in models.items():
        scores = cross_val_score(model, x, y, cv=cv, scoring="accuracy", n_jobs=1)
        fold_scores[name] = scores
        row = {
            "model": name,
            "mean_accuracy": float(scores.mean()),
            "std_accuracy": float(scores.std(ddof=1)),
        }
        for index, score in enumerate(scores, start=1):
            row[f"fold_{index}"] = float(score)
        rows.append(row)
    table = pd.DataFrame(rows).sort_values(
        ["mean_accuracy", "std_accuracy"],
        ascending=[False, True],
    ).reset_index(drop=True)
    best_name = str(table.loc[0, "model"])
    oof = cross_val_predict(models[best_name], x, y, cv=cv, method="predict", n_jobs=1)
    return table, best_name, oof


def group_accuracy(train: pd.DataFrame, oof: np.ndarray) -> pd.DataFrame:
    frame = train[["Sex", "Pclass", "Survived"]].copy()
    frame["prediction"] = oof
    rows = []
    for (sex, pclass), group in frame.groupby(["Sex", "Pclass"], sort=True):
        rows.append(
            {
                "Sex": sex,
                "Pclass": int(pclass),
                "n": int(len(group)),
                "accuracy": float(accuracy_score(group["Survived"], group["prediction"])),
            }
        )
    return pd.DataFrame(rows)


def fit_submission(train: pd.DataFrame, test: pd.DataFrame, model: Pipeline) -> pd.DataFrame:
    model.fit(train.drop(columns=["Survived"]), train["Survived"].astype(int))
    prediction = model.predict(test).astype(int)
    return pd.DataFrame({"PassengerId": test["PassengerId"].astype(int), "Survived": prediction})


def preview_features(train: pd.DataFrame, test: pd.DataFrame, n: int = 5) -> pd.DataFrame:
    features = TitanicFeatures(ticket_counts=ticket_frequency(train, test))
    features.fit(train)
    return features.transform(train).head(n)


def run(data_dir: Path = DATA_DIR, output_dir: Path = OUTPUT_DIR, seed: int = 42) -> Report:
    train, test = load_data(data_dir)
    counts = ticket_frequency(train, test)
    models = build_models(counts, seed=seed)
    scores, best_name, oof = evaluate(train, models, seed=seed)
    best_model = models[best_name]
    submission = fit_submission(train, test, best_model)
    output_dir.mkdir(parents=True, exist_ok=True)
    submission_path = output_dir / "submission.csv"
    submission.to_csv(submission_path, index=False)
    scores.to_csv(output_dir / "cv_scores.csv", index=False)
    by_group = group_accuracy(train, oof)
    by_group.to_csv(output_dir / "oof_by_group.csv", index=False)
    report = Report(
        baseline_accuracy=gender_rule_accuracy(train),
        scores=scores,
        best_model=best_name,
        oof_accuracy=float(accuracy_score(train["Survived"].astype(int), oof)),
        oof_by_group=by_group,
        submission_path=submission_path,
        submission=submission,
    )
    _write_summary(output_dir / "summary.txt", report)
    _print_report(report)
    return report


def _write_summary(path: Path, report: Report) -> None:
    lines = [
        f"gender_rule_train_accuracy={report.baseline_accuracy:.6f}",
        f"best_model={report.best_model}",
        f"oof_accuracy={report.oof_accuracy:.6f}",
        f"submission={report.submission_path}",
        f"submission_rows={len(report.submission)}",
        "",
        report.scores.to_string(index=False),
        "",
        report.oof_by_group.to_string(index=False),
        "",
    ]
    path.write_text("\n".join(lines), encoding="utf-8")


def _print_report(report: Report) -> None:
    print(f"Kadın yaşar / erkek ölür kuralı (train): {report.baseline_accuracy:.2%}")
    print()
    print("5-kat çapraz doğrulama")
    print(
        report.scores[["model", "mean_accuracy", "std_accuracy"]].to_string(
            index=False,
            formatters={
                "mean_accuracy": "{:.2%}".format,
                "std_accuracy": "{:.2%}".format,
            },
        )
    )
    print()
    print(f"Seçilen model: {report.best_model}")
    print(f"Out-of-fold doğruluk: {report.oof_accuracy:.2%}")
    print()
    print("Cinsiyet ve sınıfa göre out-of-fold doğruluk")
    print(
        report.oof_by_group.to_string(
            index=False,
            formatters={"accuracy": "{:.2%}".format},
        )
    )
    print()
    print(f"Gönderi: {report.submission_path} ({len(report.submission)} satır)")


def main() -> None:
    run()


if __name__ == "__main__":
    main()
