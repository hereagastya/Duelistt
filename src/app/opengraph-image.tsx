import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

/*
  Most SaaS banners are a screenshot of the hero, which means the preview says
  the same thing the page is about to say. This one shows the mechanism instead:
  four people going quiet, ordered by how long it has been, with the oldest lit.
  Someone who sees it in a WhatsApp thread understands the product before they
  have read a word of it.

  Drawn here rather than exported from a design tool, so it can never drift out
  of sync with the palette.
*/

export const alt =
  "Duelistt — four people waiting on a follow-up, oldest first";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NIGHT = "#1a150f";
const CHALK = "#f2ede4";
const CHALK_SOFT = "#bdb3a4";
const CHALK_FAINT = "#8c8275";
const EMBER = "#f5a742";

const QUEUE = [
  { name: "Priya R.", wait: "9d", meter: 1, live: true },
  { name: "Daniel O.", wait: "4d", meter: 0.52 },
  { name: "Mei S.", wait: "2d", meter: 0.28 },
  { name: "Tomás H.", wait: "today", meter: 0.09 },
];

export default async function Image() {
  const logo = await readFile(join(process.cwd(), "public", "logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        backgroundColor: NIGHT,
        backgroundImage: `radial-gradient(900px 520px at 22% -10%, #2b2116 0%, ${NIGHT} 62%)`,
        color: CHALK,
        padding: 64,
      }}
    >
      {/* Left: who it is and what it claims. */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: 520,
          paddingRight: 48,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            width={52}
            height={52}
            alt=""
            style={{ borderRadius: 15 }}
          />
          <span
            style={{
              marginLeft: 16,
              fontSize: 32,
              fontWeight: 600,
              letterSpacing: -1,
            }}
          >
            Duelistt
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: 60,
              fontWeight: 600,
              letterSpacing: -2.6,
              lineHeight: 1.06,
            }}
          >
            You didn’t lose
          </span>
          <span
            style={{
              fontSize: 60,
              fontWeight: 600,
              letterSpacing: -2.6,
              lineHeight: 1.06,
            }}
          >
            the deal.
          </span>
          <span
            style={{
              fontSize: 60,
              fontWeight: 600,
              letterSpacing: -2.6,
              lineHeight: 1.06,
              color: EMBER,
            }}
          >
            You forgot to
          </span>
          <span
            style={{
              fontSize: 60,
              fontWeight: 600,
              letterSpacing: -2.6,
              lineHeight: 1.06,
              color: EMBER,
            }}
          >
            call back.
          </span>
        </div>

        <span style={{ fontSize: 22, color: CHALK_FAINT }}>
          A follow-up tracker. Not a CRM.
        </span>
      </div>

      {/* Right: the queue, which is the whole product. */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          borderRadius: 26,
          padding: 30,
          backgroundColor: "#241d15",
          border: "1px solid rgba(255,255,255,0.09)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 26,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 9,
                height: 9,
                borderRadius: 9,
                backgroundColor: EMBER,
              }}
            />
            <span
              style={{
                marginLeft: 12,
                fontSize: 17,
                letterSpacing: 3,
                color: CHALK_FAINT,
              }}
            >
              DUE TODAY
            </span>
          </div>
          <span
            style={{
              fontSize: 17,
              color: EMBER,
              border: "1px solid rgba(245,167,66,0.32)",
              borderRadius: 999,
              padding: "6px 16px",
            }}
          >
            4 waiting
          </span>
        </div>

        {QUEUE.map((row) => (
          <div
            key={row.name}
            style={{
              display: "flex",
              flexDirection: "column",
              borderRadius: 16,
              padding: "18px 20px",
              marginBottom: 12,
              backgroundColor: row.live
                ? "rgba(245,167,66,0.09)"
                : "rgba(255,255,255,0.028)",
              border: row.live
                ? "1px solid rgba(245,167,66,0.3)"
                : "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 22, fontWeight: 500, color: CHALK }}>
                {row.name}
              </span>
              <span
                style={{
                  fontSize: 19,
                  color: row.live ? EMBER : CHALK_SOFT,
                }}
              >
                {row.wait}
              </span>
            </div>

            {/* How long they have been waiting, not a progress bar. */}
            <div
              style={{
                display: "flex",
                height: 4,
                borderRadius: 4,
                backgroundColor: "rgba(255,255,255,0.07)",
              }}
            >
              <div
                style={{
                  width: `${row.meter * 100}%`,
                  height: 4,
                  borderRadius: 4,
                  backgroundColor: row.live ? EMBER : "rgba(255,255,255,0.2)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>,
    size,
  );
}
