"use client";

import * as React from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DashboardSheet = {
  name: string;
  columns: string[];
  rows: Record<string, unknown>[];
};

function coerceNumber(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const trimmed = v.trim();
    if (!trimmed) return null;
    const n = Number(trimmed);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function inferChart(seriesRows: Record<string, unknown>[], columns: string[]) {
  const maxScan = Math.min(seriesRows.length, 200);

  const numericByCol = new Map<string, number>();
  for (const col of columns) {
    let count = 0;
    for (let i = 0; i < maxScan; i++) {
      const n = coerceNumber(seriesRows[i]?.[col]);
      if (n !== null) count++;
    }
    numericByCol.set(col, count);
  }

  const numericCandidates = [...numericByCol.entries()]
    .filter(([, count]) => count > Math.max(3, Math.floor(maxScan * 0.1)))
    .sort((a, b) => b[1] - a[1])
    .map(([col]) => col);

  // pick x-axis as first non-numeric-ish column
  const xAxisCandidates = columns.filter((c) => !numericCandidates.includes(c));
  const xAxis = xAxisCandidates[0] ?? columns[0];

  const ySeries = numericCandidates.slice(0, 3);

  const chartData = seriesRows.slice(0, 50).map((r, idx) => {
    const xVal = r?.[xAxis];
    const x = xVal == null ? `Row ${idx + 1}` : String(xVal);
    const point: Record<string, unknown> = { name: x };
    for (const y of ySeries) {
      const n = coerceNumber(r?.[y]);
      if (n === null) continue;
      point[y] = n;
    }
    return point;
  });

  return {
    xAxis,
    ySeries,
    chartData,
  };
}

const COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#22c55e", // green
  "#f59e0b", // amber
  "#a855f7", // purple
  "#06b6d4", // cyan
];

function SheetDashboard({ sheet }: { sheet: DashboardSheet }) {
  const { columns, rows } = React.useMemo(() => {
    return {
      columns: sheet.columns ?? [],
      rows: sheet.rows ?? [],
    };
  }, [sheet.columns, sheet.rows]);

  const { ySeries, chartData } = React.useMemo(
    () => inferChart(rows, columns),
    [rows, columns],
  );

  const showChart = ySeries.length > 0 && chartData.length > 1;

  const previewColumns = columns.slice(0, 6);
  const previewRows = rows.slice(0, 20);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{sheet.name}</CardTitle>
          <CardDescription>
            Auto-detected numeric series from this sheet (top 50 rows).
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[360px]">
          {showChart ? (
            <div className="w-full h-full">
              <ResponsiveContainer width="100%" height={320}>
                <LineChart
                  data={chartData}
                  margin={{ left: 12, right: 12, top: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.4} />

                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    interval="preserveStartEnd"
                  />

                  <YAxis tick={{ fontSize: 11 }} />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(0,0,0,0.8)",
                      border: "none",
                      borderRadius: 8,
                      color: "#fff",
                    }}
                  />

                  <Legend />

                  {ySeries.map((y, idx) => (
                    <Line
                      key={y}
                      type="monotone"
                      dataKey={y}
                      stroke={COLORS[idx % COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={true}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              Not enough numeric columns to render a chart for this sheet.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data preview</CardTitle>
          <CardDescription>
            First 20 rows (showing up to 6 columns).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {previewColumns.map((c) => (
                  <TableHead key={c}>{c}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewRows.map((r, i) => (
                <TableRow key={i}>
                  {previewColumns.map((c) => (
                    <TableCell key={c}>
                      {r?.[c] == null ? "" : String(r?.[c])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ExcelDashboardClient({
  sheets,
}: {
  sheets: DashboardSheet[];
}) {
  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6">
      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-2xl font-semibold">XLSX Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Charts + table previews generated from all sheets in the workbook.
        </p>
      </div>

      <Tabs defaultValue={sheets[0]?.name}>
        <TabsList className="flex flex-wrap h-auto">
          {sheets.map((s) => (
            <TabsTrigger key={s.name} value={s.name}>
              {s.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {sheets.map((s) => (
          <TabsContent key={s.name} value={s.name}>
            <SheetDashboard sheet={s} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
