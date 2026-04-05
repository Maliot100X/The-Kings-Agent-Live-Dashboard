'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '@/types';
import { Send, MessageCircle, X, Bot, Crown, Minimize2, Sparkles } from 'lucide-react';

interface FloatingKingBotProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isMinimized?: boolean;
}

export function FloatingKingBot({ messages, onSendMessage, isMinimized = true }: FloatingKingBotProps) {
  const [open, setOpen] = useState(!isMinimized);
  const [input, setInput] = useState('');
  const [minimized, setMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (open && !minimized) {
      scrollToBottom();
    }
  }, [messages, open, minimized]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  // Predefined quick responses
  const quickResponses = [
    "What's the system status?",
    "Show active agents",
    "List pending tasks",
    "Check for errors",
  ];

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-king-gold to-orange-500 shadow-lg glow-gold flex items-center justify-center group"
          >
            <div className="absolute inset-0 rounded-full bg-king-gold/30 animate-ping" />
            <Crown className="w-6 h-6 text-king-dark group-hover:rotate-12 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              height: minimized ? '60px' : '500px',
            }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 w-80 md:w-96 glass-strong rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-king-gold/20 bg-gradient-to-r from-king-gold/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-king-gold to-orange-400 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-king-dark" />
                </div>
                <div>
                  <h3 className="font-bold text-king-gold">King Hermes</h3>
                  <div className="flex items-center gap-1 text-xs text-green-400">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    Online
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMinimized(!minimized)}
                  className="p-1.5 rounded-lg hover:bg-king-gold/20 text-gray-400 hover:text-king-gold transition-colors"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Content */}
            {!minimized && (
              <>
                <div className="h-80 overflow-y-auto p-4 space-y-4">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`flex gap-3 ${
                          message.role === 'user' ? 'flex-row-reverse' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.role === 'assistant'
                            ? 'bg-king-gold/20 border border-king-gold'
                            : 'bg-blue-500/20 border border-blue-500'
                        }`}>
                          {message.role === 'assistant' ? (
                            <Crown className="w-4 h-4 text-king-gold" />
                          ) : (
                            <MessageCircle className="w-4 h-4 text-blue-400" />
                          )}
                        </div>

                        <div className={`max-w-[75%] rounded-lg p-3 text-sm ${
                          message.role === 'user'
                            ? 'bg-blue-500/20 border border-blue-500/30 text-blue-100'
                            : 'bg-king-gold/10 border border-king-gold/30 text-gray-200'
                        }`}>
                          {message.content}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Quick Responses */}
                  {messages.length < 3 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {quickResponses.map((response) => (
                        <button
                          key={response}
                          onClick={() => {
                            onSendMessage(response);
                          }}
                          className="text-xs px-3 py-1.5 rounded-full bg-king-gold/10 border border-king-gold/30 text-king-gold hover:bg-king-gold/20 transition-colors"
                        >
                          <Sparkles className="w-3 h-3 inline mr-1" />
                          {response}
                        </button>
                      ))}
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="p-4 border-t border-king-gold/20">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Command your sovereign..."
                      className="flex-1 bg-gray-800/50 border border-king-gold/30 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-king-gold"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      className="px-4 py-2 bg-king-gold/20 border border-king-gold rounded-lg text-king-gold hover:bg-king-gold/30 transition-colors disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
