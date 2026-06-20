import React from "react";
import { TabsContent } from "../ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";
import { Zap, Activity, TrendingUp } from "lucide-react";
import { COLORS } from "@/lib/constants";
import StatCard from "../stat-card";
import { ElecRow } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";
import CustomTooltip from "../custom-tooltip";

interface ElectricityProps {
  elecData: ElecRow[];
  totalElec: number;
  loading: boolean;
}
export default function Electricity({
  elecData,
  totalElec,
  loading,
}: ElectricityProps) {
  return (
    <TabsContent value="electricity" className="mt-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Zap}
          label="Total Bill (Year)"
          value={`₹${totalElec.toFixed(2)}L`}
          sub="Tembhu — All months"
          color={COLORS.mhaisal}
        />
        <StatCard
          icon={Activity}
          label="Peak Month"
          value={
            elecData.reduce(
              (a, b) => (b.charges > a.charges ? b : a),
              elecData[0] ?? { month: "—", charges: 0 },
            ).month
          }
          sub={`₹${Math.max(...elecData.map((d) => d.charges)).toFixed(2)}L`}
          color={COLORS.danger}
        />
        <StatCard
          icon={TrendingUp}
          label="Months Recorded"
          value={`${elecData.length}`}
          sub="Tembhu Lift Irrigation"
          color={COLORS.tembhu}
        />
      </div>

      <Card className="border border-slate-100 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Monthly Electricity Charges — Tembhu (₹ Lakhs)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={elecData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} width={36} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="charges"
                  name="Electricity (₹ L)"
                  radius={[4, 4, 0, 0]}
                >
                  {elecData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={
                        entry.charges ===
                        Math.max(...elecData.map((d) => d.charges))
                          ? COLORS.danger
                          : COLORS.mhaisal
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="border border-slate-100 dark:border-slate-800 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Cumulative Electricity Expenditure
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-52 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={elecData.reduce<(ElecRow & { cumulative: number })[]>(
                  (acc, d) => {
                    const prev = acc[acc.length - 1]?.cumulative ?? 0;
                    return [
                      ...acc,
                      { ...d, cumulative: +(prev + d.charges).toFixed(2) },
                    ];
                  },
                  [],
                )}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="grad-elec" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={COLORS.mhaisal}
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="95%"
                      stopColor={COLORS.mhaisal}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} width={36} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  name="Cumulative (₹ L)"
                  stroke={COLORS.mhaisal}
                  strokeWidth={2}
                  fill="url(#grad-elec)"
                  dot={{ r: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
}
