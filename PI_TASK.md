# PI TASK: COMPLETE REBUILD OF KING HERMES DASHBOARD

## Assignment
Rebuild the King Hermes Agent Dashboard from scratch with PERFECTION.

## Location
```
/workspace/king-hermes-supreme-dashboard/
├── dashboard/          # Next.js frontend (rebuild this completely)
├── server/             # WebSocket server (verify/fix)
├── agents/             # Brain files
└── REBUILD_BRAIN.md    # READ THIS FIRST
```

## What Has Been Prepared For You
1. ✅ GSAP cloned at /workspace/GSAP/
2. ✅ 54 DESIGN.md files at /workspace/awesome-design-md/design-md/
3. ✅ awesome-ai-apps cloned for inspiration
4. ✅ Agent icon SVGs created at /workspace/king-hermes-supreme-dashboard/dashboard/public/agents/
5. ✅ REBUILD_BRAIN.md with full specifications

## Critical Requirements

### 1. Design System (MUST USE)
Read and implement from:
- `/workspace/awesome-design-md/design-md/voltagent/DESIGN.md` - Primary dark theme
- `/workspace/awesome-design-md/design-md/opencode.ai/DESIGN.md` - For agent terminal styling
- `/workspace/awesome-design-md/design-md/claude/DESIGN.md` - For typography elegance

Key colors to use:
- Background: #050507 (Abyss Black)
- Cards: #101010 (Carbon Surface)
- Borders: #3d3a39 (Warm Charcoal)
- Primary accent: #00d992 (Emerald Signal Green)
- King Hermes: #FFD700 (Gold)

### 2. Agent Icons (ALREADY CREATED)
Use the SVGs at `/workspace/king-hermes-supreme-dashboard/dashboard/public/agents/`:
- king-hermes.svg (Gold crown with KH)
- gemini.svg (Google's spark star)
- claude.svg (Anthropic hourglass)
- opencode.svg (Terminal with code brackets)
- roo.svg (Purple circle with R)
- openclaw.svg (Orange claw marks)

Display these as `<Image src="/agents/[name].svg" width={64} height={64} />` NOT as colored circles.

### 3. Animations (GSAP + Framer Motion)
Install and use:
```bash
npm install gsap @gsap/react framer-motion
```

Required animations:
- Page load: Header slides down, tabs fade in staggered, content scales up
- Tab switching: Cross-fade with slide (0.3s ease-out)
- Agent cards: Hover lift (translateY -4px) + green glow (box-shadow)
- Status indicators: Pulse animation when busy
- Charts: Line draw animation on mount
- 3D scene: Continuous slow rotation of particle galaxy
- WebSocket connect/disconnect: Smooth status dot color transition

### 4. 3D Background (Three.js)
Rebuild Scene3D.tsx with:
- 3000+ gold particles using Three.js Points
- 5 orbiting agent spheres with original colors (not generic)
- King Hermes center sphere with rotating gold ring
- Stars background from @react-three/drei
- Proper TypeScript types (NO `any`)

### 5. Real Data (NO MOCKS)
Server must read from:
- /proc/stat (CPU)
- /proc/meminfo (Memory)
- df -h / (Disk)
- ps aux | grep [agent] (Agent status)

### 6. Zero Errors
- TypeScript strict mode compliance
- No console errors
- Proper error boundaries
- WebSocket auto-reconnect with exponential backoff

## Files to Rebuild

### Dashboard Frontend
1. `dashboard/app/page.tsx` - Main page with all tabs
2. `dashboard/app/components/Scene3D.tsx` - 3D background
3. `dashboard/app/components/TabAgents.tsx` - Agent cards with SVG icons
4. `dashboard/app/components/TabSystem.tsx` - Charts with animations
5. `dashboard/app/components/TabTasks.tsx` - Task list
6. `dashboard/app/components/TabChat.tsx` - Chat interface
7. `dashboard/app/components/TabLogs.tsx` - Activity logs
8. `dashboard/app/components/TabSettings.tsx` - Configuration
9. `dashboard/app/components/FloatingBot.tsx` - Chat bot
10. `dashboard/app/components/AgentIcon.tsx` - Icon component
11. `dashboard/app/hooks/useWebSocket.ts` - WebSocket with reconnect
12. `dashboard/app/hooks/useAnimations.ts` - GSAP animations
13. `dashboard/app/lib/design-system.ts` - Design tokens
14. `dashboard/tailwind.config.ts` - Extended with design system colors
15. `dashboard/next.config.js` - Standalone output

### Server
Verify/fix:
- `server/websocket-server.js` - Real data reading, agent spawning

## Build Steps

### Step 1: Clean & Setup
```bash
cd /workspace/king-hermes-supreme-dashboard/dashboard
rm -rf .next node_modules package-lock.json
npm install next@latest react@latest react-dom@latest
npm install gsap @gsap/react framer-motion
npm install three @react-three/fiber @react-three/drei @types/three
npm install recharts lucide-react tailwindcss @tailwindcss/postcss
npm install ws @types/ws express @types/express
```

### Step 2: Design System Setup
Create `dashboard/app/lib/design-system.ts`:
- Export all color tokens from VoltAgent
- Export typography scales
- Export animation timings

### Step 3: Tailwind Config
Update `tailwind.config.ts` with:
- Custom colors from design system
- Custom animations
- Custom shadows (Warm Ambient Haze, etc.)

### Step 4: Build Components
Rebuild each component with:
- Proper TypeScript interfaces
- GSAP animations where needed
- Original agent icons
- Real data integration
- Error handling

### Step 5: 3D Scene
Build Scene3D.tsx:
- Use @react-three/fiber Canvas
- 3000 particle galaxy
- 5 orbiting spheres (agent colors)
- King Hermes center sphere
- Auto-rotation

### Step 6: WebSocket Hook
Build useWebSocket.ts:
- Auto-connect on mount
- Exponential backoff reconnect
- Type-safe message handling
- Status indicators

### Step 7: Server Verification
Check server/websocket-server.js:
- Reads real /proc data
- Detects agent processes
- Spawns agents with correct env vars
- Broadcasts to all clients

### Step 8: Build & Test
```bash
npm run build
# Fix any TypeScript errors
# Verify no console errors
```

## Success Checklist

- [ ] Dashboard loads with smooth GSAP entrance animation
- [ ] 3D background renders with 3000+ particles (60fps)
- [ ] All 6 tabs switch with cross-fade animation
- [ ] Agent cards show ORIGINAL SVG icons (not colored circles)
- [ ] Agent status is REAL from ps aux (not mock data)
- [ ] CPU/Memory metrics are REAL from /proc
- [ ] Hover on agent cards shows lift + glow animation
- [ ] Can click agent card to expand details
- [ ] Can type task and spawn agent
- [ ] Charts animate on mount (line draw effect)
- [ ] WebSocket reconnects automatically if disconnected
- [ ] Floating bot slides up with animation
- [ ] Zero TypeScript errors (npm run build succeeds)
- [ ] Zero console errors in browser

## Design Review Points

### Colors
- Page background: #050507 (pure Abyss Black)
- Card backgrounds: #101010 (Carbon Surface)
- All borders: 1px solid #3d3a39 (Warm Charcoal)
- Active/hover states: 2px solid #00d992 (Emerald Green)
- Text: #f2f2f2 (Snow White)

### Typography
- Headings: system-ui, tight line-height (1.0-1.11), negative letter-spacing
- Body: Inter, 16px, weight 400
- Code: SFMono-Regular or Berkeley Mono

### Spacing
- Base unit: 8px
- Card padding: 24-32px
- Section gaps: 64-96px
- Component gaps: 16-24px

### Borders
- Standard: 1px solid #3d3a39
- Active: 2px solid #00d992
- Emphasized: 3px solid #3d3a39
- Radius: 8px (comfortable), 6px (buttons)

## Agent Configuration

### Colors Per Agent
```typescript
const AGENT_STYLES = {
  'king-hermes': { color: '#FFD700', bg: 'bg-yellow-500/10', border: 'border-yellow-500' },
  'opencode': { color: '#fdfcfc', bg: 'bg-[#201d1d]', border: 'border-[#fdfcfc]/30' },
  'gemini': { color: '#4285F4', bg: 'bg-blue-500/10', border: 'border-blue-500' },
  'claude': { color: '#c96442', bg: 'bg-orange-500/10', border: 'border-orange-500' },
  'roo': { color: '#9B59B6', bg: 'bg-purple-500/10', border: 'border-purple-500' },
  'openclaw': { color: '#FF6B35', bg: 'bg-orange-400/10', border: 'border-orange-400' }
}
```

### Spawn Commands
See REBUILD_BRAIN.md for full command details.

## Critical Notes

**DO NOT:**
- Use mock/demo data
- Use generic colored circles for agents
- Skip TypeScript types
- Rush without testing
- Skip animations
- Use ANY types

**DO:**
- Use the actual SVG icons provided
- Test each animation
- Verify real data from /proc
- Add proper loading states
- Test WebSocket reconnection
- Build with zero errors

## Contact

If ANYTHING is unclear:
1. STOP immediately
2. Read REBUILD_BRAIN.md again
3. Check the design files in /workspace/awesome-design-md/
4. Ask for clarification

**The user expects PERFECTION. Previous build was rejected.**
**Take your time. Do it right. Test everything.**

---

**START TIME:** [Fill in when you begin]
**ESTIMATED TIME:** 4-6 hours for complete rebuild
**PRIORITY:** CRITICAL - User is waiting
