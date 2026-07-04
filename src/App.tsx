import React, { useState, useEffect } from 'react';
import { ServiceCatalog } from './components/ServiceCatalog';
import { AppointmentForm } from './components/AppointmentForm';
import { JobTracker } from './components/JobTracker';
import { FeedbackForm } from './components/FeedbackForm';
import { AdminPanel } from './components/AdminPanel';
import { ChatbotPanel } from './components/ChatbotPanel';
import { 
  Sun, Moon, ShieldCheck, Clock, Phone, MapPin, Sparkles, MessageSquare, 
  Wrench, CalendarDays, Ticket, Heart, Settings, X, ChevronRight, Menu
} from 'lucide-react';

type TabType = 'services' | 'book' | 'track' | 'feedback' | 'admin';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('services');
  const [selectedService, setSelectedService] = useState<string>('');
  const [darkMode, setDarkMode] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize Dark Mode on startup
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const navItems = [
    { id: 'services', label: 'Services & Pricing', icon: Wrench },
    { id: 'book', label: 'Book Appointment', icon: CalendarDays },
    { id: 'track', label: 'Track Repair Status', icon: Ticket },
    { id: 'feedback', label: 'Customer Feedback', icon: Heart },
    { id: 'admin', label: 'Staff Admin Panel', icon: Settings }
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-200 flex flex-col">
      
      {/* HEADER SECTION */}
      <header id="main_header" className="bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/80 sticky top-0 z-40 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          
          {/* Logo Brand Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Wrench className="w-5.5 h-5.5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg tracking-tight leading-tight flex items-center gap-2">
                Smart Mobile <span className="text-blue-600 dark:text-blue-400 font-medium text-xs sm:text-sm">Service Chatbot</span>
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500">Fast, Reliable Diagnostics & Certified Hardware Repairs</p>
            </div>
          </div>

          {/* Quick Actions / Toggles */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dark Mode toggle button */}
            <button
              id="theme_toggle_btn"
              onClick={toggleDarkMode}
              title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-500 dark:text-slate-400 border border-slate-200/40 dark:border-slate-700/40 transition duration-150 cursor-pointer shadow-inner"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Mobile nav toggler button */}
            <button
              id="mobile_nav_btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors border border-slate-200/40 dark:border-slate-700/40 cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MOBILE NAVIGATION DROPDOWN */}
        {isMobileMenuOpen && (
          <div id="mobile_dropdown_nav" className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1.5 animate-slide-down">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  id={`mobile_tab_${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-xs transition duration-150 cursor-pointer text-left ${
                    activeTab === item.id 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* CORE BODY CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-6">
        
        {/* LEFT COMPONENT COLUMN (Service Info + Form tabs) */}
        <div className="flex-1 space-y-6">
          
          {/* DESKTOP TAB NAVIGATION RAIL */}
          <nav id="desktop_tabs_navigation" className="hidden md:flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  id={`tab_btn_${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSelectedService('');
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition duration-150 cursor-pointer ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/10'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* ACTIVE CONTENT VIEW WINDOW */}
          <div id="active_view_viewport" className="min-h-[480px]">
            {activeTab === 'services' && (
              <ServiceCatalog 
                onSelectService={(svcName) => {
                  setSelectedService(svcName);
                  setActiveTab('book');
                }} 
              />
            )}
            
            {activeTab === 'book' && (
              <AppointmentForm 
                initialServiceName={selectedService} 
                onSuccess={() => {}}
              />
            )}
            
            {activeTab === 'track' && <JobTracker />}
            
            {activeTab === 'feedback' && (
              <FeedbackForm onSuccess={() => {}} />
            )}
            
            {activeTab === 'admin' && <AdminPanel />}
          </div>
        </div>

        {/* RIGHT CHATBOT COMPONENT PANEL (Desktop Sidebar) */}
        <div className="hidden md:block w-96 flex-shrink-0">
          <div className="sticky top-24">
            <ChatbotPanel 
              onOpenBooking={() => setActiveTab('book')}
              onOpenTracking={() => setActiveTab('track')}
            />
          </div>
        </div>
      </main>

      {/* MOBILE FLOATING CHATBOT CONTROLLER */}
      <div className="md:hidden">
        {/* Floating rounded green chat button */}
        <button
          id="mobile_chat_fab"
          onClick={() => setIsMobileChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 hover:scale-105 transition-transform duration-150 z-40 cursor-pointer"
        >
          <MessageSquare className="w-6 h-6 animate-pulse" />
          {/* Notification red dot */}
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
        </button>

        {/* Mobile slide-up chat sheet */}
        {isMobileChatOpen && (
          <div id="mobile_chat_overlay" className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex flex-col justify-end">
            <div className="bg-white dark:bg-slate-800 rounded-t-3xl h-[85vh] flex flex-col relative animate-slide-down">
              
              {/* Close handler bar */}
              <div className="absolute top-3 right-4 z-20">
                <button
                  onClick={() => setIsMobileChatOpen(false)}
                  className="p-1.5 bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-300 rounded-full border border-slate-200/20 cursor-pointer hover:scale-105 transition-transform"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mounted Chatbot */}
              <div className="flex-1 overflow-hidden rounded-t-3xl">
                <ChatbotPanel 
                  onOpenBooking={() => {
                    setActiveTab('book');
                    setIsMobileChatOpen(false);
                  }}
                  onOpenTracking={() => {
                    setActiveTab('track');
                    setIsMobileChatOpen(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER SECTION */}
      <footer id="main_footer" className="bg-white dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800/80 py-6 mt-auto text-center transition-colors">
        <div className="max-w-7xl mx-auto px-4 text-xs text-slate-400 dark:text-slate-500 space-y-2">
          <p className="font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
            Smart Mobile Service Center • Certified Engineers • Genuine OEM Components
          </p>
          <p>© 2026 Smart Mobile Service Center Chatbot. All rights reserved. Designed with premium high-contrast theme layout.</p>
        </div>
      </footer>
    </div>
  );
}
