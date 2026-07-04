import React, { useState } from 'react';
import { ShieldCheck, Clock, CheckCircle, Smartphone, HelpCircle, CircleDollarSign, Compass, Phone } from 'lucide-react';

interface ServiceCatalogProps {
  onSelectService: (serviceName: string) => void;
}

export function ServiceCatalog({ onSelectService }: ServiceCatalogProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const services = [
    { name: 'Screen Replacement', price: '₹2,500 - ₹12,000', duration: '1-2 Hours', icon: '📱', desc: 'Touch display glass replacement' },
    { name: 'Battery Replacement', price: '₹1,000 - ₹4,500', duration: '30-45 Mins', icon: '🔋', desc: 'Solves backup draining & swelling issues' },
    { name: 'Charging Port Repair', price: '₹700 - ₹2,000', duration: '45 Mins', icon: '🔌', desc: 'Fixes loose connections or slow charging' },
    { name: 'Camera Repair', price: '₹1,500 - ₹6,000', duration: '1-2 Hours', icon: '📷', desc: 'Fixes blurry, blacked out, or failed camera lens' },
    { name: 'Speaker & Mic Repair', price: '₹700 - ₹2,500', duration: '45 Mins', icon: '🔊', desc: 'Resolves crackling sound or low call audio' },
    { name: 'Water Damage Remediation', price: 'Inspection Required', duration: '1-2 Days', icon: '💧', desc: 'Chemical drying & IC diagnostic rescue' },
    { name: 'Motherboard IC Repair', price: 'Inspection Required', duration: '1-3 Days', icon: '⚙️', desc: 'Resolves dead boot, chip-level logic errors' },
    { name: 'Software update & Reset', price: '₹500 - ₹1,500', duration: '1 Hour', icon: '💿', desc: 'Solves bootloops, freezes, system update bricking' },
  ];

  const brands = ['Samsung', 'Apple', 'Xiaomi', 'Vivo', 'Oppo', 'OnePlus', 'Realme', 'Motorola'];

  const faqs = [
    { q: 'How long does a typical repair take?', a: 'Over 85% of standard repairs like screens, batteries, and port swaps are completed within 1-2 hours. More complex repairs like motherboard diagnostic or water damage clean-up usually take 1-2 working days.' },
    { q: 'Do you use genuine and original parts?', a: 'Yes! We use 100% genuine parts or premium OEM-equivalent components. Every single part replacement comes with our solid 90-day comprehensive parts warranty.' },
    { q: 'Can I walk in without a pre-booked appointment?', a: 'Absolutely! Walk-ins are fully welcome Monday through Saturday. However, pre-booking an appointment guarantees zero queue wait time and places you with a dedicated specialist immediately upon arrival.' },
    { q: 'Do you repair water damaged phones?', a: 'Yes, we have advanced ultrasonic cleaners and micro-soldering workstations. Please turn off your wet phone immediately, DO NOT plug in the charger, and bring it to us as quickly as possible.' },
    { q: 'Is my personal data safe during the repair?', a: 'We handle your phone with strict security guidelines. However, we always recommend making a backup of your personal data before leaving any device for physical hardware repairs.' },
    { q: 'Do you offer home pickup and delivery?', a: 'Yes, we provide doorstep pickup and delivery services within a 10km radius of our service center for a flat diagnostic & convenience fee of ₹150.' },
  ];

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div id="service_catalog_container" className="space-y-8 animate-fade-in">
      {/* Brands section */}
      <div id="brands_section" className="bg-white dark:bg-slate-800/80 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400 mb-4 flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Supported Device Brands
        </h3>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {brands.map((brand, idx) => (
            <div 
              key={idx} 
              id={`brand_badge_${brand.toLowerCase()}`}
              className="flex items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium text-xs transition duration-200 shadow-sm border border-transparent hover:border-blue-200/50 dark:hover:border-blue-700/50"
            >
              {brand}
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Grid */}
      <div id="pricing_section">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <CircleDollarSign className="w-5.5 h-5.5 text-blue-600 dark:text-blue-400" /> Repair Service & Pricing Estimates
          </h2>
          <span className="text-xs bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-medium px-2.5 py-1 rounded-full border border-blue-200/30">
            90-Day Warranty Included
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {services.map((svc, idx) => (
            <div 
              key={idx} 
              id={`service_card_${idx}`}
              className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60 hover:shadow-md transition-shadow flex items-start justify-between group"
            >
              <div className="space-y-1.5 flex-1 pr-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{svc.icon}</span>
                  <h4 className="font-semibold text-slate-800 dark:text-white text-sm sm:text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {svc.name}
                  </h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {svc.desc}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 font-medium pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {svc.duration}
                  </span>
                  <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                    <ShieldCheck className="w-3.5 h-3.5" /> 90d warranty
                  </span>
                </div>
              </div>
              <div className="text-right flex flex-col justify-between h-full items-end gap-2">
                <span className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400">
                  {svc.price}
                </span>
                <button 
                  onClick={() => onSelectService(svc.name)}
                  className="text-[11px] bg-slate-50 dark:bg-slate-700 hover:bg-blue-600 dark:hover:bg-blue-500 text-slate-600 dark:text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg font-medium border border-slate-200/60 dark:border-slate-600/60 hover:border-blue-600 dark:hover:border-blue-500 transition-all cursor-pointer"
                >
                  Book Repair
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timings and Guidelines Info box */}
      <div id="timings_infobox" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50/55 dark:bg-blue-950/25 p-5 rounded-2xl border border-blue-100/55 dark:border-blue-900/30 flex items-start gap-4">
          <div className="p-3 bg-blue-600 text-white rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base">Center Opening Hours</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              📅 <strong>Monday – Saturday:</strong> 9:00 AM – 7:00 PM
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              🚫 <strong>Sunday:</strong> Closed (Emergency service support call routing active)
            </p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/60 flex items-start gap-4">
          <div className="p-3 bg-slate-500 text-white rounded-xl">
            <Compass className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 dark:text-white text-sm sm:text-base">Support Hotlines</h4>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              📞 <strong>Call support:</strong> +91-9876543210
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              📧 <strong>Technical queries:</strong> support@smartmobileservice.com
            </p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div id="faq_section" className="bg-white dark:bg-slate-800/80 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" /> Frequently Asked Questions (FAQ)
        </h3>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border-b border-slate-100 dark:border-slate-700/60 pb-3 last:border-none last:pb-0">
              <button 
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between text-left py-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-semibold text-slate-700 dark:text-slate-300 text-sm sm:text-base cursor-pointer"
              >
                <span>{faq.q}</span>
                <span className="text-slate-400 dark:text-slate-500 text-lg">
                  {activeFaq === idx ? '−' : '+'}
                </span>
              </button>
              {activeFaq === idx && (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 pl-1 leading-relaxed animate-slide-down">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
