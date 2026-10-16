interface Datum {
  label: string;
  value: number;
}

/** Vertical bars on a 0–100 scale (activity index by barn). */
export function ColumnChart({ data }: { data: Datum[] }) {
  return (
    <div className="barchart">
      {data.map((d) => (
        <div className="barcol" key={d.label}>
          <div className="barval">{d.value}</div>
          <div className="bartrack">
            <div className="bar" style={{ height: `${d.value}%` }} />
          </div>
          <div className="barlabel">{d.label}</div>
        </div>
      ))}
    </div>
  );
}

/** Horizontal bars scaled to the largest value (alerts by type). */
export function HorizontalBarList({ data }: { data: Datum[] }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div>
      {data.map((d) => (
        <div className="hbar" key={d.label}>
          <div className="hbarhead">
            <span>{d.label}</span>
            <span className="hbarval">{d.value}</span>
          </div>
          <div className="hbartrack">
            <div className="hbarfill" style={{ width: `${((d.value / max) * 100).toFixed(0)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
