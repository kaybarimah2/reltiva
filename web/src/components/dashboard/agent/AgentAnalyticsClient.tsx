"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Eye,
  Mail,
  Building
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

export interface AnalyticsListingItem {
  id: string;
  title: string;
  views: number;
  enquiries: number;
  saves: number;
  score: number;
}

export interface DayTrendItem {
  day: string;
  views: number;
  enquiries: number;
}

export interface MonthlyTrendItem {
  month: string;
  enquiries: number;
}

interface AgentAnalyticsClientProps {
  avgDailyViews: number;
  conversionRatio: string;
  growthRate: string;
  viewsData: DayTrendItem[];
  monthlyEnquiriesData: MonthlyTrendItem[];
  topListings: AnalyticsListingItem[];
}

export default function AgentAnalyticsClient({
  avgDailyViews,
  conversionRatio,
  growthRate,
  viewsData,
  monthlyEnquiriesData,
  topListings
}: AgentAnalyticsClientProps) {
  const [mounted, setMounted] = useState(false);

  // Client-side hydration mount safety block
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-6 text-left">
      
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-none">Performance Analytics</h1>
          <p className="text-sm text-gray-500 font-semibold mt-1.5">Track your metrics, view counts, and engagement levels over time.</p>
        </div>

        <select className="text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none">
          <option>Last 30 Days</option>
          <option>Last 6 Months</option>
          <option>Year to Date</option>
        </select>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Eye className="h-6 w-6" />
          </div>
          <div className="leading-none text-left">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Average Daily Views</p>
            <p className="text-xl font-black text-gray-900 mt-1">{avgDailyViews.toFixed(1)}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Mail className="h-6 w-6" />
          </div>
          <div className="leading-none text-left">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Conversion Ratio</p>
            <p className="text-xl font-black text-gray-900 mt-1">{conversionRatio}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="leading-none text-left">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Growth Rate</p>
            <p className="text-xl font-black text-gray-900 mt-1">{growthRate}</p>
          </div>
        </div>
      </div>

      {/* Chart blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Line Chart: Views over time */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-50">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="h-4.5 w-4.5 text-emerald-600" /> Views & Enquiries Trend
            </h2>
          </div>
          
          {mounted && viewsData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={viewsData} margin={{ left: -25, right: 10, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fontWeight: 600, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fontWeight: 600, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #f3f4f6", fontSize: "12px", fontWeight: "bold" }} />
                  <Line type="monotone" dataKey="views" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 bg-gray-50 rounded-2xl flex items-center justify-center text-xs font-semibold text-gray-400">
              {mounted ? "No views trend data available." : "Loading chart canvas..."}
            </div>
          )}
        </div>

        {/* Bar Chart: Enquiries over time */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-gray-50">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="h-4.5 w-4.5 text-blue-600" /> Monthly Enquiries Inbox Volume
            </h2>
          </div>

          {mounted && monthlyEnquiriesData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyEnquiriesData} margin={{ left: -25, right: 10, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 600, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fontWeight: 600, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #f3f4f6", fontSize: "12px", fontWeight: "bold" }} />
                  <Bar dataKey="enquiries" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 bg-gray-50 rounded-2xl flex items-center justify-center text-xs font-semibold text-gray-400">
              {mounted ? "No monthly enquiries data available." : "Loading chart canvas..."}
            </div>
          )}
        </div>

      </div>

      {/* Top listings table report */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        <div className="flex justify-between items-center pb-4 border-b border-gray-50">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
            <Building className="h-4.5 w-4.5 text-purple-600" /> Listing Performance Breakdown
          </h2>
        </div>

        <div className="overflow-x-auto mt-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/20">
                <th className="py-3 px-4">Property Address</th>
                <th className="py-3 px-4">Views</th>
                <th className="py-3 px-4">Enquiries</th>
                <th className="py-3 px-4">Saves</th>
                <th className="py-3 px-4 text-right">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs font-semibold text-gray-700">
              {topListings.length > 0 ? (
                topListings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50/20">
                    <td className="py-3 px-4 font-extrabold text-gray-900">{listing.title}</td>
                    <td className="py-3 px-4 font-bold text-gray-500">{listing.views}</td>
                    <td className="py-3 px-4 font-bold text-gray-500">{listing.enquiries}</td>
                    <td className="py-3 px-4 font-bold text-gray-500">{listing.saves}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="bg-emerald-50 text-emerald-700 font-extrabold px-2 py-0.5 rounded-lg border border-emerald-100">
                        {listing.score}%
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 text-xs font-semibold">
                    No listing performance data available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
