'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Crown, Bot, User } from 'lucide-react';
import gsap from 'gsap';
import { ChatMessage } from '../hooks/useWebSocket';

interface Props {
  chatMessages: ChatMessage[];
  sendChat: (content: string) => void;
}

export default function TabChat({ chatMessages, sendChat }: Props) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
      );
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendChat(input);
    setInput('');
  };

  const getAvatar = (from: string) => {
    if (from === 'King Hermes') {
      return (
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg">
          <Crown className="w-5 h-5 text-white" />
        </div>
      );
    } else if (from === 'You') {
      return (
        <div className="w-10 h-10 rounded-xl bg-emerald/20 flex items-center justify-center">
          <User className="w-5 h-5 text-emerald" />
        </div>
      );
    } else {
      return (
        <div className="w-10 h-10 rounded-xl bg-slate/20 flex items-center justify-center">
          <Bot className="w-5 h-5 text-slate" />
        </div>
      );
    }
  };

  const getMessageStyle = (from: string) => {
    if (from === 'You') {
      return 'bg-emerald/20 border border-emerald/30 ml-auto';
    } else if (from === 'King Hermes') {
      return 'bg-yellow-500/10 border border-yellow-500/30';
    } else {
      return 'bg-carbon border border-charcoal';
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col h-full max-h-[600px]">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-3">
          <Crown className="w-6 h-6 text-yellow-500" />
          <div>
            <h3 className="font-bold text-snow">King Hermes is Online</h3>
            <p className="text-slate text-sm">Your Supreme Agent Orchestrator is ready to serve.</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 bg-abyss/50 rounded-lg p-4 border border-charcoal">
        {chatMessages.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="w-16 h-16 text-charcoal mx-auto mb-4" />
            <p className="text-slate text-lg">No messages yet</p>
            <p className="text-parchment text-sm mt-2">
              Start a conversation with King Hermes
            </p>
          </div>
        ) : (
          chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.from === 'You' ? 'flex-row-reverse' : ''}`}
            >
              {getAvatar(msg.from)}
              <div
                className={`max-w-[75%] px-4 py-3 rounded-lg ${getMessageStyle(msg.from)}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-semibold ${
                    msg.from === 'King Hermes' ? 'text-yellow-500' : 
                    msg.from === 'You' ? 'text-emerald' : 'text-slate'
                  }`}>
                    {msg.from}
                  </span>
                  <span className="text-xs text-slate">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-snow text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Commands */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
        {['status', 'agents', 'help'].map((cmd) => (
          <button
            key={cmd}
            onClick={() => {
              setInput(cmd);
              sendChat(cmd);
            }}
            className="px-3 py-1.5 bg-charcoal/50 hover:bg-charcoal text-parchment text-xs rounded-full transition-colors border border-charcoal hover:border-emerald"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="bg-carbon border border-charcoal rounded-lg p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Command King Hermes..."
            className="flex-1 bg-abyss border border-charcoal rounded-lg px-4 py-2 text-sm text-snow placeholder-slate focus:outline-none focus:border-yellow-500 transition-colors"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg px-4 py-2 flex items-center gap-2 text-yellow-500 hover:bg-yellow-500/30 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
