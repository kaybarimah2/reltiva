"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Building,
  Mail,
  MapPin,
  TrendingUp
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";

export interface MonthData {
  month: string;
  users?: number;
  listings?: number;
  enquiries?: number;
}

export interface PieData {
  name: string;
  value: number;
}

interface AdminAnalyticsClientProps {
  newUsersData: MonthData[];
  listingsData: MonthData[];
  enquiriesData: MonthData[];
  propertyTypesData: PieData[];
  regionDistributionData: PieData[];
}

const COLORS = ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981", "#f59e0b"];

export default function AdminAnalyticsClient({
  newUsersData,
  listingsData,
  enquiriesData,
  propertyTypesData,
  regionDistributionData
}: AdminAnalyticsClientProps) {
  const [mounted, setMounted] = useState(false);

  // Hydration safety
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-6 text-left">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 leading-none">Site Analytics</h1>
        <p className="text-sm text-gray-500 font-semibold mt-1.5">Platform growth analytics, user acquisitions, registrations, and regional listing densities.</p>
      </div>

      {/* 2-Column charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* New Users over time */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-gray-50">
            <Users className="h-4.5 w-4.5 text-purple-600" /> New Users Registration Growth
          </h2>
          {mounted ? (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={newUsersData} margin={{ left: -25, right: 10, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 600, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fontWeight: 600, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #f3f4f6", fontSize: "11px", fontWeight: "bold" }} />
                  <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: "#8b5cf6", strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-60 bg-gray-50 animate-pulse rounded-2xl flex items-center justify-center text-xs font-semibold text-gray-400">Loading growth chart...</div>
          )}
        </div>

        {/* Listings created per month */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-gray-50">
            <Building className="h-4.5 w-4.5 text-blue-600" /> Listings Created Monthly
          </h2>
          {mounted ? (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={listingsData} margin={{ left: -25, right: 10, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 600, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fontWeight: 600, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #f3f4f6", fontSize: "11px", fontWeight: "bold" }} />
                  <Bar dataKey="listings" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-60 bg-gray-50 animate-pulse rounded-2xl flex items-center justify-center text-xs font-semibold text-gray-400">Loading listings chart...</div>
          )}
        </div>

        {/* Enquiries volume */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-gray-50">
            <Mail className="h-4.5 w-4.5 text-emerald-600" /> Platform Enquiries Volume
          </h2>
          {mounted ? (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enquiriesData} margin={{ left: -25, right: 10, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 600, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fontWeight: 600, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #f3f4f6", fontSize: "11px", fontWeight: "bold" }} />
                  <Bar dataKey="enquiries" fill="#10b981" radius={[6, 6, 0, 0]} barSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-60 bg-gray-50 animate-pulse rounded-2xl flex items-center justify-center text-xs font-semibold text-gray-400">Loading volume chart...</div>
          )}
        </div>

        {/* Property Type distribution (Pie Chart) */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-gray-50">
            <TrendingUp className="h-4.5 w-4.5 text-pink-600" /> Property Categories Distribution
          </h2>
          {mounted ? (
            <div className="h-60 w-full flex items-center justify-center">
              {propertyTypesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={propertyTypesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {propertyTypesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}`} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: "10px", fontWeight: "bold" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs font-bold text-gray-400">No properties category data found</div>
              )}
            </div>
          ) : (
            <div className="h-60 bg-gray-50 animate-pulse rounded-2xl flex items-center justify-center text-xs font-semibold text-gray-400">Loading distribution chart...</div>
          )}
        </div>

        {/* Region density (Pie Chart) */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4 lg:col-span-2">
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-gray-50">
            <MapPin className="h-4.5 w-4.5 text-amber-500" /> Listings Density by Ghana Region
          </h2>
          {mounted ? (
            <div className="h-60 w-full flex items-center justify-center">
              {regionDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={regionDistributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name} (${value})`}
                      labelLine={true}
                    >
                      {regionDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs font-bold text-gray-400">No regional property data found</div>
              )}
            </div>
          ) : (
            <div className="h-60 bg-gray-50 animate-pulse rounded-2xl flex items-center justify-center text-xs font-semibold text-gray-400">Loading regional density chart...</div>
          )}
        </div>

      </div>

    </div>
  );
}
