"use client";

import { useId, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Point = { x: number; y: number };

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
  const { path, gradientId } = useMemo(() => {
    if (!points.length) return { path: "", gradientId: "grad-empty" };
    const width = 600;
    const height = 200;
    const xs = points.map((p) => p.x);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const rangeX = Math.max(1, maxX - minX);
    const rangeY = Math.max(1, maxY - minY);
    const scaleX = (x: number) => ((x - minX) / rangeX) * (width - 24) + 12;
    const scaleY = (y: number) =>
      height - ((y - minY) / rangeY) * (height - 24) - 12;

    const d = points
      .map((p, i) => `${i === 0 ? "M" : "L"}${scaleX(p.x)},${scaleY(p.y)}`)
      .join(" ");
    const area = `${d} L ${scaleX(points[points.length - 1].x)},${scaleY(
      minY
    )} L ${scaleX(points[0].x)},${scaleY(minY)} Z`;
    const gid = `grad-${svgId}`;
    return { path: area, gradientId: gid };
  }, [points, minY, maxY, svgId]);

  return (
    <svg viewBox="0 0 600 200" className="w-full h-48">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgb(59 130 246)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="rgb(59 130 246)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={path}
        fill={`url(#${gradientId})`}
        stroke="rgb(59 130 246)"
        strokeWidth="2"
      />
    </svg>
  );
}

export default function TrendsChart() {
  const [range, setRange] = useState<"7d" | "30d">("7d");

  const data: Point[] = useMemo(() => {
    const len = range === "7d" ? 7 : 30;
    // generate simple sinusoid data for placeholder
    return Array.from({ length: len }, (_, i) => ({
      x: i,
      y: Math.round(50 + Math.sin(i / 2) * 25 + (i % 3) * 3),
    }));
  }, [range]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Tendance des documents générés
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
            <AreaSparkline points={data} minY={0} maxY={100} />
          </TabsContent>
          <TabsContent value="30d" className="m-0">
            <AreaSparkline points={data} minY={0} maxY={100} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
