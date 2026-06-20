"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import StatCard from "@/components/stat-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Droplets,
  TrendingUp,
  Zap,
  IndianRupee,
  Activity,
  BarChart3,
} from "lucide-react";
import { ElecRow, TaxRow, WaterRow } from "@/lib/types";
import {
  parseElecData,
  parseTaxData,
  parseWaterData,
} from "@/lib/data-parsers";
import CustomTooltip from "@/components/custom-tooltip";
import { CCA_PIE, COLORS } from "@/lib/constants";
import Electricity from "@/components/tabs/electricity";
import TaxRecovery from "@/components/tabs/tax-recovery";
import Overview from "@/components/tabs/overview";

// ─── Color tokens ─────────────────────────────────────────────────────────────

// ─── Custom tooltip ────────────────────────────────────────────────────────────

// ─── Main component ───────────────────────────────────────────────────────────
export default function IrrigationDashboard() {
  const [waterData, setWaterData] = useState<WaterRow[]>([]);
  const [taxData, setTaxData] = useState<TaxRow[]>([]);
  const [elecData, setElecData] = useState<ElecRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    async function fetchAll() {
      try {
        const [s1, s2, s4] = await Promise.all([
          axios.get(`/api/google-sheets?sheetName=Sheet1`),
          axios.get(`/api/google-sheets?sheetName=Sheet2`),
          axios.get(`/api/google-sheets?sheetName=Sheet4`),
        ]);
        setWaterData(parseWaterData(s1.data?.data ?? []));
        setTaxData(parseTaxData(s2.data?.data ?? []));
        setElecData(parseElecData(s4.data?.data ?? []));
        console.log(taxData);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  // Recent water (2015 onwards) for line chart
  const recentWater = waterData.filter((d) => parseInt(d.year) >= 2015);

  // Per-scheme tax summary
  const schemeTotals = [
    "Tembhu Lift Irrigation",
    "Mhaisal Lift Irrigation",
    "Takari Lift Irrigation",
  ].map((scheme) => {
    const rows = taxData.filter((r) => r.scheme === scheme);
    return {
      scheme: scheme.replace(" Lift Irrigation", ""),
      expectedTax: rows.reduce((a, b) => a + b.expectedTax, 0),
      actualRecovery: rows.reduce((a, b) => a + b.actualRecovery, 0),
      waterTotal: rows.reduce((a, b) => a + b.waterIncl, 0),
    };
  });

  // KRA line chart data normalized to Lakhs for proper chart alignment
  const kraData = [
    "2020-2021",
    "2021-2022",
    "2022-2023",
    "2023-2024",
    "2024-2025",
  ].map((yr) => {
    const entry: Record<string, any> = { year: yr.slice(0, 7) };
    taxData
      .filter((r) => r.year === yr)
      .forEach((r) => {
        const key = r.scheme.replace(" Lift Irrigation", "");
        // Convert raw expected tax to Lakhs so it matches actualRecovery's unit scale
        entry[`${key}_Expected`] = r.expectedTax / 1e5;
        entry[`${key}_Actual`] = r.actualRecovery;
      });
    return entry;
  });

  const totalWater = waterData.reduce((s, r) => s + r.Total, 0);
  const totalElec = elecData.reduce((s, r) => s + r.charges, 0);
  const totalRecovery = taxData
    .filter((r) => !r.year.includes("Total"))
    .reduce((s, r) => s + r.actualRecovery, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans">
      {/* ── Header ── */}
      <header className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-lg">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Droplets className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                Sangli Irrigation Circle
              </h1>
              <p className="text-sm text-white/70">… website for farmers</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            {[
              "Takari-Wangi",
              "Takari-Tasgaon",
              "Tembhu-Kadepur",
              "Tembhu-Tasgaon",
              "Mhaisal",
              "Sinchan",
              "Pik Mojani",
              "Live Rotation",
            ].map((n) => (
              <a
                key={n}
                href="#"
                className="px-3 py-1.5 rounded-lg hover:bg-white/15 transition-colors whitespace-nowrap"
              >
                {n}
              </a>
            ))}
          </nav>
          {/* Mobile nav */}
          <div className="flex md:hidden flex-wrap justify-center gap-1 text-xs">
            {["Takari", "Mhaisal", "Tembhu", "Sinchan"].map((n) => (
              <Badge
                key={n}
                variant="secondary"
                className="bg-white/20 text-white border-white/30 cursor-pointer"
              >
                {n}
              </Badge>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ── KPI cards ── */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Droplets}
              label="Total Water Used"
              value={`${totalWater.toFixed(1)} MCM`}
              sub="2002 – 2025"
              color={COLORS.tembhu}
            />
            <StatCard
              icon={IndianRupee}
              label="Total Recovery"
              value={`₹${totalRecovery.toFixed(0)}L`}
              sub="All 3 schemes"
              color={COLORS.takari}
            />
            <StatCard
              icon={Zap}
              label="Electricity Bill"
              value={`₹${totalElec.toFixed(2)}L`}
              sub="Tembhu – Current Year"
              color={COLORS.mhaisal}
            />
            <StatCard
              icon={Activity}
              label="Schemes Monitored"
              value="3 Active"
              sub="Tembhu · Mhaisal · Takari"
              color={COLORS.total}
            />
          </div>
        )}

        {/* ── Tabs ── */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm rounded-xl p-1 w-full sm:w-auto overflow-x-auto flex">
            <TabsTrigger
              value="overview"
              className="text-xs sm:text-sm flex-shrink-0"
            >
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> Overview
            </TabsTrigger>
            <TabsTrigger
              value="tax"
              className="text-xs sm:text-sm flex-shrink-0"
            >
              <IndianRupee className="w-3.5 h-3.5 mr-1" /> Tax & Recovery
            </TabsTrigger>
            <TabsTrigger
              value="electricity"
              className="text-xs sm:text-sm flex-shrink-0"
            >
              <Zap className="w-3.5 h-3.5 mr-1" /> Electricity
            </TabsTrigger>
          </TabsList>

          {/* ─ Overview tab ─ */}
          <Overview
            loading={loading}
            waterData={waterData}
            recentWater={recentWater}
          />

          {/* ─ Tax & Recovery tab ─ */}
          <TaxRecovery
            kraData={kraData}
            schemeTotals={schemeTotals}
            loading={loading}
            taxData={taxData}
          />


          {/* ─ Electricity tab ─ */}
          <Electricity
            elecData={elecData}
            totalElec={totalElec}
            loading={loading}
          />
        </Tabs>

        {/* ── Footer ── */}
        <footer className="text-center text-xs text-slate-400 pb-4 pt-2">
          SIC Monitor — TEMBHU / TAKARI / MHAISAL / SID Projects · Sangli
          Irrigation Circle · Data via Google Sheets API
        </footer>
      </main>
    </div>
  );
}
