'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage } from '@/types';
import { Send, Bot, User, Sparkles } from 'lucide-react';

interface ChatTabProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
}

export function ChatTab({ messages, onSendMessage }: ChatTabProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-king-gold/20 flex items-center justify-center border border-king-gold">
          <Sparkles className="w-5 h-5 text-king-gold" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-king-gold">King Hermes</h2>
          <p className="text-xs text-gray-400">Your sovereign AI orchestrator</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
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
                  <Bot className="w-4 h-4 text-king-gold" />
                ) : (
                  <User className="w-4 h-4 text-blue-400" />
                )}
              </div>

              <div className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-500/20 border border-blue-500/30'
                  : 'glass'
              }`}>
                <p className={`text-sm ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-200'
                }`}>
                  {message.content}
                </p>
                <span className="text-xs text-gray-500 mt-1 block">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask King Hermes..."
          className="flex-1 bg-gray-800/50 border border-king-gold/30 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-king-gold"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="px-4 py-2 bg-king-gold/20 border border-king-gold rounded-lg text-king-gold hover:bg-king-gold/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
