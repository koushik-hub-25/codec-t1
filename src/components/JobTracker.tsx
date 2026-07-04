import React, { useState } from 'react';
import { Search, Loader2, AlertTriangle, FileText, CheckCircle, Wrench, Shield, Box } from 'lucide-react';
import { RepairStatus } from '../types';

export function JobTracker() {
  const [jobId, setJobId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [record, setRecord] = useState<RepairStatus | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId.trim()) return;

    setLoading(true);
    setError(null);
    setRecord(null);

    const cleanJobId = jobId.trim().toUpperCase();

    try {
      const response = await fetch(`/api/tracking/${cleanJobId}`);
      if (!response.ok) {
        throw new Error(`We couldn't find any mobile repair ticket under ID "${cleanJobId}". Please verify your invoice receipt.`);
      }
      const data = await response.json();
      setRecord(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = [
    { name: 'Pending', desc: 'Received & queued for diagnostics', icon: FileText, color: 'text-amber-500', bg: 'bg-amber-500' },
    { name: 'In Progress', desc: 'Hardware replacement underway', icon: Wrench, color: 'text-blue-500', bg: 'bg-blue-500' },
    { name: 'Ready for Pickup', desc: 'Repaired, tested, and ready at counter', icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-500' },
    { name: 'Delivered', desc: 'Device handed over to customer', icon: Box, color: 'text-slate-500', bg: 'bg-slate-500' }
  ];

  const getStepIndex = (status: string) => {
    return statusSteps.findIndex(step => step.name.toLowerCase() === status.toLowerCase());
  };

  const activeIndex = record ? getStepIndex(record.status) : -1;

  return (
    <div id="job_tracker_wrapper" className="bg-white dark:bg-slate-800/80 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60 max-w-2xl mx-auto space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Track Repair Job Status</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Enter the JOB ID printed on your physical service center receipt (e.g., JOB101, JOB102) to view live progress.</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            required
            placeholder="Enter Job ID (e.g. JOB101)"
            value={jobId}
            onChange={e => setJobId(e.target.value)}
            className="w-full text-xs sm:text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono placeholder-slate-400"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !jobId.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 dark:disabled:bg-slate-700 text-white disabled:text-slate-400 px-5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search Ticket'}
        </button>
      </form>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-200/20">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="leading-relaxed">{error}</span>
        </div>
      )}

      {record && (
        <div id="tracking_result" className="space-y-6 border-t border-slate-100 dark:border-slate-700/60 pt-5 animate-scale-up">
          {/* Summary detail card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-200/40 text-xs text-slate-600 dark:text-slate-300">
            <div>
              <span className="text-slate-400 block font-medium">Job Identification ID</span>
              <span className="font-bold text-slate-800 dark:text-white text-sm font-mono">{record.job_id}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Customer Name</span>
              <span className="font-bold text-slate-800 dark:text-white text-sm">{record.customer_name}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Current Repair Status</span>
              <span className={`inline-block font-semibold px-2 py-0.5 rounded-full text-[10px] mt-0.5 uppercase tracking-wider ${
                record.status === 'Delivered' ? 'bg-slate-200 text-slate-700' :
                record.status === 'Ready for Pickup' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400' :
                record.status === 'In Progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400' :
                'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
              }`}>{record.status}</span>
            </div>
          </div>

          {/* Stepper tracking progress timeline */}
          <div className="relative pt-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">Repair Timeline Milestones</h4>
            <div className="space-y-6 pl-4 border-l-2 border-slate-200 dark:border-slate-700 relative ml-2">
              {statusSteps.map((step, idx) => {
                const StepIcon = step.icon;
                const isCompleted = idx <= activeIndex;
                const isActive = idx === activeIndex;

                return (
                  <div key={idx} className="relative pl-6 animate-fade-in">
                    {/* Circle badge absolute element */}
                    <div className={`absolute -left-[23px] top-0.5 w-7 h-7 rounded-full flex items-center justify-center border-2 shadow-xs transition-all ${
                      isActive ? 'bg-blue-600 text-white border-blue-600 scale-110 ring-4 ring-blue-500/20' :
                      isCompleted ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-600' :
                      'bg-slate-50 text-slate-300 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}>
                      {isCompleted && !isActive ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <StepIcon className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <span className={`font-semibold text-xs sm:text-sm ${
                        isActive ? 'text-blue-600 dark:text-blue-400 font-bold' :
                        isCompleted ? 'text-slate-800 dark:text-slate-200' :
                        'text-slate-400 dark:text-slate-600'
                      }`}>
                        {step.name}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
