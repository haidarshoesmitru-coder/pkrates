import { cn } from "@/lib/utils";

export function Sparkline({
  data,
  className,
  positive = true,
}: {
  data: number[];
  className?: string;
  positive?: boolean;
}) {
  const width = 100;
  const height = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((value, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("h-8 w-full", className)}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polygon
        points={areaPoints}
        className={positive ? "fill-pulse-500/10" : "fill-fall-500/10"}
      />
      <polyline
        points={points}
        fill="none"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={positive ? "stroke-pulse-500" : "stroke-fall-500"}
      />
    </svg>
  );
}
