import React, { useId } from "react";

const green = "#5b793c";
const gold = "#d8ad59";
// Fixed organic contours keep MOLI softly irregular without changing on render.
const edgeRadius = (angle) =>
  1 + Math.sin(angle * 7) * 0.012 + Math.sin(angle * 13) * 0.008;
const outlinePoints = Array.from({ length: 84 }, (_, i) => {
  const angle = (i / 84) * Math.PI * 2;
  const radius = edgeRadius(angle);
  return [
    120 + Math.cos(angle) * 86 * radius,
    119 + Math.sin(angle) * 71 * radius,
  ];
});
const mossOutline =
  outlinePoints.reduce(
    (path, point, i) => {
      const next = outlinePoints[(i + 1) % outlinePoints.length];
      return `${path} Q${point[0]} ${point[1]} ${(point[0] + next[0]) / 2} ${(point[1] + next[1]) / 2}`;
    },
    `M${(outlinePoints.at(-1)[0] + outlinePoints[0][0]) / 2} ${(outlinePoints.at(-1)[1] + outlinePoints[0][1]) / 2}`,
  ) + "Z";
const moss = Array.from({ length: 116 }, (_, i) => {
  const a = i * 2.39996323;
  const r = Math.sqrt((i + 0.5) / 116);
  return {
    x: 120 + Math.cos(a) * r * 82,
    y: 120 + Math.sin(a) * r * 68,
    r: 2.2 + (i % 4) * 0.7,
    a: i % 3,
  };
});
const fuzz = Array.from({ length: 78 }, (_, i) => {
  const a = (i / 78) * Math.PI * 2;
  return {
    x: 120 + Math.cos(a) * 85 * edgeRadius(a),
    y: 119 + Math.sin(a) * 70 * edgeRadius(a),
    dx: Math.cos(a) * (4 + (i % 5)),
    dy: Math.sin(a) * (4 + (i % 4)),
  };
});

export function Spark({ x = 0, y = 0, size = 12, color = gold, ...props }) {
  return (
    <path
      d={`M${x} ${y - size} Q${x + size * 0.2} ${y - size * 0.2} ${x + size * 0.65} ${y} Q${x + size * 0.2} ${y + size * 0.2} ${x} ${y + size} Q${x - size * 0.2} ${y + size * 0.2} ${x - size * 0.65} ${y} Q${x - size * 0.2} ${y - size * 0.2} ${x} ${y - size}Z`}
      fill={color}
      {...props}
    />
  );
}

function Clover({ x = 0, y = 0, scale = 1 }) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${scale})`}
      stroke="#5e7a39"
      strokeWidth="1.4"
    >
      <path d="M0 1Q9 15 3 24" fill="none" />
      <path d="M0 0C-19 1-20-15-11-17C-2-20 2-10 0 0Z" fill="#93b759" />
      <path d="M0 0C-1-18 13-22 17-13C21-3 10 2 0 0Z" fill="#a8c76c" />
      <path d="M0 0C18-1 24 12 15 17C5 21 1 10 0 0Z" fill="#81a54c" />
      <path d="M0 0C2 18-12 24-17 15C-22 5-10 1 0 0Z" fill="#b0ca73" />
    </g>
  );
}

function MossBody({ state = "happy", prefix }) {
  const closed = ["calm", "sleepy", "comforting"].includes(state);
  return (
    <g>
      <defs>
        <radialGradient id={`${prefix}-moss`} cx="39%" cy="27%" r="79%">
          <stop stopColor="#bfd57b" />
          <stop offset=".46" stopColor="#a1be53" />
          <stop offset=".82" stopColor="#7ea13e" />
          <stop offset="1" stopColor="#628635" />
        </radialGradient>
        <radialGradient id={`${prefix}-glow`}>
          <stop stopColor="#eef2b5" stopOpacity=".6" />
          <stop offset="1" stopColor="#e4eaa5" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="120" cy="190" rx="73" ry="10" fill="#566b36" opacity=".11" />
      {fuzz.map((p, i) => (
        <path
          key={i}
          d={`M${p.x - p.dx * 0.3} ${p.y - p.dy * 0.3}q${p.dx * 0.8 - (i % 2)} ${p.dy * 0.8} ${p.dx} ${p.dy}`}
          stroke={["#a6bf57", "#91ad43", "#bfd36b"][i % 3]}
          strokeWidth={i % 3 === 0 ? "2.6" : "1.8"}
          strokeLinecap="round"
          fill="none"
        />
      ))}
      <path d={mossOutline} fill={`url(#${prefix}-moss)`} />
      <ellipse cx="92" cy="86" rx="62" ry="46" fill={`url(#${prefix}-glow)`} />
      {moss.map((p, i) => (
        <g key={i} opacity={p.a === 0 ? 0.43 : 0.25}>
          <path
            d={`M${p.x - 2} ${p.y + 2}q0 -${p.r * 1.7} ${p.r} -${p.r * 2}m-${p.r} ${p.r * 2}q-${p.r * 1.4} -${p.r} -${p.r * 0.9} -${p.r * 2.5}`}
            stroke={p.a === 0 ? "#e0e8a3" : p.a === 1 ? "#557b34" : "#759847"}
            strokeWidth="1.15"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      ))}
      <ellipse cx="78" cy="133" rx="13" ry="8" fill="#e6a0a0" opacity=".77" />
      <ellipse cx="161" cy="133" rx="13" ry="8" fill="#e6a0a0" opacity=".77" />
      {closed ? (
        <g stroke="#324328" strokeWidth="3.3" fill="none" strokeLinecap="round">
          <path d="M88 119q6 7 12 0" />
          <path d="M140 119q6 7 12 0" />
        </g>
      ) : (
        <g fill="#293d25">
          <ellipse
            className="moli-eye"
            cx="94"
            cy="120"
            rx={state === "excited" ? 5.4 : 4.4}
            ry={state === "excited" ? 7 : 5.6}
          />
          <ellipse
            className="moli-eye"
            cx="146"
            cy="120"
            rx={state === "excited" ? 5.4 : 4.4}
            ry={state === "excited" ? 7 : 5.6}
          />
          <circle cx="95" cy="118" r="1.2" fill="#fff9d6" />
          <circle cx="147" cy="118" r="1.2" fill="#fff9d6" />
        </g>
      )}
      {state === "excited" ? (
        <path d="M111 132q10 2 19 0q-1 16-10 16t-9-16Z" fill="#3c482a" />
      ) : state === "thinking" ? (
        <ellipse cx="120" cy="137" rx="4" ry="3" fill="#4d5c32" />
      ) : (
        <path
          d="M110 134q9 10 19 0"
          stroke="#3d502b"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      )}
      {state === "sleepy" && (
        <g fill="#5b793c" fontFamily="Georgia,serif" fontStyle="italic">
          <text x="173" y="54" fontSize="20">
            z
          </text>
          <text x="189" y="35" fontSize="25">
            z
          </text>
          <text x="211" y="19" fontSize="31">
            z
          </text>
        </g>
      )}
      {state === "thinking" && (
        <g fill="#5b793c" fontFamily="Georgia,serif">
          <text x="180" y="49" fontSize="37">
            ?
          </text>
          <path
            d="M166 61q-5-6 1-9q8-4 10 4"
            stroke="#5b793c"
            strokeWidth="1"
            fill="none"
          />
        </g>
      )}
      {state === "comforting" && (
        <path
          d="M189 57C173 45 176 32 186 34q8 0 8 8q9-10 15-3q7 10-20 18"
          fill="#edb2ab"
          stroke="#d78c8b"
          strokeWidth="1.3"
        />
      )}
      {state === "excited" && (
        <>
          <Spark x={43} y={48} size={10} />
          <Spark x={183} y={32} size={13} />
          <Spark x={212} y={87} size={7} />
        </>
      )}
      {state === "happy" && (
        <>
          <path d="M103 51q-1-19 15-18q3 15-15 18Z" fill="#7c9d43" />
          <path d="M105 51q9-20 24-10q-6 14-24 10" fill="#a6c467" />
          <path d="M105 53q7-11 15-12" stroke="#6c8c3d" fill="none" />
        </>
      )}
    </g>
  );
}

export function Moli({ state = "happy", ...props }) {
  const prefix = `moli${useId().replace(/:/g, "")}`;
  return (
    <svg
      viewBox="0 0 240 220"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`MOLI feeling ${state}`}
      {...props}
    >
      <MossBody state={state} prefix={prefix} />
    </svg>
  );
}

export function Jar({ state = "happy", ...props }) {
  const prefix = `jar${useId().replace(/:/g, "")}`;
  return (
    <svg
      viewBox="0 0 360 390"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="MOLI, a fluffy little marimo, at home in a sunlit glass jar"
      {...props}
    >
      <defs>
        <linearGradient id={`${prefix}-glass`} x1="0" x2="1">
          <stop stopColor="#e7eee1" stopOpacity=".68" />
          <stop offset=".18" stopColor="#fffdf0" stopOpacity=".5" />
          <stop offset=".5" stopColor="#f5f4dc" stopOpacity=".12" />
          <stop offset=".83" stopColor="#fffdf6" stopOpacity=".72" />
          <stop offset="1" stopColor="#becfbc" stopOpacity=".35" />
        </linearGradient>
        <linearGradient id={`${prefix}-water`} x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#d5e5d2" stopOpacity=".08" />
          <stop offset="1" stopColor="#b8cfb3" stopOpacity=".5" />
        </linearGradient>
        <linearGradient id={`${prefix}-cork`} x1="0" y1="0" x2="1" y2=".6">
          <stop stopColor="#e8cb92" />
          <stop offset=".5" stopColor="#d9b47c" />
          <stop offset="1" stopColor="#bd935e" />
        </linearGradient>
        <radialGradient id={`${prefix}-halo`}>
          <stop stopColor="#faf0b5" stopOpacity=".8" />
          <stop offset="1" stopColor="#f9edb6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse
        cx="180"
        cy="210"
        rx="168"
        ry="171"
        fill={`url(#${prefix}-halo)`}
      />
      <ellipse
        cx="179"
        cy="355"
        rx="132"
        ry="19"
        fill="#b2ac7e"
        opacity=".16"
      />
      <path
        d="M107 84h146v39q1 12 20 23q39 27 36 83l-7 80q-2 38-41 43H98q-39-4-43-43l-6-79q-4-56 36-85q21-14 22-24Z"
        fill={`url(#${prefix}-glass)`}
        stroke="#bbc6af"
        strokeWidth="2"
      />
      <path
        d="M58 209q118 20 242 0l-7 100q-2 31-35 34H99q-30-4-33-33Z"
        fill={`url(#${prefix}-water)`}
      />
      <ellipse
        cx="179"
        cy="211"
        rx="122"
        ry="11"
        fill="#ecf1dd"
        opacity=".35"
        stroke="#b4cbaa"
        strokeWidth="1"
      />
      <path
        d="M81 192q-16 27-12 67l4 39"
        stroke="#fffef1"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
        opacity=".85"
      />
      <path
        d="M274 182q15 16 18 40"
        stroke="#fffef1"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        opacity=".8"
      />
      {Array.from({ length: 19 }, (_, i) => (
        <ellipse
          key={i}
          cx={86 + (i % 8) * 26 + (Math.floor(i / 8) % 2) * 8}
          cy={319 + Math.floor(i / 8) * 8}
          rx={13 + (i % 4)}
          ry={7 + (i % 3)}
          fill={["#e7dbb9", "#d0c5a5", "#f6eed2", "#c9ccb0", "#e4cba1"][i % 5]}
          stroke="#b7ac88"
          strokeWidth=".6"
          transform={`rotate(${i % 2 ? 12 : -11} ${86 + (i % 8) * 26} ${319 + Math.floor(i / 8) * 8})`}
        />
      ))}
      <g className="jar-moli" transform="translate(75 151) scale(.87)">
        <MossBody state={state} prefix={`${prefix}-body`} />
      </g>
      <path
        d="M106 86h147l-4 24H111Z"
        fill={`url(#${prefix}-cork)`}
        stroke="#b48b5c"
        strokeWidth="1.5"
      />
      <ellipse
        cx="180"
        cy="85"
        rx="75"
        ry="11"
        fill="#ecd5aa"
        stroke="#c4a16e"
        strokeWidth="1.2"
      />
      {Array.from({ length: 37 }, (_, i) => (
        <path
          key={i}
          d={`M${114 + i * 3.5} ${91 + (i % 4) * 3}l${2 + (i % 3)} ${i % 2 ? 1 : -1}`}
          stroke="#a88253"
          strokeWidth=".75"
          opacity=".5"
        />
      ))}
      <path
        d="M101 112q79 9 158 0l2 11q-80 12-162 0Z"
        fill="#edf0df"
        fillOpacity=".7"
        stroke="#bdc6ae"
        strokeWidth="1.5"
      />
      <path
        d="M112 115q63 8 130 1"
        stroke="white"
        strokeWidth="3"
        opacity=".7"
        fill="none"
      />
      <path
        d="M258 120q25 20 19 63"
        fill="none"
        stroke="#b18e5c"
        strokeWidth="2"
      />
      <g transform="translate(275 184) rotate(-13)">
        <rect
          x="-20"
          y="-12"
          width="45"
          height="62"
          rx="6"
          fill="#faf2d7"
          stroke="#d3b884"
          strokeWidth="1.5"
        />
        <circle cy="-4" r="2.4" fill="#b99965" />
        <Clover x={3} y={19} scale={0.63} />
      </g>
      <path
        d="M93 345q90 14 175 0"
        stroke="#fffdf0"
        strokeWidth="3"
        fill="none"
        opacity=".8"
      />
      <Spark x={52} y={130} size={11} />
      <Spark x={305} y={96} size={8} />
      <Spark x={319} y={261} size={12} />
      <Spark x={70} y={271} size={6} color="#fffbea" />
      <circle cx="95" cy="216" r="3" fill="none" stroke="#fdfcf2" />
      <circle cx="104" cy="191" r="5" fill="none" stroke="#fdfcf2" />
      <circle cx="249" cy="270" r="3.6" fill="none" stroke="#fdfcf2" />
      <g transform="translate(18 304) rotate(-20)">
        <path
          d="M0 48q21-28 43-42"
          stroke="#899e59"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M16 29Q-5 24 5 9q20 0 11 20M28 16Q20-3 36-8q15 11-8 24M34 17Q49-2 60 10q-2 16-26 7M7 43Q-9 42-6 29q16-7 13 14"
          fill="#a1b777"
          opacity=".8"
        />
      </g>
      <g transform="translate(282 337)">
        <Clover scale={0.8} />
      </g>
    </svg>
  );
}

function TarotScene({ id, prefix }) {
  const night = ["star", "moon"].includes(id);
  const sky = night
    ? id === "star"
      ? "#6e8990"
      : "#717b93"
    : id === "lovers"
      ? "#eed3c4"
      : ["world", "empress"].includes(id)
        ? "#e5e9c6"
        : "#f7e8ad";
  return (
    <>
      <defs>
        <linearGradient id={`${prefix}-sky`} x2="0" y2="1">
          <stop stopColor={sky} />
          <stop offset="1" stopColor={night ? "#b8cbb3" : "#fff7d8"} />
        </linearGradient>
      </defs>
      <rect
        x="13"
        y="13"
        width="154"
        height="254"
        rx="11"
        fill={`url(#${prefix}-sky)`}
      />
      {night &&
        Array.from({ length: 20 }, (_, i) => (
          <Spark
            key={i}
            x={25 + ((i * 37) % 132)}
            y={29 + ((i * 23) % 137)}
            size={i % 3 === 0 ? 3 : 1.5}
            color="#fff5c8"
          />
        ))}
      {id === "star" && (
        <>
          <path
            d="M91 39l5 28 23-10-17 21 26 6-28 6 9 23-18-17-16 19 8-26-27-6 27-6-8-23 13 15Z"
            fill="#f7d879"
            stroke="#fff0b9"
            strokeWidth="1.8"
          />
          <path d="M91 49v47M69 83h44" stroke="#fff5d5" strokeWidth="1.4" />
          <path
            d="M16 162q27-25 48-2q28-35 57-4q27-21 44 0v38H16Z"
            fill="#e6ebdf"
            opacity=".8"
          />
          <path d="M15 212q43-18 81 3q30 14 69-2v43H15Z" fill="#9eaf8b" />
          <path
            d="M34 244q20-30 45-25q20 10 41-1q20 1 41 12"
            stroke="#e9ebc9"
            strokeWidth="3"
            fill="none"
          />
        </>
      )}
      {id === "sun" && (
        <>
          <g stroke="#dab65c" strokeWidth="2" strokeLinecap="round">
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return (
                <path
                  key={i}
                  d={`M${90 + Math.cos(a) * 37} ${78 + Math.sin(a) * 37}L${90 + Math.cos(a) * 48} ${78 + Math.sin(a) * 48}`}
                />
              );
            })}
          </g>
          <circle
            cx="90"
            cy="78"
            r="29"
            fill="#f4cb68"
            stroke="#e2b95a"
            strokeWidth="1.4"
          />
          <path
            d="M79 77q3-4 6 0m12 0q3-4 6 0m-20 11q7 7 14 0"
            fill="none"
            stroke="#b5893d"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path d="M15 204q40-36 81-5q36-25 69-9v66H15Z" fill="#b7c87c" />
          <path
            d="M29 230q3-39 6-72m-5 45q-13-16-14-8q1 13 16 16m3-29q10-15 15-7q2 11-15 17"
            stroke="#8b9c50"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="36" cy="157" r="13" fill="#e8b95b" />
          <circle cx="36" cy="157" r="5" fill="#9f8740" />
        </>
      )}
      {id === "moon" && (
        <>
          <path
            d="M108 37C73 36 57 70 72 94q20 30 47 9q-31 0-34-27q-3-23 23-39Z"
            fill="#f6e7ab"
            stroke="#fff3c6"
            strokeWidth="1"
          />
          <path
            d="M15 193q26-46 58-14l24-22 28 30 41-17v86H15Z"
            fill="#aab7a2"
          />
          <path d="M15 219q57-25 94-6q28 16 57 4v39H15Z" fill="#bdccbf" />
          <path
            d="M30 243q46-14 98-3m-77 10q21-5 58-2"
            stroke="#e7e9ce"
            strokeWidth="2"
            fill="none"
          />
        </>
      )}
      {id === "lovers" && (
        <>
          <path
            d="M88 111C40 83 39 51 58 47q23-3 29 18q10-25 31-15q26 17-30 61Z"
            fill="#e6a6a4"
            stroke="#d79795"
            strokeWidth="1.5"
          />
          <path
            d="M43 138q-25-16-18-31q12-10 18 4q10-15 19-5q8 11-19 32m88-6q-21-12-15-24q10-9 16 2q8-12 16-4q6 9-17 26"
            fill="#eebfba"
          />
          <path d="M15 216q38-28 78-6q33-24 73-8v54H15Z" fill="#b9c591" />
          <g transform="translate(-4 151) scale(.45)">
            <MossBody state="comforting" prefix={`${prefix}-one`} />
          </g>
          <g transform="translate(76 150) scale(.45)">
            <MossBody state="happy" prefix={`${prefix}-two`} />
          </g>
        </>
      )}
      {id === "empress" && (
        <>
          <circle cx="130" cy="49" r="16" fill="#f2df9b" opacity=".8" />
          <path
            d="M24 227V112q1-65 66-70q65 5 66 70v115"
            fill="none"
            stroke="#b0be87"
            strokeWidth="5"
          />
          <path
            d="M30 216V113q1-59 60-64q59 5 60 64v103"
            fill="none"
            stroke="#e2d7aa"
            strokeWidth="1.5"
          />
          <path d="M15 222q28-22 59-9q37-24 92-3v46H15Z" fill="#b4c58f" />
          <path d="M17 241q41-20 75-6q39-17 73-4v25H17Z" fill="#c4ce9d" />
          {Array.from({ length: 16 }, (_, i) => {
            const angle = Math.PI + (i / 15) * Math.PI;
            const x = 90 + Math.cos(angle) * 64;
            const y = 115 + Math.sin(angle) * 66;
            return (
              <g
                key={i}
                transform={`translate(${x} ${y}) rotate(${(angle * 180) / Math.PI + 90})`}
              >
                <path
                  d="M0 0q-15-17-21-4q2 14 21 4m0 0q15-17 21-4q-2 14-21 4"
                  fill={i % 2 ? "#96ad6c" : "#b2c489"}
                />
                {i % 3 === 0 && (
                  <g>
                    <circle cx="-5" cy="-2" r="5" fill="#edc7ba" />
                    <circle cx="3" cy="-5" r="5" fill="#f3d7c4" />
                    <circle cx="5" cy="3" r="5" fill="#e7b9ae" />
                    <circle cx="-3" cy="5" r="5" fill="#f1d1be" />
                    <circle r="3" fill="#d5b765" />
                  </g>
                )}
              </g>
            );
          })}
          {[
            [35, 166],
            [144, 181],
            [24, 219],
            [151, 231],
          ].map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`}>
              <path
                d="M0 0q-2 12 2 22m-1-7q-12-11-13-2q4 8 13 2m0-7q10-12 13-4q-2 8-13 4"
                fill="#99b16d"
                stroke="#81995a"
                strokeWidth=".7"
              />
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse
                  key={a}
                  cx="0"
                  cy="-5"
                  rx="3.8"
                  ry="6"
                  fill={i % 2 ? "#efd0b6" : "#e6b8b0"}
                  transform={`rotate(${a})`}
                />
              ))}
              <circle r="3" fill="#e5c56e" />
            </g>
          ))}
          <Spark x={91} y={84} size={7} color="#d7b96d" />
          <path
            d="M73 124q17-14 34 0m-29 4q12-8 24 0"
            stroke="#f9f1d7"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}
      {id === "world" && (
        <>
          <ellipse
            cx="90"
            cy="133"
            rx="55"
            ry="94"
            fill="none"
            stroke="#98ac67"
            strokeWidth="3"
          />
          {Array.from({ length: 22 }, (_, i) => {
            const a = (i / 22) * Math.PI * 2;
            return (
              <g
                key={i}
                transform={`translate(${90 + Math.cos(a) * 55} ${133 + Math.sin(a) * 94}) rotate(${(a * 180) / Math.PI + 35})`}
              >
                <path
                  d="M0 0Q-16-13-19 0Q-9 10 0 0M0 0Q12-15 18-5Q15 8 0 0"
                  fill={i % 2 ? "#9bb360" : "#b4c57a"}
                />
                {i % 4 === 0 && <circle r="3.5" fill="#e6b9a0" />}
              </g>
            );
          })}
          <path d="M32 238q58-31 116 0v18H32Z" fill="#c4ce94" />
        </>
      )}
      {id === "fool" && (
        <>
          <path
            d="M15 63q30-18 53 0q13-13 29-2m21 41q21-15 48 0"
            stroke="#fff9e5"
            strokeWidth="13"
            strokeLinecap="round"
            fill="none"
          />
          <path d="M15 178l36-36 42 37 30-52 43 50v79H15Z" fill="#b2c5aa" />
          <path d="M15 210q36-23 78-7q22 10 73-9v62H15Z" fill="#d2d4aa" />
          <path
            d="M98 256q38-37 14-52q-16-13-1-26"
            stroke="#f2e3b7"
            strokeWidth="17"
            fill="none"
          />
          <path
            d="M136 189l-15-37m3 7q15-10 23-1"
            stroke="#957b4a"
            strokeWidth="2.2"
            fill="none"
          />
          <path d="M145 158q15 13 2 19q-14-1-2-19Z" fill="#d7a787" />
        </>
      )}
      {id !== "lovers" && (
        <g
          transform={`translate(${id === "world" ? 37 : 35} ${id === "world" ? 139 : 165}) scale(.46)`}
        >
          <MossBody
            state={
              id === "sun"
                ? "excited"
                : id === "moon"
                  ? "calm"
                  : id === "empress"
                    ? "calm"
                    : id === "fool"
                      ? "thinking"
                      : "happy"
            }
            prefix={`${prefix}-body`}
          />
        </g>
      )}
      {id === "empress" && (
        <g stroke="#bb9a53" strokeWidth="1.1" strokeLinejoin="round">
          <path d="M75 184l-2-14 10 7 8-13 7 13 10-7-2 14Z" fill="#e7cb83" />
          <path d="M77 185h27" strokeWidth="3" />
          <circle cx="91" cy="179" r="2" fill="#d9a99c" stroke="none" />
        </g>
      )}
      {["star", "sun", "world"].includes(id) && (
        <>
          <path
            d="M28 248q-4-24-11-33m12 21q-17-8-13-16q15-3 13 16m0-1q10-18 17-10q2 9-17 10"
            stroke="#819852"
            strokeWidth="1"
            fill="#a9bc72"
          />
          <path
            d="M150 250q1-24 12-40m-9 26q-13-15-16-5q1 11 16 5"
            stroke="#819852"
            strokeWidth="1"
            fill="#b2c47f"
          />
        </>
      )}
    </>
  );
}

export function TarotArt({ id = "star", ...props }) {
  const prefix = `tarot${useId().replace(/:/g, "")}`;
  const names = {
    star: "The Star",
    sun: "The Sun",
    moon: "The Moon",
    lovers: "The Lovers",
    empress: "The Empress",
    world: "The World",
    fool: "The Fool",
  };
  return (
    <svg
      viewBox="0 0 180 280"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`${names[id] || "The Star"} tarot illustration with MOLI`}
      {...props}
    >
      <rect
        x="2"
        y="2"
        width="176"
        height="276"
        rx="15"
        fill="#fff4d8"
        stroke="#d1ac68"
        strokeWidth="1.5"
      />
      <rect
        x="7"
        y="7"
        width="166"
        height="266"
        rx="12"
        fill="none"
        stroke="#ddc18a"
        strokeWidth=".8"
      />
      <TarotScene id={id} prefix={prefix} />
      <rect
        x="13"
        y="13"
        width="154"
        height="254"
        rx="10"
        fill="none"
        stroke="#caac70"
        strokeWidth=".9"
      />
      <Spark x={20} y={23} size={5} color="#d7b573" />
      <Spark x={160} y={23} size={5} color="#d7b573" />
      <Spark x={20} y={257} size={5} color="#d7b573" />
      <Spark x={160} y={257} size={5} color="#d7b573" />
    </svg>
  );
}

export function CardBack(props) {
  return (
    <svg
      viewBox="0 0 180 280"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <rect
        x="2"
        y="2"
        width="176"
        height="276"
        rx="15"
        fill="#fff2d4"
        stroke="#d4b275"
        strokeWidth="1.6"
      />
      <rect
        x="9"
        y="9"
        width="162"
        height="262"
        rx="10"
        fill="#8fa58a"
        stroke="#dfc58b"
        strokeWidth="1.3"
      />
      <rect
        x="15"
        y="15"
        width="150"
        height="250"
        rx="7"
        stroke="#eee0b0"
        strokeWidth=".9"
        fill="none"
      />
      {Array.from({ length: 20 }, (_, i) => (
        <Spark
          key={i}
          x={25 + ((i * 31) % 129)}
          y={28 + ((i * 37) % 225)}
          size={i % 3 === 0 ? 4 : 2}
          color="#e6d39c"
          opacity=".8"
        />
      ))}
      <path
        d="M91 86l8 42 36-17-27 33 41 11-45 8 15 37-29-28-27 30 12-43-42-8 43-10-13-37 23 23Z"
        fill="#edcf86"
        stroke="#fff0ba"
        strokeWidth="1.2"
      />
      <path d="M91 101v79m-41-27h81" stroke="#fff0c8" strokeWidth="1.2" />
      <path
        d="M95 37q-18 1-15 17q3 13 17 8q-11-3-10-13q0-7 8-12m0 181q-18 1-15 17q3 13 17 8q-11-3-10-13q0-7 8-12"
        fill="#f3df9c"
      />
      <path
        d="M25 36l8-11m-8 0 8 11m114-11 8 11m-8 0 8-11M25 245l8 10m-8 0 8-10m114 0 8 10m-8 0 8-10"
        stroke="#e6d39c"
        strokeWidth="1.3"
      />
    </svg>
  );
}

function Outfit({ value }) {
  if (value === "Soft Scarf")
    return (
      <g>
        <path
          d="M24 14q13 17 32 2l7 15q-8 10-27 6l6 28H23l-2-35Z"
          fill="#e6c4af"
        />
        <path d="M31 29l20 35 13-8-20-30" fill="#ebd6bb" />
        <path d="M25 60v9m6-9v9m6-9v9m17-9 4 7m1-10 4 7" stroke="#b29476" />
      </g>
    );
  const fill =
    value === "White Shirt"
      ? "#fffaf0"
      : value === "Denim Jacket"
        ? "#a8bdc6"
        : value === "Pastel Hoodie"
          ? "#d8c7d7"
          : value === "Knit Sweater"
            ? "#e7d6b0"
            : "#bdce9a";
  return (
    <g stroke="#73835f" strokeWidth="1.4" strokeLinejoin="round">
      <path
        d="M27 17l-15 9-7 27 13 4 7-17-2 26h34l-2-26 7 17 13-4-8-27-15-9q-12 8-25 0Z"
        fill={fill}
      />
      <path d="M28 18q12 21 24 0" fill="none" />
      {value === "Cozy Cardigan" || value === "Denim Jacket" ? (
        <>
          <path d="M40 28v38M28 46h-1v9h9v-9Zm24 0h-7v9h9v-9Z" fill="none" />
          <path d="M30 18l10 12-7 8m17-20L40 30l7 8" fill="none" />
          {[39, 47, 55, 62].map((y) => (
            <circle key={y} cx="40" cy={y} r=".7" fill="#73835f" />
          ))}
        </>
      ) : value === "Pastel Hoodie" ? (
        <>
          <path
            d="M28 19q12-23 24 0m-20 8v13m16-13v13M29 52l6-7h10l6 7v8H29Z"
            fill="none"
          />
        </>
      ) : value === "White Shirt" ? (
        <path d="M28 18l8 16 4-6 5 6 7-16M40 28v38" fill="none" />
      ) : (
        <>
          <path d="M26 57h29M26 61h29M10 47l10 4m41 0 10-4" fill="none" />
          {[30, 36, 42, 48].map((y) => (
            <path
              key={y}
              d={`M28 ${y}l3 3 3-3 3 3 3-3 3 3 3-3 3 3 3-3`}
              fill="none"
              opacity=".45"
            />
          ))}
        </>
      )}
    </g>
  );
}

function Food({ value }) {
  if (value === "Strawberry Cake")
    return (
      <g stroke="#b48b68" strokeWidth="1.4" strokeLinejoin="round">
        <ellipse cx="40" cy="66" rx="31" ry="6" fill="#e8d8bc" />
        <path d="M15 41l37-17 12 19v19H15Z" fill="#efd8b1" />
        <path d="M15 48h49v8H15Z" fill="#e9aba2" />
        <path
          d="M15 41q8 7 12 0q8 7 13 0q8 7 13 0q6 6 11 2L52 24Z"
          fill="#fff9e9"
        />
        <path d="M42 27q-9-14 1-17q15-3 9 12Z" fill="#db8881" />
        <path d="M43 12l-2-7 7 4 4-3-1 7" stroke="#6e8d4f" fill="#8ca75e" />
        <path d="M44 18h1m1 5h1m3-6h1" stroke="#fff0ca" />
      </g>
    );
  if (value === "Chocolate Cookie")
    return (
      <g stroke="#a78150" strokeWidth="1.4">
        <circle cx="39" cy="40" r="27" fill="#d4b17c" />
        <path
          d="M18 27q21-24 44 5"
          fill="none"
          stroke="#e4c79a"
          strokeWidth="3"
        />
        {[
          [30, 24],
          [44, 38],
          [25, 49],
          [49, 55],
          [57, 28],
          [34, 59],
          [20, 36],
        ].map(([x, y], i) => (
          <path
            key={i}
            d={`M${x} ${y}l7 2-2 7-7-3Z`}
            fill="#826247"
            stroke="none"
          />
        ))}
      </g>
    );
  if (value === "Fresh Strawberries")
    return (
      <g stroke="#b7776f" strokeWidth="1.2">
        <path d="M16 32q22-15 27 9q0 17-16 25q-17-12-11-34" fill="#df9890" />
        <path d="M35 21q22-15 29 10q2 17-13 28q-20-9-16-38" fill="#e8aaa0" />
        <path
          d="M17 33l6-10 4 9 9-5-4 11-8-3Zm20-11 7-9 3 8 10-6-3 12-8-3Z"
          fill="#91a86b"
          stroke="#718e50"
        />
        {[
          [22, 42],
          [30, 47],
          [24, 56],
          [43, 34],
          [53, 34],
          [47, 44],
        ].map(([x, y], i) => (
          <path key={i} d={`M${x} ${y}v2`} stroke="#fff0cc" strokeWidth="2" />
        ))}
      </g>
    );
  const latte = value === "Matcha Latte";
  const tea = value === "Peach Tea";
  return (
    <g stroke="#9a9977" strokeWidth="1.4">
      <ellipse cx="38" cy="66" rx="28" ry="5" fill="#e7ddbf" />
      {tea ? (
        <>
          <path d="M22 23h33l-3 39H26Z" fill="#efd8ad" />
          <path d="M26 36h26l-2 23H28Z" fill="#e6bd8d" />
          <ellipse cx="38" cy="23" rx="16" ry="4" fill="#faf1d5" />
          <path d="M39 23l8-16" stroke="#92a278" strokeWidth="3" />
          <path d="M23 43q-15-2-12 11q4 8 13-1" fill="#e9b49c" />
        </>
      ) : (
        <>
          <path
            d="M17 26h39l-4 32q-13 11-31 0Z"
            fill={latte ? "#d3dda9" : "#eee7d9"}
          />
          <path d="M55 31q20-4 12 15q-5 7-13 2" fill="none" strokeWidth="3" />
          <ellipse
            cx="37"
            cy="26"
            rx="19"
            ry="6"
            fill={latte ? "#92af69" : "#b8acc2"}
          />
          {latte ? (
            <path
              d="M28 26q3-8 9 0q6-8 10-1q-2 5-10 5Z"
              fill="#eaf0d3"
              stroke="none"
            />
          ) : (
            <>
              {[
                [28, 25],
                [38, 22],
                [44, 28],
              ].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="4" fill="#7e839e" />
              ))}
            </>
          )}
          <path
            d="M29 15q-7-5 0-11m11 11q-6-5 0-11"
            fill="none"
            stroke="#c0c4a6"
          />
        </>
      )}
    </g>
  );
}

function Charm({ value }) {
  if (value === "Lucky Clover") return <Clover x={40} y={33} scale={1.25} />;
  if (value === "Silver Necklace")
    return (
      <g stroke="#a2a7a0" strokeWidth="2" fill="none">
        <path d="M21 13q-17 44 18 47q37-3 20-47" />
        <path d="M39 54l8 10-8 10-8-10Z" fill="#d9e1d6" />
        <path d="M22 15l3 7m-2 5 4 5m1 7 5 3m18-2 5-4m1-8 4-6" />
      </g>
    );
  if (value === "Star Keychain")
    return (
      <g stroke="#b89757" strokeWidth="1.5">
        <circle cx="35" cy="18" r="10" fill="none" strokeWidth="3" />
        <path d="M36 28l8 12" fill="none" />
        <path
          d="M45 33l7 14 16 2-12 12 3 16-14-8-15 8 3-17-12-11 17-2Z"
          fill="#e8ce87"
          transform="translate(0 -7)"
        />
      </g>
    );
  if (value === "Cute Hair Clip")
    return (
      <g stroke="#b8928c" strokeWidth="1.5">
        <rect
          x="12"
          y="35"
          width="56"
          height="15"
          rx="7"
          fill="#e9c2b7"
          transform="rotate(-15 40 40)"
        />
        <path
          d="M28 37q-14-26-20-10q-2 13 20 10q17-24 23-10q2 13-23 10"
          fill="#f2d9bd"
        />
        <circle cx="28" cy="36" r="4" fill="#d8af9c" />
      </g>
    );
  if (value === "Green Bracelet")
    return (
      <g>
        {Array.from({ length: 13 }, (_, i) => {
          const a = (i / 13) * Math.PI * 2;
          return (
            <circle
              key={i}
              cx={40 + Math.cos(a) * 24}
              cy={40 + Math.sin(a) * 23}
              r="6.3"
              fill={["#9aae75", "#b7c995", "#7f9b67"][i % 3]}
              stroke="#72885b"
              strokeWidth=".8"
            />
          );
        })}
        <path d="M49 60l7 6-5 9-6-9Z" fill="#e0c37c" stroke="#ad955e" />
      </g>
    );
  return (
    <g stroke="#8a9a65" strokeWidth="1.4">
      <path
        d="M39 43v29m0-14q-21-16-23-2q8 12 23 2m0 6q18-20 23-7q-5 12-23 7"
        fill="#b9c58d"
      />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <ellipse
          key={a}
          cx="40"
          cy="21"
          rx="8"
          ry="12"
          fill="#f2d7bf"
          stroke="#d4b59a"
          transform={`rotate(${a} 40 34)`}
        />
      ))}
      <circle cx="40" cy="34" r="8" fill="#e9cc75" stroke="#c5aa64" />
    </g>
  );
}

export function ItemIcon({ type, value, ...props }) {
  return (
    <svg
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {type === "outfit" ? (
        <Outfit value={value} />
      ) : type === "food" ? (
        <Food value={value} />
      ) : type === "charm" ? (
        <Charm value={value} />
      ) : (
        <>
          <path
            d="M40 66V34m0 17q-30-23-27-5q4 15 27 5m0-9q23-30 27-11q-1 17-27 11"
            fill="#a8bd75"
            stroke="#789553"
            strokeWidth="1.5"
          />
          <Spark x={17} y={17} size={7} />
        </>
      )}
    </svg>
  );
}

function Branch({ x, y, rotate = 0, scale = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      <path
        d="M0 125Q14 63 68 0"
        stroke="#8c9e60"
        strokeWidth="2"
        fill="none"
      />
      {[
        [4, 103, -45],
        [15, 81, 30],
        [25, 63, -30],
        [40, 42, 40],
        [53, 24, -20],
      ].map(([x1, y1, r], i) => (
        <g key={i} transform={`translate(${x1} ${y1}) rotate(${r})`}>
          <path
            d="M0 0Q-30-15-20-35Q5-32 0 0"
            fill={i % 2 ? "#b7c58b" : "#a3b779"}
            opacity=".8"
          />
          <path
            d="M0 0l-15-27"
            stroke="#829861"
            strokeWidth=".8"
            opacity=".7"
          />
        </g>
      ))}
    </g>
  );
}

export function BotanicalCorners(props) {
  return (
    <svg
      className="botanical-corners"
      viewBox="0 0 600 900"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <g opacity=".62">
        <Branch x={-16} y={57} rotate={-35} scale={1.2} />
        <Branch x={600} y={88} rotate={145} scale={1.2} />
        <Branch x={-12} y={777} rotate={-20} scale={1.2} />
        <Branch x={617} y={725} rotate={35} scale={1.3} />
      </g>
      <g opacity=".5">
        <Spark x={44} y={262} size={8} />
        <Spark x={550} y={350} size={9} />
        <Spark x={58} y={663} size={7} />
        <Spark x={518} y={744} size={6} />
        <circle cx="82" cy="162" r="3" fill="#d4b570" />
        <circle cx="538" cy="570" r="3" fill="#d4b570" />
      </g>
    </svg>
  );
}
