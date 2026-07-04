import React, { useState, useEffect, useRef } from 'react';
import { Send, Volume2, VolumeX, Mic, MicOff, Trash2, Smartphone, Clock, Sparkles, MessageSquare, Info } from 'lucide-react';
import { Message } from '../types';

interface ChatbotPanelProps {
  onOpenBooking: () => void;
  onOpenTracking: () => void;
}

export function ChatbotPanel({ onOpenBooking, onOpenTracking }: ChatbotPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // TTS configuration
  const [isMuted, setIsMuted] = useState(true); // Default to muted to prevent unexpected audio
  
  // STT configuration
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize Chat History
  useEffect(() => {
    const saved = localStorage.getItem('smart_mobile_chat_history');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        loadDefaultGreetings();
      }
    } else {
      loadDefaultGreetings();
    }
  }, []);

  // Save Chat History
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('smart_mobile_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const loadDefaultGreetings = () => {
    const greetings: Message[] = [
      {
        id: 'welcome-1',
        sender: 'bot',
        text: "👋 Hi! Welcome to **Smart Mobile Service Center Customer Support**! I am **Smarty**, your AI support companion.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      {
        id: 'welcome-2',
        sender: 'bot',
        text: "How can I help you today? You can ask me questions about:\n- **Pricing** (e.g., 'How much to fix an iPhone display?')\n- **Service Centers** (e.g., 'What are your working hours?')\n- **Supported Brands** ('Do you repair OnePlus?')\n- **Warranty Details** or **Data Recovery**!\n\nOr click one of the quick options below! 👇",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setMessages(greetings);
  };

  // Web Speech API: Text to Speech (Speak bot text)
  const speakText = (text: string) => {
    if (isMuted) return;
    try {
      window.speechSynthesis.cancel(); // Stop active speaking

      // Strip markdown for cleaner audio synthesis
      const cleanText = text
        .replace(/\*\*/g, '')
        .replace(/[*#_`~]/g, '')
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        .replace(/[\n\r]+/g, ' ');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      // Select appropriate English voice if available
      const voices = window.speechSynthesis.getVoices();
      const engVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en-US') || v.lang.includes('en-GB'));
      if (engVoice) utterance.voice = engVoice;

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Speech synthesis error:', err);
    }
  };

  // Web Speech API: Speech to Text (Record audio)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-IN';

      rec.onstart = () => {
        setIsRecording(true);
      };

      rec.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        if (resultText) {
          setInputText(resultText);
          handleSubmitMessage(resultText);
        }
      };

      rec.onerror = (err: any) => {
        console.error('Speech recognition error:', err);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Safari.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your chat logs?')) {
      localStorage.removeItem('smart_mobile_chat_history');
      loadDefaultGreetings();
    }
  };

  const handleSubmitMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text) return;

    setInputText('');

    // Add user message
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) throw new Error('API offline');

      const data = await res.json();
      
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);

      // Trigger TTS Voice reply
      speakText(data.text);

    } catch (err) {
      console.error('Failed to communicate with support chatbot:', err);
      const errorMsg: Message = {
        id: `bot-err-${Date.now()}`,
        sender: 'bot',
        text: "⚠️ I am currently facing minor offline network lag. Please connect with our hotlines directly at **+91-9876543210**.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
      setIsTyping(false);
    }
  };

  const formatMessageText = (text: string) => {
    // Process bullet points and simple markdown-like elements
    const lines = text.split('\n');
    return lines.map((line, lidx) => {
      let content = line;
      
      // Bold text handling
      const boldRegex = /\*\*([^*]+)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
          parts.push(content.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-bold text-slate-800 dark:text-slate-100">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      
      if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
      }

      const elements = parts.length > 0 ? parts : content;

      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={lidx} className="list-disc ml-4 my-1 pl-1 text-xs sm:text-sm leading-relaxed">
            {line.substring(2)}
          </li>
        );
      }
      
      return (
        <p key={lidx} className="text-xs sm:text-sm leading-relaxed mb-1 min-h-[1.2rem]">
          {elements}
        </p>
      );
    });
  };

  const quickChips = [
    { label: 'Screen cost?', text: 'How much for a smartphone screen replacement?' },
    { label: 'Repair hours?', text: 'What are your working hours?' },
    { label: 'Genuine parts?', text: 'Do you use genuine/original parts?' },
    { label: 'Track JOB101', text: 'Track repair status for JOB101' },
    { label: 'Home pickup?', text: 'Do you provide home pickup and delivery?' },
    { label: 'Warranty duration?', text: 'What is your repair warranty?' }
  ];

  return (
    <div id="chatbot_panel" className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700/60 flex flex-col h-[580px] sm:h-[650px] overflow-hidden relative">
      {/* Bot Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-5 py-4 text-white flex items-center justify-between shadow-sm relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner relative">
            <Sparkles className="w-5.5 h-5.5 text-yellow-300 animate-pulse" />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base leading-tight flex items-center gap-1.5">
              Smarty <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-normal uppercase tracking-wider">AI Support</span>
            </h3>
            <p className="text-[11px] text-blue-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-blue-200 rounded-full animate-ping"></span>
              Always active • Answers in seconds
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* TTS toggler */}
          <button 
            onClick={() => {
              const nextMute = !isMuted;
              setIsMuted(nextMute);
              if (!nextMute) {
                // Speak confirmation
                speakText("Voice response enabled!");
              } else {
                window.speechSynthesis.cancel();
              }
            }}
            title={isMuted ? "Enable Voice Output (TTS)" : "Mute Voice Output"}
            className={`p-2 rounded-xl transition duration-150 cursor-pointer ${
              isMuted ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-yellow-300 bg-white/10 hover:bg-white/20'
            }`}
          >
            {isMuted ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
          </button>

          {/* Delete history */}
          <button 
            onClick={handleClearHistory}
            title="Clear Chat Logs"
            className="p-2 text-white/60 hover:text-red-300 hover:bg-white/10 rounded-xl transition duration-150 cursor-pointer"
          >
            <Trash2 className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Messages List Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/40 relative">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            id={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-xs ${
              msg.sender === 'user'
                ? 'bg-blue-600 text-white rounded-br-none border border-blue-700 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-bl-none border border-slate-100 dark:border-slate-700/60'
            }`}>
              <div className="space-y-1">
                {formatMessageText(msg.text)}
              </div>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 block text-right mt-1">
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5">
              <span className="text-xs text-slate-400">Smarty is writing</span>
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-300"></span>
              </span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggestion Chips Section */}
      <div className="px-3 py-2 bg-slate-50/50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-700/50 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-hide">
        {quickChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSubmitMessage(chip.text)}
            className="inline-block text-[10px] sm:text-[11px] bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/20 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold px-2.5 py-1.5 rounded-full border border-slate-200/55 dark:border-slate-700/55 hover:border-blue-300 dark:hover:border-blue-800 transition duration-150 cursor-pointer shadow-xs"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input Form Box */}
      <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700/60 relative">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitMessage(inputText);
          }}
          className="flex items-center gap-2"
        >
          {/* Mic Button */}
          <button
            type="button"
            onClick={toggleRecording}
            title={isRecording ? "Recording active. Speak now..." : "Trigger Speech Dictation (STT)"}
            className={`p-3 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                : 'bg-slate-50 dark:bg-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400'
            }`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input 
            type="text"
            placeholder={isRecording ? "Listening to your voice..." : "Ask Smarty anything..."}
            value={inputText}
            disabled={isRecording}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900/50 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-slate-400"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 dark:disabled:bg-slate-700 text-white disabled:text-slate-400 flex items-center justify-center shadow-md shadow-blue-500/10 cursor-pointer transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
