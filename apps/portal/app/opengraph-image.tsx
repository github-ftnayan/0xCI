import { ImageResponse } from "next/og";

export const alt = "0xCI - AWS preview URLs for every pull request";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0A0A0F",
          backgroundImage:
            "radial-gradient(circle at 25% 15%, rgba(0,255,136,0.16), transparent 45%), radial-gradient(circle at 80% 85%, rgba(0,255,136,0.10), transparent 45%)",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "40px",
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 44,
              color: "#00ff88",
              fontWeight: 700,
            }}
          >
            0x
          </span>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 44,
              color: "#F0F0F8",
              fontWeight: 300,
            }}
          >
            CI
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 68,
              fontWeight: 700,
              color: "#F0F0F8",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            Preview deployments on your AWS
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: "#8888A8",
              maxWidth: 820,
              lineHeight: 1.4,
            }}
          >
            Every pull request gets its own live preview URL. Zero config, no
            vendor lock-in.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginTop: "56px",
            padding: "14px 28px",
            borderRadius: "999px",
            border: "1px solid rgba(0,255,136,0.3)",
            backgroundColor: "rgba(0,255,136,0.06)",
          }}
        >
          <span
            style={{
              fontFamily: "monospace",
              fontSize: 20,
              color: "#00ff88",
              letterSpacing: "0.08em",
            }}
          >
            THE OPEN-SOURCE VERCEL ALTERNATIVE
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
