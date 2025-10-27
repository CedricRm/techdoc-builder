"use client";

import { useId, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjectsTrends } from "@/features/projects/hooks/useProjectsTrends";

type Point = { x: number; y: number; date?: string };

function AreaSparkline({
  points,
  minY = 0,
  maxY = 100,
}: {
  points: Point[];
  minY?: number;
  maxY?: number;
}) {
  const svgId = useId();
  const PADDING = 12;
  const WIDTH = 600;
  const HEIGHT = 200;
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{
    left: number;
    top: number;
    label: string;
  } | null>(null);

  const { path, gradientId, scaled } = useMemo(() => {
    if (!points.length)
      return {
        path: "",
        gradientId: "grad-empty",
        scaled: [] as Array<{ x: number; y: number; date?: string; v: number }>,
      };

    const xs = points.map((p) => p.x);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const rangeX = Math.max(1, maxX - minX);
    const rangeY = Math.max(1, maxY - minY);
    const scaleX = (x: number) =>
      ((x - minX) / rangeX) * (WIDTH - PADDING * 2) + PADDING;
    const scaleY = (y: number) =>
      HEIGHT - ((y - minY) / rangeY) * (HEIGHT - PADDING * 2) - PADDING;

    const d = points
      .map((p, i) => `${i === 0 ? "M" : "L"}${scaleX(p.x)},${scaleY(p.y)}`)
      .join(" ");
    const area = `${d} L ${scaleX(points[points.length - 1].x)},${scaleY(
      minY
    )} L ${scaleX(points[0].x)},${scaleY(minY)} Z`;
    const gid = `grad-${svgId}`;
    const scaledPts = points.map((p) => ({
      x: scaleX(p.x),
      y: scaleY(p.y),
      date: p.date,
      v: p.y,
    }));
    return { path: area, gradientId: gid, scaled: scaledPts };
  }, [points, minY, maxY, svgId]);

  const onMove: React.MouseEventHandler<SVGSVGElement> = (e) => {
    if (!scaled.length) return;
    const rect = (e.target as SVGElement)
      .closest("svg")!
      .getBoundingClientRect();
    const x = e.clientX - rect.left;
    // Find closest point by X
    let idx = 0;
    let best = Infinity;
    for (let i = 0; i < scaled.length; i++) {
      const d = Math.abs(scaled[i].x - x);
      if (d < best) {
        best = d;
        idx = i;
      }
    }
    setHoverIdx(idx);
    const p = scaled[idx];
    const label = `${p.date ?? ""} • ${p.v} projet${p.v > 1 ? "s" : ""}`;
    setTooltip({
      left: Math.min(rect.width - 120, Math.max(8, p.x - rect.left + 8)),
      top: Math.max(8, p.y - rect.top - 36),
      label,
    });
  };

  const onLeave = () => {
    setHoverIdx(null);
    setTooltip(null);
  };

  // Simple axis labels: X -> dates (first/last), Y -> 0/max
  const firstDate = points[0]?.date ?? "";
  const lastDate = points[points.length - 1]?.date ?? "";

  return (
    <div className="relative w-full h-48">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-48"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(59 130 246)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(59 130 246)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Area */}
        <path
          d={path}
          fill={`url(#${gradientId})`}
          stroke="rgb(59 130 246)"
          strokeWidth="2"
        />

        {/* Hover marker */}
        {hoverIdx !== null && scaled[hoverIdx] && (
          <g>
            <line
              x1={scaled[hoverIdx].x}
              x2={scaled[hoverIdx].x}
              y1={PADDING}
              y2={HEIGHT - PADDING}
              stroke="rgb(99 102 241)"
              strokeDasharray="4 4"
              opacity="0.6"
            />
            <circle
              cx={scaled[hoverIdx].x}
              cy={scaled[hoverIdx].y}
              r="4"
              fill="rgb(59 130 246)"
              stroke="#fff"
              strokeWidth="2"
            />
          </g>
        )}

        {/* Axes labels */}
        <text
          x={PADDING}
          y={HEIGHT - 2}
          fontSize="10"
          fill="currentColor"
          opacity="0.6"
        >
          {firstDate}
        </text>
        <text
          x={WIDTH - PADDING}
          y={HEIGHT - 2}
          fontSize="10"
          fill="currentColor"
          opacity="0.6"
          textAnchor="end"
        >
          {lastDate}
        </text>
        <text
          x={PADDING}
          y={PADDING + 10}
          fontSize="10"
          fill="currentColor"
          opacity="0.6"
        >
          {maxY}
        </text>
        <text
          x={PADDING}
          y={HEIGHT - PADDING}
          fontSize="10"
          fill="currentColor"
          opacity="0.6"
        >
          0
        </text>
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none absolute z-10 rounded-md bg-popover px-2 py-1 text-xs shadow border text-popover-foreground"
          style={{ left: tooltip.left, top: tooltip.top }}
        >
          {tooltip.label}
        </div>
      )}
    </div>
  );
}

export default function TrendsChart() {
  const [range, setRange] = useState<"7d" | "30d">("7d");
  const { data } = useProjectsTrends(range);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Tendance des projets créés
        </CardTitle>
        <Tabs value={range} onValueChange={(v) => setRange(v as "7d" | "30d")}>
          <TabsList>
            <TabsTrigger value="7d">7 j</TabsTrigger>
            <TabsTrigger value="30d">30 j</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <Tabs value={range} className="mt-2">
          <TabsContent value="7d" className="m-0">
            <AreaSparkline
              points={data as Point[]}
              minY={0}
              maxY={Math.max(5, ...data.map((p) => p.y))}
            />
          </TabsContent>
          <TabsContent value="30d" className="m-0">
            <AreaSparkline
              points={data as Point[]}
              minY={0}
              maxY={Math.max(5, ...data.map((p) => p.y))}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
