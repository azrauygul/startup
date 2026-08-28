import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#00BEE7",
          borderRadius: "9999px",
        }}
      >
        <svg
          width="280"
          height="280"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M24 12L14 20.5V34.5H20V27.5H28V34.5H34V20.5L24 12Z"
            fill="white"
          />
        </svg>
      </div>
    ),
    { ...size },
  );
}
