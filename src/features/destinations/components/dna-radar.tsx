import type { Dna, DnaKey } from "@/types";

const AXES: { key: DnaKey; label: string }[] = [
  { key: "adventure", label: "Adventure" },
  { key: "culture", label: "Culture" },
  { key: "food", label: "Food" },
  { key: "nature", label: "Nature" },
  { key: "nightlife", label: "Nightlife" },
  { key: "budgetFriendly", label: "Budget" },
];

const SIZE = 280;
const CENTER = SIZE / 2;
const MAX_R = CENTER - 52;

function point(i: number, frac: number): [number, number] {
  const angle = ((-90 + i * 60) * Math.PI) / 180;
  return [
    CENTER + MAX_R * frac * Math.cos(angle),
    CENTER + MAX_R * frac * Math.sin(angle),
  ];
}

function polygon(fracs: number[]): string {
  return fracs.map((f, i) => point(i, f).join(",")).join(" ");
}

// Lightweight, dependency-free SVG radar (perf budget). Includes a text-table
// equivalent for screen readers (09_ACCESSIBILITY_BASELINE.md §4).
export function DnaRadar({ dna, name }: { dna: Dna; name: string }) {
  const valueFracs = AXES.map((a) => dna[a.key] / 100);
  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <figure className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="w-full max-w-[320px]"
        role="img"
        aria-label={`Travel DNA for ${name}`}
      >
        {gridLevels.map((level) => (
          <polygon
            key={level}
            points={polygon(AXES.map(() => level))}
            className="fill-none"
            stroke="var(--border)"
            strokeWidth={1}
          />
        ))}
        {AXES.map((axis, i) => {
          const [x, y] = point(i, 1);
          return (
            <line
              key={axis.key}
              x1={CENTER}
              y1={CENTER}
              x2={x}
              y2={y}
              stroke="var(--border)"
              strokeWidth={1}
            />
          );
        })}
        <polygon
          points={polygon(valueFracs)}
          fill="rgba(200,169,126,0.28)"
          stroke="var(--accent-gold)"
          strokeWidth={2}
        />
        {AXES.map((axis, i) => {
          const [x, y] = point(i, 1);
          const dot = point(i, valueFracs[i] ?? 0);
          return (
            <g key={axis.key}>
              <circle cx={dot[0]} cy={dot[1]} r={3} fill="var(--accent-gold-text)" />
              <text
                x={point(i, 1.18)[0]}
                y={point(i, 1.18)[1]}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-current text-[11px]"
                fill="var(--muted-foreground)"
                aria-hidden="true"
              >
                {axis.label}
              </text>
            </g>
          );
        })}
      </svg>

      <figcaption className="sr-only">
        <table>
          <caption>Travel DNA scores for {name} (out of 100)</caption>
          <tbody>
            {AXES.map((a) => (
              <tr key={a.key}>
                <th scope="row">{a.label}</th>
                <td>{dna[a.key]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  );
}
