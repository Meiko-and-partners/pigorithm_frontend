import { linePaths } from "@/lib/chart";

interface LineChartProps {
  values: number[];
  /** Unique id for the area gradient on this page. */
  gradientId: string;
  /** Rendered height in px; the chart stretches to the card's width. */
  height: number;
  /** viewBox height (the design uses 150 or 160). */
  viewHeight?: number;
  /** Inner padding of the plot, in viewBox units. */
  pad?: number;
  /** Line colour. */
  stroke: string;
  /** Area gradient colour; defaults to the line colour. */
  fill?: string;
  label: string;
}

const VIEW_WIDTH = 340;

/** Line with a fading area fill, stretched to its container. */
export function LineChart({
  values,
  gradientId,
  height,
  viewHeight = 150,
  pad = 12,
  stroke,
  fill = stroke,
  label,
}: LineChartProps) {
  const { line, area } = linePaths(values, VIEW_WIDTH, viewHeight, pad);
  return (
    <svg
      className="chartsvg"
      viewBox={`0 0 ${VIEW_WIDTH} ${viewHeight}`}
      height={height}
      preserveAspectRatio="none"
      role="img"
      aria-label={label}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={fill} stopOpacity="0.16" />
          <stop offset="1" stopColor={fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Evenly spaced x-axis labels under a line chart. */
export function AxisLabels({ labels }: { labels: string[] }) {
  return (
    <div className="axisrow">
      {labels.map((l) => (
        <span key={l}>{l}</span>
      ))}
    </div>
  );
}
