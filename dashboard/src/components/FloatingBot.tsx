'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Crown, Loader2, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface FloatingBotProps {
  isConnected?: boolean;
  wsSend?: (event: string, data: unknown) => boolean;
}

export function FloatingBot({ isConnected = true, wsSend }: FloatingBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Greetings! I am King Hermes, the supreme orchestrator of this agent swarm. How may I assist you today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Send to King Hermes via WebSocket if connected
    if (wsSend && isConnected) {
      wsSend('chat:message', {
        message: input,
        userId: 'dashboard-user',
        timestamp: Date.now(),
      });
    }

    // Simulate King Hermes response (replace with real API call)
    setTimeout(() => {
      const responses = [
        'I have dispatched my agents to handle your request. They are working in parallel to find the optimal solution.',
        'The swarm is analyzing your query. I shall have a comprehensive answer momentarily.',
        'My agents have completed their analysis. Here is what they discovered...',
        'I am coordinating multiple specialized agents to address your needs efficiently.',
        'The orchestration is complete. I have synthesized the perfect response for you.',
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: randomResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all',
          'bg-gradient-to-br from-neon-purple to-neon-pink',
          isOpen && 'rotate-45'
        )}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
            <MessageCircle className="w-6 h-6 text-white" />
            {!isConnected && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-dark-800" />
            )}
          </div>
        )}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-dark-800 rounded-2xl border border-dark-600 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-dark-700 to-dark-800 border-b border-dark-600">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div className={cn(
                  'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-dark-800',
                  isConnected ? 'bg-neon-green' : 'bg-red-500'
                )} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">King Hermes</h3>
                <p className="text-xs text-gray-400">
                  {isConnected ? 'Supreme Orchestrator' : 'Offline'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-dark-600 scrollbar-track-transparent">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    message.role === 'user' 
                      ? 'bg-supreme-600' 
                      : 'bg-gradient-to-br from-neon-purple to-neon-pink'
                  )}>
                    {message.role === 'user' ? (
                      <span className="text-xs text-white font-bold">U</span>
                    ) : (
                      <Crown className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={cn(
                    'max-w-[75%] px-4 py-2 rounded-2xl',
                    message.role === 'user'
                      ? 'bg-supreme-600 text-white rounded-br-none'
                      : 'bg-dark-700 text-gray-200 rounded-bl-none'
                  )}>
                    <p className="text-sm">{message.content}</p>
                    <span className="text-xs opacity-50 mt-1 block">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-purple to-neon-pink flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-dark-700 px-4 py-3 rounded-2xl rounded-bl-none">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-dark-600 bg-dark-700/50">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask King Hermes anything..."
                  disabled={!isConnected}
                  className={cn(
                    'flex-1 px-4 py-2 bg-dark-900 border border-dark-600 rounded-full text-sm text-white placeholder-gray-500',
                    'focus:outline-none focus:border-neon-purple transition-colors',
                    !isConnected && 'opacity-50 cursor-not-allowed'
                  )}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={!input.trim() || !isConnected || isTyping}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                    input.trim() && isConnected && !isTyping
                      ? 'bg-neon-purple text-white'
                      : 'bg-dark-600 text-gray-500'
                  )}
                >
                  {isTyping ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
