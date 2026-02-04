/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Sparkles, BookOpen, Quote, Loader2, User, Brain, RotateCcw } from 'lucide-react';
import Markdown from 'react-markdown';
import { askPhilip } from './services/gemini';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  role: 'user' | 'model';
  content: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const clearChat = () => {
    setMessages([]);
    setInput('');
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const response = await askPhilip(userMessage, history);
      const philipResponse = response.text || "I'm sorry, I couldn't formulate a response at this moment.";
      
      setMessages(prev => [...prev, { role: 'model', content: philipResponse }]);
    } catch (error: any) {
      console.error(error);
      let errorMessage = error.message || "I apologize, but I encountered an error while contemplating your question.";
      
      // Friendly handling for Rate Limits (429)
      if (errorMessage.includes("429") || errorMessage.includes("quota")) {
        errorMessage = "We're thinking a bit too fast for the free tier! Please wait about 30-60 seconds and try your question again. Philip's thoughts take a moment to process.";
      }

      setMessages(prev => [...prev, { role: 'model', content: `**Note:** ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <header className="mb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="cursor-pointer group"
          onClick={clearChat}
          title="Click to reset dialogue"
        >
          <h1 className="text-6xl md:text-8xl font-light tracking-tighter mb-4 italic group-hover:text-olive transition-colors">
            Ask Philip
          </h1>
          <div className="flex items-center justify-center gap-4 text-olive/60 uppercase tracking-widest text-xs font-sans font-semibold">
            <span>Philosopher</span>
            <span className="w-1 h-1 bg-olive/30 rounded-full" />
            <span>Free Will Specialist</span>
            <span className="w-1 h-1 bg-olive/30 rounded-full" />
            <a 
              href="https://sites.google.com/corp/site/philipjswenson/home" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-olive transition-colors underline underline-offset-4 decoration-olive/20"
              onClick={(e) => e.stopPropagation()}
            >
              Research
            </a>
            <span className="w-1 h-1 bg-olive/30 rounded-full" />
            <a 
              href="https://philpapers.org/s/Philip%20Swenson" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-olive transition-colors underline underline-offset-4 decoration-olive/20"
              onClick={(e) => e.stopPropagation()}
            >
              PhilPapers
            </a>
          </div>
        </motion.div>
      </header>

      {/* Chat Container */}
      <main className="flex-1 flex flex-col bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden relative">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scroll-smooth"
        >
          <AnimatePresence initial={false}>
            {messages.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12"
              >
                <div className="w-16 h-16 rounded-full bg-olive/5 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-olive/40" />
                </div>
                <div className="max-w-md">
                  <h2 className="text-2xl font-medium mb-2">Begin the Dialogue</h2>
                  <p className="text-olive/60 leading-relaxed">
                    Inquire about moral responsibility, the nature of agency, or recent developments in the philosophy of free will.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                  {[
                    "Do we have free will?",
                    "Is moral responsibility compatible with determinism?",
                    "How does the Multiverse affect the problem of evil?",
                    "What is the 'Ability to Do Otherwise'?"
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="text-left p-4 rounded-xl border border-black/5 hover:bg-olive/5 transition-colors text-sm font-sans"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-4 md:gap-6",
                  message.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  message.role === 'user' ? "bg-olive text-white" : "bg-olive/10 text-olive"
                )}>
                  {message.role === 'user' ? <User size={20} /> : <Quote size={20} />}
                </div>
                <div className={cn(
                  "max-w-[85%] rounded-2xl p-5 md:p-6",
                  message.role === 'user' 
                    ? "bg-olive/5 text-ink font-sans" 
                    : "bg-transparent text-ink"
                )}>
                  {message.role === 'model' ? (
                    <div className="markdown-body">
                      <Markdown>{message.content}</Markdown>
                    </div>
                  ) : (
                    <p className="leading-relaxed">{message.content}</p>
                  )}
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4 md:gap-6"
              >
                <div className="w-10 h-10 rounded-full bg-olive/10 flex items-center justify-center shrink-0">
                  <Loader2 className="w-5 h-5 text-olive animate-spin" />
                </div>
                <div className="p-6 italic text-olive/60">
                  Philip is contemplating...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-black/5 bg-white/80 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="relative flex items-center gap-3">
            <button
              type="button"
              onClick={clearChat}
              className="p-4 rounded-2xl text-olive/40 hover:text-olive hover:bg-olive/5 transition-all"
              title="Reset Dialogue"
            >
              <RotateCcw size={24} />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a philosophical question..."
              className="flex-1 bg-olive/5 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-olive/20 outline-none font-sans text-lg transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-olive text-white p-4 rounded-2xl hover:bg-olive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-olive/20"
            >
              <Send size={24} />
            </button>
          </form>
          <p className="text-center text-[10px] text-olive/40 mt-4 uppercase tracking-widest font-sans font-bold">
            Powered by Gemini & Philip Swenson's Research
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 text-center text-olive/40 font-sans text-sm">
        <p>© {new Date().getFullYear()} Ask Philip. All philosophical inquiries welcomed.</p>
      </footer>
    </div>
  );
}
