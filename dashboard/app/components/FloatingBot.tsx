'use client';

import { useState, useRef, useEffect } from 'react';
import { Crown, Send, X, Bot } from 'lucide-react';
import gsap from 'gsap';
import { ChatMessage } from '../hooks/useWebSocket';

interface Props {
  chatMessages: ChatMessage[];
  sendChat: (content: string) => void;
}

export default function FloatingBot({ chatMessages, sendChat }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      from: 'King Hermes',
      content: 'Greetings! I am King Hermes, your Supreme Agent Orchestrator. Type "help" for commands.',
      timestamp: new Date().toISOString(),
    },
  ]);

  const botRef = useRef<HTMLButtonElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Combine local welcome with server messages
  const allMessages = [...localMessages, ...chatMessages.filter(
    m => !localMessages.find(lm => lm.id === m.id)
  )];

  // Float animation for the button
  useEffect(() => {
    if (!isOpen && botRef.current) {
      gsap.to(botRef.current, {
        y: -8,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    }
  }, [isOpen]);

  // Open animation
  useEffect(() => {
    if (isOpen && windowRef.current) {
      gsap.fromTo(
        windowRef.current,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
      );
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message locally
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      from: 'You',
      content: input,
      timestamp: new Date().toISOString(),
    };
    setLocalMessages((prev) => [...prev, userMsg]);
    
    // Send to server
    sendChat(input);
    setInput('');
  };

  const getAvatar = (from: string) => {
    if (from === 'King Hermes') {
      return (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
          <Crown className="w-4 h-4 text-white" />
        </div>
      );
    } else if (from === 'You') {
      return (
        <div className="w-8 h-8 rounded-lg bg-emerald/20 flex items-center justify-center">
          <span className="text-emerald text-xs font-bold">You</span>
        </div>
      );
    } else {
      return (
        <div className="w-8 h-8 rounded-lg bg-slate/20 flex items-center justify-center">
          <Bot className="w-4 h-4 text-slate" />
        </div>
      );
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        ref={botRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
          isOpen
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-gradient-to-br from-yellow-500 to-yellow-600 hover:shadow-yellow-500/50'
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Crown className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={windowRef}
          className="fixed bottom-24 right-6 z-50 w-96 h-[500px] bg-carbon border border-charcoal rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-b border-charcoal p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-snow">King Hermes</h3>
                <p className="text-xs text-slate">Supreme Agent Orchestrator</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-abyss/30">
            {allMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${
                  msg.from === 'You' ? 'flex-row-reverse' : ''
                }`}
              >
                {getAvatar(msg.from)}
                <div
                  className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                    msg.from === 'You'
                      ? 'bg-emerald/20 text-emerald'
                      : msg.from === 'King Hermes'
                      ? 'bg-yellow-500/10 text-snow border border-yellow-500/30'
                      : 'bg-carbon text-snow'
                  }`}
                >
                  <p className="text-xs font-semibold mb-1">
                    {msg.from}
                  </p>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs text-slate mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Commands */}
          <div className="px-4 py-2 border-t border-charcoal bg-carbon flex gap-2 overflow-x-auto">
            {['status', 'agents', 'help'].map((cmd) => (
              <button
                key={cmd}
                onClick={() => {
                  setInput(cmd);
                  const userMsg: ChatMessage = {
                    id: Date.now().toString(),
                    from: 'You',
                    content: cmd,
                    timestamp: new Date().toISOString(),
                  };
                  setLocalMessages((prev) => [...prev, userMsg]);
                  sendChat(cmd);
                  setInput('');
                }}
                className="px-2 py-1 bg-charcoal/50 text-parchment text-xs rounded-full hover:bg-charcoal transition-colors"
              >
                {cmd}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-4 border-t border-charcoal bg-carbon"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Command the agents..."
                className="flex-1 bg-abyss border border-charcoal rounded-lg px-4 py-2 text-sm text-snow placeholder-slate focus:outline-none focus:border-yellow-500 transition-colors"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-500 hover:bg-yellow-500/30 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
