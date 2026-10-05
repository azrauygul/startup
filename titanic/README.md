# Titanic modeli

Kaggle Titanic train ve test dosyaları için tek komutluk model. Uygulamanın geri kalanına bağlı değildir.

`train.csv` 891 yolcu ve `Survived` etiketini içerir. `test.csv` 418 yolcu içerir ve etiket taşımaz. Skor, train üzerinde 5 katmanlı stratified cross-validation ile ölçülür. Çıktı, Kaggle’a yüklenecek `output/submission.csv` dosyasıdır (`PassengerId`, `Survived`).

Kadın yaşar / erkek ölür kuralı train üzerinde %78.68 doğruluk verir. Ünvan, aile büyüklüğü, bilet grubu, güverte ve yaş bandı eklendikten sonra 5 katmanlı cross-validation soft vote modelini seçer:

| Model | Ortalama doğruluk | Std |
| --- | ---: | ---: |
| soft_vote | 84.40% | 2.03% |
| gradient_boosting | 83.95% | 1.99% |
| hist_gradient_boosting | 83.72% | 1.28% |
| random_forest | 83.28% | 1.24% |
| logistic | 82.38% | 1.31% |

Out-of-fold doğruluk %84.40’tır. Public leaderboard bu sayının bir iki puan altında kalabilir. Yarışma metriği accuracy olduğu için model seçimi de accuracy ile yapılır.

## Kurulum

Repo kökünden:

```bash
pip install -r titanic/requirements.txt
python titanic/pipeline.py
```

Notebook:

```bash
pip install jupyter
jupyter notebook titanic/titanic.ipynb
```

## Özellikler

- Ünvan: `Name` içinden `Mr`, `Mrs`, `Miss`, `Master`, `Rare`
- Aile: `FamilySize = SibSp + Parch + 1`, yalnız yolcu bayrağı
- Bilet grubu: aynı `Ticket` değerini paylaşan yolcu sayısı (train + test, etiketsiz)
- Ücret: eksik ücret sınıf medyanı ile dolar; kişi başı ücret bilet grubuna bölünür
- Yaş: eksik yaş, aynı ünvan ve sınıfın medyanı ile dolar; çocuk bayrağı ve yaş bandı üretilir
- Güverte: `Cabin` ilk harfi; boş kabin ayrı kategori
- Biniş limanı: eksik iki satır train modu ile dolar

Yaş, ücret ve liman istatistikleri her katmanda yalnızca o katmanın train parçasıyla hesaplanır.

## Çıktılar

- `output/submission.csv` — Kaggle gönderisi
- `output/cv_scores.csv` — model karşılaştırması
- `output/oof_by_group.csv` — cinsiyet ve sınıfa göre doğruluk
- `output/summary.txt` — kısa özet
