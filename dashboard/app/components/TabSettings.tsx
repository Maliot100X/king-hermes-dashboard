'use client';

import { useState, useRef, useEffect } from 'react';
import { Settings, Server, Key, Globe, RefreshCw } from 'lucide-react';
import gsap from 'gsap';

interface Props {
  wsUrl: string;
  setWsUrl: (url: string) => void;
}

export default function TabSettings({ wsUrl, setWsUrl }: Props) {
  const [localUrl, setLocalUrl] = useState(wsUrl);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          duration: 0.5,
          ease: 'power3.out',
        }
      );
    }
  }, []);

  const handleSave = () => {
    setWsUrl(localUrl);
    alert('Settings saved! Refresh to connect to new WebSocket URL.');
  };

  return (
    <div ref={containerRef} className="space-y-6 max-w-2xl">
      {/* WebSocket Settings */}
      <div className="bg-carbon border border-charcoal rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald/10 rounded-lg flex items-center justify-center">
            <Server className="w-5 h-5 text-emerald" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-snow">WebSocket Server</h3>
            <p className="text-slate text-sm">Configure real-time data connection</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-snow mb-2">
              WebSocket URL
            </label>
            <input
              type="text"
              value={localUrl}
              onChange={(e) => setLocalUrl(e.target.value)}
              className="w-full bg-abyss border border-charcoal rounded-lg px-4 py-2 text-snow focus:outline-none focus:border-emerald transition-colors"
            />
          </div>

          <button
            onClick={handleSave}
            className="bg-emerald/20 border border-emerald/50 text-emerald px-4 py-2 rounded-lg hover:bg-emerald/30 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Save & Reconnect
          </button>
        </div>
      </div>

      {/* Agent Paths */}
      <div className="bg-carbon border border-charcoal rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-king-gold/10 rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-king-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-snow">Agent Configuration</h3>
            <p className="text-slate text-sm">Agent command paths and settings</p>
          </div>
        </div>

        <div className="space-y-3">
          {[
            { name: 'OpenCode', cmd: 'opencode', path: '/usr/bin/opencode' },
            { name: 'Gemini', cmd: 'gemini', path: '/snap/bin/gemini' },
            { name: 'Claude', cmd: 'claude', path: '/usr/bin/claude' },
            { name: 'Roo', cmd: 'roo', path: '/usr/bin/roo' },
            { name: 'OpenClaw', cmd: 'openclaw', path: '/usr/bin/openclaw' },
          ].map((agent) => (
            <div
              key={agent.name}
              className="flex items-center justify-between bg-abyss rounded-lg p-3 border border-charcoal"
            >
              <div className="flex items-center gap-3">
                <code className="text-emerald text-sm font-mono">
                  {agent.cmd}
                </code>
                <span className="text-slate text-sm">{agent.path}</span>
              </div>
              <span className="text-xs text-parchment bg-charcoal px-2 py-1 rounded">
                Auto-detected
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-carbon border border-charcoal rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-mint/10 rounded-lg flex items-center justify-center">
            <Key className="w-5 h-5 text-mint" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-snow">API Configuration</h3>
            <p className="text-slate text-sm">External API keys and tokens</p>
          </div>
        </div>

        <div className="bg-abyss rounded-lg p-4 border border-charcoal">
          <p className="text-parchment text-sm mb-2">
            API keys are loaded from environment variables:
          </p>
          <ul className="space-y-1 text-xs font-mono text-slate">
            <li>• OPENAI_API_KEY (Fireworks AI)</li>
            <li>• GEMINI_API_KEY</li>
            <li>• CLAUDE_API_KEY</li>
            <li>• WS_PORT (WebSocket port, default: 8080)</li>
          </ul>
        </div>
      </div>

      {/* About */}
      <div className="bg-carbon border border-charcoal rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-king-gold/20 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-king-gold" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-snow">About</h3>
            <p className="text-slate text-sm">King Hermes Supreme Dashboard v2.0</p>
          </div>
        </div>

        <div className="space-y-2 text-sm text-parchment">
          <p>Built with:</p>
          <ul className="list-disc list-inside text-slate space-y-1 ml-4">
            <li>Next.js 16 + React 19</li>
            <li>Three.js + React Three Fiber</li>
            <li>GSAP Animations</li>
            <li>Tailwind CSS</li>
            <li>Recharts</li>
            <li>VoltAgent Design System</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
