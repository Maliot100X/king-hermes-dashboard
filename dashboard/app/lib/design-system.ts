// KING HERMES DESIGN SYSTEM
// Based on VoltAgent + Claude + OpenCode design systems

// === COLORS (from VoltAgent) ===
export const colors = {
  // Primary
  abyssBlack: '#050507',
  carbonSurface: '#101010',
  warmCharcoal: '#3d3a39',
  emeraldSignal: '#00d992',
  voltagentMint: '#2fd6a1',
  
  // Text
  snowWhite: '#f2f2f2',
  pureWhite: '#ffffff',
  warmParchment: '#b8b3b0',
  steelSlate: '#8b949e',
  
  // Agent Colors (Original Brands)
  kingHermes: '#FFD700',
  gemini: '#4285F4',
  claude: '#c96442',
  opencode: '#fdfcfc',
  opencodeBg: '#201d1d',
  roo: '#9B59B6',
  openclaw: '#FF6B35',
  
  // Semantic
  success: '#30d158',
  warning: '#ff9f0a',
  danger: '#ff3b30',
  info: '#007aff',
};

// === SHADOWS ===
export const shadows = {
  warmAmbient: '0 0 15px rgba(92, 88, 85, 0.2)',
  dramaticFloat: '0 20px 60px rgba(0, 0, 0, 0.7)',
  emeraldGlow: '0 0 20px rgba(0, 217, 146, 0.4)',
  goldGlow: '0 0 30px rgba(255, 215, 0, 0.5)',
  innerRing: 'inset 0 0 0 1px rgba(148, 163, 184, 0.1)',
};

// === TYPOGRAPHY ===
export const typography = {
  // Font families
  heading: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
  body: 'Inter, system-ui, sans-serif',
  mono: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  
  // Sizes
  sizes: {
    display: '60px',
    h1: '36px',
    h2: '24px',
    h3: '20px',
    body: '16px',
    small: '14px',
    micro: '12px',
  },
  
  // Weights
  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Line heights
  lineHeights: {
    tight: 1.0,
    snug: 1.11,
    normal: 1.50,
    relaxed: 1.60,
  },
};

// === SPACING ===
export const spacing = {
  unit: 8,
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
};

// === BORDERS ===
export const borders = {
  radius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    full: '9999px',
  },
  width: {
    thin: '1px',
    medium: '2px',
    thick: '3px',
  },
};

// === ANIMATIONS (GSAP) ===
export const animations = {
  // Durations
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  slower: 0.8,
  
  // Easings
  easeOut: 'power2.out',
  easeInOut: 'power2.inOut',
  easeBack: 'back.out(1.7)',
  easeElastic: 'elastic.out(1, 0.3)',
  
  // Stagger
  stagger: 0.1,
};

// === AGENT CONFIG ===
export const agents = [
  {
    id: 'king-hermes',
    name: 'King Hermes',
    displayName: 'King Hermes',
    color: colors.kingHermes,
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500',
    icon: '/agents/king-hermes.svg',
    description: 'Supreme Agent Orchestrator',
  },
  {
    id: 'opencode',
    name: 'OpenCode',
    displayName: 'OpenCode',
    color: colors.opencode,
    bgColor: 'bg-[#201d1d]',
    borderColor: 'border-[#fdfcfc]/30',
    icon: '/agents/opencode.svg',
    description: 'AI Coding Agent',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    displayName: 'Gemini',
    color: colors.gemini,
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500',
    icon: '/agents/gemini.svg',
    description: 'Google AI',
  },
  {
    id: 'claude',
    name: 'Claude',
    displayName: 'Claude',
    color: colors.claude,
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500',
    icon: '/agents/claude.svg',
    description: 'Anthropic AI',
  },
  {
    id: 'roo',
    name: 'Roo',
    displayName: 'Roo',
    color: colors.roo,
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500',
    icon: '/agents/roo.svg',
    description: 'Roo Code',
  },
  {
    id: 'openclaw',
    name: 'OpenClaw',
    displayName: 'OpenClaw',
    color: colors.openclaw,
    bgColor: 'bg-orange-400/10',
    borderColor: 'border-orange-400',
    icon: '/agents/openclaw.svg',
    description: 'Claw Agent',
  },
];

// === UTILITY CLASSES ===
export const utils = {
  card: `
    bg-[#101010] 
    border border-[#3d3a39] 
    rounded-lg 
    transition-all 
    duration-300
    hover:border-[#00d992]
    hover:shadow-[0_0_20px_rgba(0,217,146,0.2)]
  `,
  
  button: `
    px-4 
    py-2 
    bg-transparent 
    border 
    border-[#3d3a39] 
    rounded-md
    text-[#f2f2f2]
    font-medium
    transition-all
    duration-200
    hover:bg-[#00d992]/10
    hover:border-[#00d992]
    hover:text-[#00d992]
  `,
  
  glow: `
    animate-pulse
    shadow-[0_0_20px_rgba(0,217,146,0.4)]
  `,
  
  textGradient: `
    bg-gradient-to-r 
    from-[#FFD700] 
    to-[#FFA500] 
    bg-clip-text 
    text-transparent
  `,
};
