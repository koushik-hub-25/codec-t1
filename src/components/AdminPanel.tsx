import React, { useState, useEffect } from 'react';
import { Appointment, RepairStatus, Feedback, DashboardStats } from '../types';
import { Calendar, Wrench, MessageSquare, Star, Users, CheckCircle, RefreshCw, ChevronRight, PenTool } from 'lucide-react';

export function AdminPanel() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    activeRepairs: 0,
    totalFeedback: 0,
    averageRating: 5.0
  });

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [repairs, setRepairs] = useState<RepairStatus[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, apptsRes, repairsRes, feedsRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/appointments'),
        fetch('/api/tracking'),
        fetch('/api/feedback')
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (apptsRes.ok) setAppointments(await apptsRes.json());
      if (repairsRes.ok) setRepairs(await repairsRes.json());
      if (feedsRes.ok) setFeedbacks(await feedsRes.json());
    } catch (err) {
      console.error('Failed to load administrative logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    setUpdatingId(jobId);
    try {
      const res = await fetch(`/api/tracking/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        // Refresh local items
        setRepairs(prev => prev.map(r => r.job_id === jobId ? { ...r, status: newStatus as any } : r));
        // Refresh stats
        const statsRes = await fetch('/api/stats');
        if (statsRes.ok) setStats(await statsRes.json());
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div id="admin_panel_wrapper" className="space-y-6 animate-fade-in">
      {/* Header section with refresh button */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <PenTool className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Administrative Support Dashboard
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage customer repair tickets, view scheduled slots, and analyze real-time service satisfaction stats.</p>
        </div>
        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 rounded-xl transition duration-150 border border-slate-200/50 dark:border-slate-700/50 cursor-pointer"
          title="Refresh Dashboard Statistics"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats row cards */}
      <div id="stats_row" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Booked */}
        <div className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <Calendar className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Appointments</span>
            <span className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">{stats.totalAppointments}</span>
          </div>
        </div>

        {/* Active Repairs */}
        <div className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <Wrench className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Active Repair List</span>
            <span className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">{stats.activeRepairs}</span>
          </div>
        </div>

        {/* Reviews submitted */}
        <div className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
            <MessageSquare className="w-5.5 h-5.5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Reviews</span>
            <span className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">{stats.totalFeedback}</span>
          </div>
        </div>

        {/* Average satisfaction */}
        <div className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/60 shadow-xs flex items-center gap-4">
          <div className="p-3.5 bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl">
            <Star className="w-5.5 h-5.5 fill-purple-600 dark:fill-purple-400" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Average Stars</span>
            <span className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">{stats.averageRating} / 5.0</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Active Repair Tickets Tracker column */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/60 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Active Hardware Repair States
            </h3>
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full">
              Real-time update
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700/60 text-slate-400 font-semibold">
                  <th className="pb-3 font-medium">Job ID</th>
                  <th className="pb-3 font-medium">Customer Name</th>
                  <th className="pb-3 font-medium">Current Status</th>
                  <th className="pb-3 text-right font-medium">Modify Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
                {repairs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No repair tickets active in database.
                    </td>
                  </tr>
                ) : (
                  repairs.map((r) => (
                    <tr key={r.job_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 font-bold font-mono text-slate-800 dark:text-slate-200">{r.job_id}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-300 font-medium">{r.customer_name}</td>
                      <td className="py-3">
                        <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold ${
                          r.status === 'Delivered' ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400' :
                          r.status === 'Ready for Pickup' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400' :
                          r.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <select
                          value={r.status}
                          disabled={updatingId === r.job_id}
                          onChange={(e) => handleStatusChange(r.job_id, e.target.value)}
                          className="text-[11px] px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Ready for Pickup">Ready for Pickup</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Booked Appointments log Column */}
        <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/60 p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Booked Customer Repair Slots
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700/60 text-slate-400 font-semibold">
                  <th className="pb-3 font-medium">Job ID</th>
                  <th className="pb-3 font-medium">Customer Details</th>
                  <th className="pb-3 font-medium">Device Brand & Model</th>
                  <th className="pb-3 font-medium">Scheduled Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/40">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No online slots currently booked.
                    </td>
                  </tr>
                ) : (
                  appointments.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                      <td className="py-3 font-bold font-mono text-slate-800 dark:text-slate-200">
                        JOB{a.id.replace('APT', '')}
                      </td>
                      <td className="py-3">
                        <div className="font-semibold text-slate-700 dark:text-slate-200">{a.name}</div>
                        <div className="text-[10px] text-slate-400">{a.phone}</div>
                      </td>
                      <td className="py-3">
                        <div className="font-medium text-slate-700 dark:text-slate-300">{a.brand} {a.model}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-1">{a.issue}</div>
                      </td>
                      <td className="py-3 font-semibold text-slate-700 dark:text-slate-300">
                        {a.appointment_date}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Customer Feedback List Row */}
      <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/60 p-5 shadow-xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Customer Satisfaction Reviews & Star Ratings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {feedbacks.length === 0 ? (
            <div className="col-span-full py-8 text-center text-slate-400 text-xs">
              No customer satisfaction feedback submitted yet.
            </div>
          ) : (
            feedbacks.map((f) => (
              <div 
                key={f.id} 
                className="p-4 bg-slate-50 dark:bg-slate-700/40 rounded-xl border border-slate-200/40 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-400 font-mono font-bold px-2 py-0.5 rounded">
                    {f.id}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                        key={s} 
                        className={`w-3.5 h-3.5 ${
                          s <= f.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'
                        }`} 
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                  "{f.comments || 'No comments shared.'}"
                </p>
                <span className="text-[9px] text-slate-400 block text-right">
                  📅 Reviewed: {f.date}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
