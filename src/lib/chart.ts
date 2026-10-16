/** SVG path helpers for the line and donut charts (ported from the design). */

export interface LinePaths {
  line: string;
  area: string;
}

/**
 * Scales `values` into a `width` × `height` box with `pad` px of padding and
 * returns the stroke path and the filled area beneath it.
 */
export function linePaths(
  values: number[],
  width: number,
  height: number,
  pad = 10,
): LinePaths {
  const n = values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = (width - pad * 2) / (n - 1);
  const points = values.map((v, i) => [
    pad + i * step,
    height - pad - ((v - min) / range) * (height - pad * 2),
  ]);
  const line =
    "M " + points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ");
  const area = `${line} L ${points[n - 1][0].toFixed(1)} ${height - pad} L ${points[0][0].toFixed(1)} ${height - pad} Z`;
  return { line, area };
}

export interface DonutSegment {
  color: string;
  dashArray: string;
  dashOffset: string;
}

/** Stroke dash settings that draw each value as an arc of one circle. */
export function donutSegments(
  segments: { value: number; color: string }[],
  radius: number,
): DonutSegment[] {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;
  return segments.map(({ value, color }) => {
    const fraction = value / total;
    const dash = fraction * circumference;
    const segment = {
      color,
      dashArray: `${dash.toFixed(1)} ${(circumference - dash).toFixed(1)}`,
      dashOffset: (-cumulative * circumference).toFixed(1),
    };
    cumulative += fraction;
    return segment;
  });
}
