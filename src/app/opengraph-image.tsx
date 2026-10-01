import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

/*
  Most SaaS banners are a screenshot of the hero, which means the preview says
  the same thing the page is about to say. This one is a typographic poster
  beside the mechanism: the headline set in the site's own faces with the hinge
  word in the serif italic, the things the product refuses struck out, and a
  queue of four people going quiet with the oldest lit.

  Drawn here rather than exported from a design tool, so it can never drift out
  of sync with the palette.
*/

export const alt =
  "Duelistt — you didn't lose the deal, you forgot to call back";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NIGHT = "#17120d";
const CHALK = "#f4efe6";
const CHALK_SOFT = "#b8ae9f";
const CHALK_FAINT = "#7d7466";
const EMBER = "#f5a742";

const QUEUE = [
  { name: "Priya R.", wait: "9d", meter: 1, live: true },
  { name: "Daniel O.", wait: "4d", meter: 0.52 },
  { name: "Mei S.", wait: "2d", meter: 0.28 },
  { name: "Tomás H.", wait: "today", meter: 0.09 },
];

const REFUSED = ["Pipelines", "Deal stages", "Dashboards"];

/*
  Satori has no access to next/font's output and cannot read woff2, so the faces
  are fetched as TrueType at build time. Google serves ttf only to a user agent
  it does not recognise as modern, hence the deliberately ancient UA string.

  If the fetch fails the banner still renders in Satori's fallback face: a plain
  banner beats a failed build.
*/
async function brandFont(family: string, weight: number, italic = false) {
  const spec = italic ? `ital,wght@1,${weight}` : `wght@${weight}`;
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${family}:${spec}`,
    { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1)" } },
  ).then((r) => r.text());

  const url = css.match(/src: url\((https:[^)]+\.ttf)\)/)?.[1];
  if (!url) throw new Error(`no ttf for ${family} ${weight}`);
  return fetch(url).then((r) => r.arrayBuffer());
}

async function loadFonts() {
  try {
    const [regular, medium, semibold, serifItalic] = await Promise.all([
      brandFont("IBM+Plex+Sans", 400),
      brandFont("IBM+Plex+Sans", 500),
      brandFont("IBM+Plex+Sans", 600),
      brandFont("IBM+Plex+Serif", 500, true),
    ]);

    return [
      {
        name: "Plex",
        data: regular,
        weight: 400 as const,
        style: "normal" as const,
      },
      {
        name: "Plex",
        data: medium,
        weight: 500 as const,
        style: "normal" as const,
      },
      {
        name: "Plex",
        data: semibold,
        weight: 600 as const,
        style: "normal" as const,
      },
      {
        name: "PlexSerif",
        data: serifItalic,
        weight: 500 as const,
        style: "italic" as const,
      },
    ];
  } catch {
    return undefined;
  }
}

export default async function Image() {
  const [logo, fonts] = await Promise.all([
    readFile(join(process.cwd(), "public", "logo.png")),
    loadFonts(),
  ]);
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  const line = {
    display: "flex",
    fontSize: 62,
    fontWeight: 600,
    letterSpacing: -3,
    lineHeight: 1.04,
  } as const;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        backgroundColor: NIGHT,
        backgroundImage: `radial-gradient(760px 520px at 16% -14%, #33261a 0%, ${NIGHT} 64%)`,
        color: CHALK,
        fontFamily: "Plex",
        padding: 60,
      }}
    >
      {/* Left: the poster. */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: 596,
          paddingRight: 44,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            width={46}
            height={46}
            alt=""
            style={{ borderRadius: 13 }}
          />
          <span
            style={{
              marginLeft: 14,
              fontSize: 27,
              fontWeight: 600,
              letterSpacing: -0.9,
            }}
          >
            Duelistt
          </span>
          <span
            style={{
              marginLeft: 18,
              paddingLeft: 18,
              borderLeft: "1px solid rgba(255,255,255,0.14)",
              fontSize: 14,
              letterSpacing: 3.4,
              color: CHALK_FAINT,
            }}
          >
            FOLLOW-UP TRACKER
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={line}>You didn’t lose</div>
          <div style={line}>the deal.</div>
          <div style={{ ...line, color: EMBER }}>
            <span>You&nbsp;</span>
            {/* The hinge word, in the sans's own sibling -- same move as the hero. */}
            <span
              style={{
                fontFamily: "PlexSerif",
                fontStyle: "italic",
                fontWeight: 500,
              }}
            >
              forgot
            </span>
            <span>&nbsp;to</span>
          </div>
          <div style={{ ...line, color: EMBER }}>call back.</div>
        </div>

        {/* What it refuses, crossed out -- the position in one glance. */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {REFUSED.map((word) => (
              <span
                key={word}
                style={{
                  marginRight: 20,
                  fontSize: 23,
                  color: CHALK_FAINT,
                  textDecoration: "line-through",
                  textDecorationColor: "rgba(245,167,66,0.75)",
                }}
              >
                {word}
              </span>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 14,
              fontSize: 25,
              fontWeight: 500,
              color: CHALK,
            }}
          >
            <span style={{ color: EMBER, marginRight: 12 }}>→</span>
            <span>Just who to call today.</span>
          </div>
        </div>
      </div>

      {/* Right: the queue, which is the whole product. */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          borderRadius: 26,
          padding: 28,
          backgroundColor: "#241d15",
          border: "1px solid rgba(255,255,255,0.09)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
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
                fontSize: 15,
                letterSpacing: 3.4,
                color: CHALK_FAINT,
              }}
            >
              DUE TODAY
            </span>
          </div>
          <span
            style={{
              fontSize: 16,
              color: EMBER,
              border: "1px solid rgba(245,167,66,0.32)",
              borderRadius: 999,
              padding: "5px 15px",
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
              padding: "17px 19px",
              marginBottom: 11,
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
              <span style={{ fontSize: 21, fontWeight: 500, color: CHALK }}>
                {row.name}
              </span>
              <span
                style={{ fontSize: 18, color: row.live ? EMBER : CHALK_SOFT }}
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
    { ...size, fonts },
  );
}
