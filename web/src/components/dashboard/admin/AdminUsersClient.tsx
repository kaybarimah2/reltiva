"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  XCircle,
  Trash2,
  Filter,
  UserCheck,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Eye
} from "lucide-react";

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
  phone: string;
  avatar: string;
}

interface AdminUsersClientProps {
  initialUsers: AdminUserItem[];
}

export default function AdminUsersClient({ initialUsers }: AdminUsersClientProps) {
  const [users, setUsers] = useState<AdminUserItem[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  // Action targets for modals
  const [banTarget, setBanTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [viewTarget, setViewTarget] = useState<AdminUserItem | null>(null);
  const [loading, setLoading] = useState(false);

  // Approve Agent Verification
  const handleApproveAgent = async (id: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, action: "VERIFY" })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === id ? { ...u, status: "ACTIVE" } : u));
      }
    } catch (err) {
      console.error("Failed to verify agent", err);
    }
  };

  // Confirm Ban Action (locally managed since not in schema, but calls PATCH placeholder)
  const handleBanConfirm = async () => {
    if (!banTarget) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: banTarget.id, action: "BAN" })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === banTarget.id ? { ...u, status: "BANNED" } : u));
        setBanTarget(null);
      }
    } catch (err) {
      console.error("Failed to ban user", err);
    } finally {
      setLoading(false);
    }
  };

  // Confirm Unban Action
  const handleUnban = async (id: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: id, action: "UNVERIFY" }) // reset status
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === id ? { ...u, status: "ACTIVE" } : u));
      }
    } catch (err) {
      console.error("Failed to unban user", err);
    }
  };

  // Confirm Delete Action
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?userId=${deleteTarget.id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch (err) {
      console.error("Failed to delete user", err);
    } finally {
      setLoading(false);
    }
  };

  // Filtering
  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesStatus = statusFilter === "ALL" || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Client pagination computations
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  return (
    <div className="space-y-6 text-left relative">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 leading-none">Users Management</h1>
        <p className="text-sm text-gray-500 font-semibold mt-1.5">Manage user credentials, ban rule violators, and approve professional agents certification.</p>
      </div>

      {/* Filter and Search Bar row */}
      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-purple-500 focus:border-purple-500"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
              className="text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="BUYER">Buyers</option>
              <option value="AGENT">Agents</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="BANNED">Banned</option>
              <option value="PENDING_VERIFICATION">Pending Verification</option>
            </select>
          </div>
        </div>

      </div>

      {/* Users table list */}
      {currentUsers.length > 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-4">Email</th>
                  <th className="py-4 px-4">Role</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Joined Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs font-semibold text-gray-700">
                {currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/20">
                    <td className="py-4 px-6 font-extrabold text-gray-900">{user.name}</td>
                    <td className="py-4 px-4 text-gray-500 font-medium">{user.email}</td>
                    <td className="py-4 px-4">
                      <span className="text-[9px] bg-gray-100 text-gray-600 font-black px-2 py-0.5 rounded tracking-wider">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-bold uppercase border ${
                        user.status === "ACTIVE" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                          : user.status === "BANNED"
                          ? "bg-red-50 text-red-700 border-red-100"
                          : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}>
                        {user.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-400 font-medium">{user.joined}</td>
                    
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setViewTarget(user)}
                          className="p-1 text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-100 rounded-lg"
                          title="View User Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {user.status === "PENDING_VERIFICATION" && (
                          <button
                            onClick={() => handleApproveAgent(user.id)}
                            className="p-1 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-lg flex items-center gap-0.5"
                            title="Verify Agent"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}
                        {user.status === "BANNED" ? (
                          <button
                            onClick={() => handleUnban(user.id)}
                            className="px-2 py-1 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-lg font-bold text-[9px]"
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => setBanTarget({ id: user.id, name: user.name })}
                            className="p-1 text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-100 rounded-lg"
                            title="Ban User"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteTarget({ id: user.id, name: user.name })}
                          className="p-1 text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-50">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl transition-colors disabled:opacity-40 focus:outline-none"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl transition-colors disabled:opacity-40 focus:outline-none"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center justify-center gap-4">
          <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
            <Users className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-gray-800 text-base">No matching users</h3>
            <p className="text-xs text-gray-400 font-semibold max-w-xs mx-auto">Try adjusting your filters or search keywords to locate users accounts.</p>
          </div>
        </div>
      )}

      {/* VIEW USER MODAL */}
      {viewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setViewTarget(null)} />
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 w-full max-w-sm relative z-10 text-left space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="font-black text-gray-900 text-base">User Details</h3>
              <button
                onClick={() => setViewTarget(null)}
                className="p-1 text-gray-400 hover:text-gray-950 focus:outline-none"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <img
                src={viewTarget.avatar}
                alt={viewTarget.name}
                className="h-16 w-16 rounded-full object-cover border border-purple-200"
              />
              <div className="leading-tight">
                <h4 className="font-black text-gray-900 text-sm">{viewTarget.name}</h4>
                <p className="text-xs text-gray-500 font-semibold">{viewTarget.email}</p>
                <span className="text-[9px] bg-purple-50 text-purple-700 font-black px-2 py-0.5 rounded tracking-wider uppercase inline-block mt-2">
                  {viewTarget.role}
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t border-gray-100 pt-4 text-xs font-semibold text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-400">Phone Number:</span>
                <span>{viewTarget.phone || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Account Status:</span>
                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase border ${
                  viewTarget.status === "ACTIVE" 
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                    : viewTarget.status === "BANNED"
                    ? "bg-red-50 text-red-700 border-red-100"
                    : "bg-amber-50 text-amber-700 border-amber-100"
                }`}>
                  {viewTarget.status.replace("_", " ")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Date Joined:</span>
                <span>{viewTarget.joined}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setViewTarget(null)}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BAN USER MODAL */}
      {banTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setBanTarget(null)} />
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 w-full max-w-sm relative z-10 text-left space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-black text-gray-900 text-base">Confirm Account Suspension</h3>
            </div>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Are you sure you want to ban user <span className="font-extrabold text-gray-900">&quot;{banTarget.name}&quot;</span>? They will be locked out of their dashboard, and all their active property search actions will be frozen.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBanTarget(null)}
                className="flex-1 py-2.5 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBanConfirm}
                disabled={loading}
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs disabled:opacity-50"
              >
                {loading ? "Banning..." : "Yes, Suspend"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE USER MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="bg-white rounded-3xl border border-gray-100 shadow-2xl p-6 w-full max-w-sm relative z-10 text-left space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              <h3 className="font-black text-gray-900 text-base">Confirm Account Deletion</h3>
            </div>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              Are you sure you want to permanently delete user <span className="font-extrabold text-gray-900">&quot;{deleteTarget.name}&quot;</span>? This action is irreversible, and all messaging history or active listings will be deleted forever.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
