import type { ReactNode } from "react";
import { donutSegments } from "@/lib/chart";

interface DonutChartProps {
  segments: { value: number; color: string }[];
  /** Content in the hole, e.g. the headline percentage. */
  children: ReactNode;
  label: string;
}

const SIZE = 154;
const RADIUS = 56;
const STROKE = 15;

/** Ring chart with a label in the centre (Herd Health). */
export function DonutChart({ segments, children, label }: DonutChartProps) {
  const center = SIZE / 2;
  return (
    <div className="donutwrap">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={label}>
        <circle cx={center} cy={center} r={RADIUS} fill="none" stroke="var(--line2)" strokeWidth={STROKE} />
        <g transform={`rotate(-90 ${center} ${center})`}>
          {donutSegments(segments, RADIUS).map((s) => (
            <circle
              key={s.color}
              cx={center}
              cy={center}
              r={RADIUS}
              fill="none"
              stroke={s.color}
              strokeWidth={STROKE}
              strokeDasharray={s.dashArray}
              strokeDashoffset={s.dashOffset}
              strokeLinecap="round"
            />
          ))}
        </g>
      </svg>
      <div className="donutcenter">{children}</div>
    </div>
  );
}
