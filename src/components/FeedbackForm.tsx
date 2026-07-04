import React, { useState } from 'react';
import { Star, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';

interface FeedbackFormProps {
  onSuccess: () => void;
}

export function FeedbackForm({ onSuccess }: FeedbackFormProps) {
  const [rating, setRating] = useState<number>(5);
  const [comments, setComments] = useState('');
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comments })
      });

      if (!res.ok) {
        throw new Error('Failed to submit your feedback. Please check back later.');
      }

      setSubmitted(true);
      onSuccess();

      // Reset
      setComments('');
      setRating(5);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="feedback_form_wrapper" className="bg-white dark:bg-slate-800/80 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60 max-w-xl mx-auto">
      {submitted ? (
        <div id="feedback_success" className="text-center p-6 space-y-4 animate-scale-up">
          <div className="w-14 h-14 bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Thank You for Your Feedback!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Your ratings and suggestions help our engineering teams elevate repairs.</p>
          </div>
          <button 
            onClick={() => setSubmitted(false)}
            className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 font-semibold px-4 py-2 rounded-xl border border-blue-200/20 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
          >
            Submit Another Feedback
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Rate Our Mobile Service</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">We continuously optimize speed, part accuracy, and friendliness based on your stars.</p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs rounded-xl border border-red-200/20">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Star selector */}
          <div className="space-y-2 text-center py-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">How would you rate your experience?</label>
            <div className="flex items-center justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star 
                    className={`w-9 h-9 transition-colors ${
                      (hoverRating !== null ? star <= hoverRating : star <= rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200 dark:text-slate-700'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {rating === 5 && '😍 Outstanding service! Perfect repair.'}
              {rating === 4 && '😀 Very good! Friendly & reliable.'}
              {rating === 3 && '😐 Average. Met my basic expectations.'}
              {rating === 2 && '🙁 Below average. Needs improvement.'}
              {rating === 1 && '😡 Very disappointing experience.'}
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" /> Share your comments (optional)
            </label>
            <textarea
              placeholder="Tell us about the repair quality, customer representative friendliness, or speed..."
              rows={3}
              value={comments}
              onChange={e => setComments(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 disabled:bg-slate-400 text-white py-3 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? 'Submitting review...' : 'Submit Satisfaction Rating'}
          </button>
        </form>
      )}
    </div>
  );
}
