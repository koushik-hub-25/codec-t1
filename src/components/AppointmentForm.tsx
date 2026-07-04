import React, { useState, useEffect } from 'react';
import { Calendar, User, Phone, Tag, Cpu, AlertTriangle, CheckCircle, Ticket } from 'lucide-react';

interface AppointmentFormProps {
  initialServiceName?: string;
  onSuccess: (bookingData: any) => void;
}

export function AppointmentForm({ initialServiceName = '', onSuccess }: AppointmentFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    brand: 'Samsung',
    model: '',
    issue: '',
    appointment_date: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<any>(null);

  // Prefill issue if user clicked "Book Repair" on a service card
  useEffect(() => {
    if (initialServiceName) {
      setFormData(prev => ({
        ...prev,
        issue: `Required service: ${initialServiceName}`
      }));
    }
  }, [initialServiceName]);

  const brands = ['Samsung', 'Apple', 'Xiaomi', 'Vivo', 'Oppo', 'OnePlus', 'Realme', 'Motorola'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (!formData.name.trim() || !formData.phone.trim() || !formData.model.trim() || !formData.issue.trim() || !formData.appointment_date) {
      setError('Please fill in all the required booking fields.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to submit appointment.');
      }

      const data = await response.json();
      setReceipt(data);
      onSuccess(data);

      // Reset form
      setFormData({
        name: '',
        phone: '',
        brand: 'Samsung',
        model: '',
        issue: '',
        appointment_date: ''
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="booking_form_wrapper" className="bg-white dark:bg-slate-800/80 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60 max-w-2xl mx-auto">
      {receipt ? (
        <div id="booking_receipt" className="text-center p-6 space-y-5 animate-scale-up">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle className="w-10 h-10" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Booking Confirmed!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Your repair slot is successfully reserved at our service center.</p>
          </div>

          {/* Receipt detail card */}
          <div className="bg-slate-50 dark:bg-slate-700/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-left max-w-md mx-auto space-y-3.5 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-600 text-white font-bold text-[10px] px-3 py-1 uppercase tracking-wider rounded-bl-xl">
              Confirmed
            </div>

            <div className="flex items-center gap-2.5">
              <Ticket className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Your Tracking Job ID</div>
                <div className="text-base font-bold text-slate-800 dark:text-white font-mono">{receipt.job_id}</div>
              </div>
            </div>

            <hr className="border-slate-200/50 dark:border-slate-600/50" />

            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block">Customer</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{receipt.name}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block">Contact</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{receipt.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block">Device</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{receipt.brand} {receipt.model}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block">Preferred Date</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{receipt.appointment_date}</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 italic">
              <strong>Problem Description:</strong> {receipt.issue}
            </div>
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 py-2 px-3 rounded-lg border border-amber-200/20">
              💡 Tip: You can query your Job ID <strong>{receipt.job_id}</strong> in the support chatbot on the right to track real-time repairs!
            </p>
            <button 
              onClick={() => setReceipt(null)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-bold text-xs sm:text-sm cursor-pointer shadow-sm transition-all"
            >
              Book Another Repair
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Schedule Mobile Repair Appointment</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Book online to enjoy fast priority diagnosis with no waiting lines.</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200/30 text-red-600 dark:text-red-400 text-xs rounded-xl">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" /> Full Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                placeholder="John Doe"
                required
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {/* Customer phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number <span className="text-red-500">*</span>
              </label>
              <input 
                type="tel"
                placeholder="e.g. +91 9876543210"
                required
                value={formData.phone}
                onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Device brand */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" /> Device Brand <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.brand}
                onChange={e => setFormData(p => ({ ...p, brand: e.target.value }))}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                {brands.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Device model */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-slate-400" /> Device Model <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                placeholder="e.g. Galaxy S23 Ultra / iPhone 14 Pro"
                required
                value={formData.model}
                onChange={e => setFormData(p => ({ ...p, model: e.target.value }))}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Preferred date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Preferred Appointment Date <span className="text-red-500">*</span>
            </label>
            <input 
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={formData.appointment_date}
              onChange={e => setFormData(p => ({ ...p, appointment_date: e.target.value }))}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Issue Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Problem Description / Details <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Describe your device issue (e.g. cracked display, phone dropped in water, battery draining quickly)"
              rows={3}
              required
              value={formData.issue}
              onChange={e => setFormData(p => ({ ...p, issue: e.target.value }))}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Securing Slot...
              </>
            ) : 'Reserve Priority Service Slot'}
          </button>
        </form>
      )}
    </div>
  );
}
