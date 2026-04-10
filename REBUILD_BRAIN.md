# KING HERMES DASHBOARD - COMPLETE REBUILD BRAIN FILE

## User Requirements (CRITICAL - READ FIRST)

**MASTER'S DEMANDS:**
1. FULLY ANIMATED dashboard - every element must have smooth animations
2. COOL BACKGROUND - not boring static, must be alive and moving
3. ORIGINAL AGENT ICONS - use the REAL logos/brands for each agent:
   - OpenClaw (not generic claw icon - get the actual OpenClaw logo)
   - Gemini (Google's actual Gemini logo/icon)
   - Claude (Anthropic's Claude actual logo)
   - King Hermes (custom crown/gold theme - we are the supreme orchestrator)
   - OpenCode (actual OpenCode.ai logo)
4. USE ALL SKILLS AND TOOLS - this means:
   - GSAP animations (from /workspace/GSAP/)
   - VoltAgent design system (from /workspace/awesome-design-md/design-md/voltagent/)
   - Claude design system (from /workspace/awesome-design-md/design-md/claude/)
   - OpenCode.ai design system (from /workspace/awesome-design-md/design-md/opencode.ai/)
   - Any other relevant design systems
5. PERFECT DESIGN - pixel perfect, professional, production-grade
6. EVERYTHING MUST WORK WITH REAL DATA - no mock data, no fake agents
7. NO ERRORS - TypeScript, build, runtime - all must be clean

## Resources Available

### Design Systems (54 total in /workspace/awesome-design-md/design-md/)
Key ones for this project:
- **voltagent/** - Deep space command terminal, emerald green (#00d992), Abyss Black (#050507)
- **claude/** - Warm parchment, Anthropic serif, terracotta (#c96442)
- **opencode.ai/** - Berkeley Mono font, terminal-native, warm dark (#201d1d)
- **cursor/** - AI code editor, sleek dark
- **together.ai/** - Open-source AI infrastructure
- **minimax/** - Bold dark with neon accents
- **ollama/** - Terminal-first, monochrome

### Animation Library
- **GSAP** cloned at /workspace/GSAP/
- Use for: agent orb animations, transitions, hover effects, background particles

### Inspiration
- **awesome-ai-apps** at /workspace/awesome-ai-apps/ - 700+ AI app references

### Current Dashboard Location
- Dashboard: /workspace/king-hermes-supreme-dashboard/dashboard/
- Server: /workspace/king-hermes-supreme-dashboard/server/
- Current has basic structure but needs complete redesign

## Agent Configuration

Each agent card must show:
1. **Original Brand Logo/Icon** (not generic colored circles)
2. **Real-time Status** (online/offline/busy from ps aux)
3. **Live CPU/Memory** (from /proc/[pid]/stat)
4. **Current Task** (what they're working on)
5. **Task Input Field** (to spawn new tasks)
6. **Color coding per agent**:
   - King Hermes: Gold (#FFD700) - The Supreme
   - OpenClaw: Need to check - likely Orange/Red
   - Gemini: Google's blue/cyan colors
   - Claude: Anthropic's terracotta (#c96442)
   - OpenCode: Warm dark (#201d1d) with light text

## Technical Requirements

### Stack
- Next.js 16+ with App Router
- TypeScript (NO ANY TYPES - proper interfaces)
- Tailwind CSS v4
- Three.js + React Three Fiber (@react-three/fiber, @react-three/drei)
- GSAP (@gsap/react, gsap)
- WebSocket for real-time data
- Recharts for system metrics graphs

### Real Data Sources
- **CPU**: /proc/stat
- **Memory**: /proc/meminfo
- **Disk**: df -h /
- **Agent PIDs**: ps aux | grep [agent]
- **Agent CPU/Mem**: /proc/[pid]/stat and /proc/[pid]/status

### Must Fix From Previous Build
1. TypeScript errors with @react-three/postprocessing
2. WebSocket reconnect logic with exponential backoff
3. Build output copying (.next/static to standalone)
4. Process detection for all agents (not just Roo)
5. OpenClaude env var setup (Fireworks AI, not Anthropic)

## Design Specifications

### Color Scheme (Combine VoltAgent + Custom)
```
--abyss-black: #050507       (Page background)
--carbon-surface: #101010     (Card backgrounds)
--warm-charcoal: #3d3a39      (Borders)
--emerald-signal: #00d992     (Primary accent, glows)
--voltagent-mint: #2fd6a1     (Button text)
--snow-white: #f2f2f2        (Primary text)
--pure-white: #ffffff        (Headings)
--king-hermes-gold: #FFD700   (Our brand)
--openclaw-orange: #FF6B35   (OpenClaw brand - TBD)
--gemini-blue: #4285F4        (Google Gemini blue)
--claude-terracotta: #c96442  (Anthropic brand)
--opencode-dark: #201d1d      (OpenCode terminal)
```

### Typography
- **Headings**: system-ui (native OS font), tight line-height (1.0-1.11), negative letter-spacing
- **Body**: Inter, 16px, weight 400-500
- **Code/Terminal**: SFMono-Regular or Berkeley Mono
- **King Hermes Titles**: Bold, gold gradient text

### Animations (GSAP + Framer Motion)
1. **Page Load**: Staggered fade-in from top (header → tabs → content)
2. **Tab Switching**: Cross-fade with slide (0.3s ease-out)
3. **Agent Cards**: Hover lift with glow, pulse when busy
4. **Background**: 
   - Three.js particle galaxy (1500+ particles)
   - Orbiting agent spheres that glow based on status
   - King Hermes center sphere with golden aura
5. **Charts**: Smooth line drawing animation
6. **Notifications**: Slide-in from right with bounce
7. **WebSocket Connect**: Status dot pulse animation

### 3D Scene Components
1. **Particle Galaxy**: 3000+ gold particles, slow rotation
2. **King Hermes Core**: Large golden sphere with rotating ring
3. **Agent Orbiters**: 5 spheres in different orbits, colors match agent brands
4. **Connection Lines**: Glowing trails between agents when communicating
5. **Stars Background**: @react-three/drei Stars component

### Layout Structure
```
┌─────────────────────────────────────────────┐
│  Header (King Hermes crown logo + nav)      │
├─────────────────────────────────────────────┤
│  Tab Bar (6 tabs with icons)                │
├─────────────────────────────────────────────┤
│                                             │
│  ┌─────────────────┐  ┌─────────────────┐  │
│  │                 │  │                 │  │
│  │   3D Scene      │  │   Agent Cards   │  │
│  │   (Three.js)    │  │   or System     │  │
│  │                 │  │   Metrics       │  │
│  │                 │  │                 │  │
│  └─────────────────┘  └─────────────────┘  │
│                                             │
├─────────────────────────────────────────────┤
│  Floating Bot (King Hermes chat)            │
└─────────────────────────────────────────────┘
```

## Tab Contents

### 1. Agents Tab
- 3D scene showing orbiting agent spheres
- Agent cards with original logos
- Real-time CPU/memory for each
- Task input per agent
- Task history

### 2. System Tab
- Real-time charts (Recharts):
  - CPU usage over time (line chart)
  - Memory usage (area chart)
  - Disk usage (bar chart)
- Live metrics cards
- Server uptime

### 3. Tasks Tab
- List of all running/completed tasks
- Filter by agent
- Task output preview
- Kill/restart buttons

### 4. Chat/Comms Tab
- Agent-to-agent communication log
- User chat interface
- Broadcast messages

### 5. Logs Tab
- Real-time activity log
- System events
- Error notifications
- Filter by severity

### 6. Settings Tab
- WebSocket URL config
- Agent command paths
- Theme settings
- API key configuration

## Agent Spawning Logic

### Commands Per Agent
```typescript
const AGENT_COMMANDS = {
  opencode: { cmd: 'opencode', args: ['run', task] },
  gemini: { cmd: '/snap/bin/gemini', args: ['-p', task] },
  claude: { 
    cmd: 'claude', 
    args: ['-p', task],
    env: {
      ANTHROPIC_API_KEY: '',
      ANTHROPIC_AUTH_TOKEN: '',
      CLAUDE_CODE_USE_OPENAI: '1',
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      OPENAI_BASE_URL: 'https://api.fireworks.ai/inference/v1',
      OPENAI_MODEL: 'accounts/fireworks/routers/kimi-k2p5-turbo'
    }
  },
  roo: { cmd: 'roo', args: ['-p', task] },
  openclaw: { cmd: 'openclaw', args: ['-p', task] }
}
```

## Build Checklist

### Phase 1: Setup & Design
- [ ] Read VoltAgent DESIGN.md completely
- [ ] Read OpenCode.ai DESIGN.md for agent styling
- [ ] Search/verify original agent logos (SVG preferred)
- [ ] Create color palette file (tailwind.config.ts)
- [ ] Setup GSAP with @gsap/react

### Phase 2: Core Components
- [ ] Rebuild 3D Scene3D with proper TypeScript
- [ ] Rebuild all 6 tabs with full functionality
- [ ] Create FloatingBot component
- [ ] Build agent cards with original icons
- [ ] Setup WebSocket hook with error handling

### Phase 3: Server & Real Data
- [ ] Verify WebSocket server reads real /proc data
- [ ] Fix agent process detection
- [ ] Test agent spawning with env vars
- [ ] Add comprehensive logging

### Phase 4: Polish & Animation
- [ ] Add GSAP page transitions
- [ ] Add hover animations to all interactive elements
- [ ] Background particle animation
- [ ] Loading states and skeletons
- [ ] Error boundaries

### Phase 5: Testing
- [ ] TypeScript check (npm run type-check)
- [ ] Build check (npm run build)
- [ ] Start server and dashboard
- [ ] Verify real data flowing
- [ ] Test each agent spawn
- [ ] Check all animations work

## Critical Files to Create/Modify

### New Files
1. `dashboard/app/lib/design-system.ts` - Color tokens, typography
2. `dashboard/app/components/Scene3D.tsx` - Complete rebuild with icons
3. `dashboard/app/components/AgentIcon.tsx` - Original brand logos
4. `dashboard/app/hooks/useAnimations.ts` - GSAP animations
5. `dashboard/public/agents/` - Store agent logo SVGs

### Modify
1. `dashboard/app/page.tsx` - Full redesign
2. `dashboard/app/components/TabAgents.tsx` - Original icons + animations
3. `dashboard/app/components/TabSystem.tsx` - Animated charts
4. `dashboard/app/components/FloatingBot.tsx` - GSAP animations
5. `server/websocket-server.js` - Verify real data + add logging

## Success Criteria

✅ Dashboard loads with no console errors
✅ 3D background renders smoothly (60fps)
✅ All 6 tabs switch with smooth animations
✅ Agent cards show ORIGINAL brand icons (not generic colors)
✅ Real agent status from `ps aux` displayed
✅ Real CPU/memory from `/proc` displayed
✅ Can spawn agents and see live output
✅ WebSocket reconnects automatically on disconnect
✅ Build completes with zero TypeScript errors
✅ Design matches VoltAgent/Claude/OpenCode design systems
✅ GSAP animations on every interactive element

## Original Agent Logo Sources

Need to find/download:
1. **OpenClaw**: Check openclaw-voice-vercel folder or GitHub
2. **Gemini**: Google's official Gemini icon (blue spark/stars)
3. **Claude**: Anthropic's official Claude icon (black/white abstract)
4. **King Hermes**: Custom crown/gold design (we create this)
5. **OpenCode**: From opencode.ai website or GitHub

Search locations:
- /workspace/openclaw-voice-vercel/
- /workspace/supreme-agent/
- Brand websites (SVG format preferred)
- awesome-ai-apps repo for references

## Notes

**DO NOT:**
- Use mock data
- Use generic colored circles for agents
- Skip TypeScript types
- Skip error handling
- Use demo/demo content
- Rush without verifying each step

**DO:**
- Test every animation
- Verify real data from /proc
- Use actual brand colors
- Add proper loading states
- Test WebSocket reconnection
- Build with zero errors

---

MASTER: If any of this is unclear, STOP and ask before proceeding.
The user is FURIOUS with the previous implementation and expects PERFECTION.
