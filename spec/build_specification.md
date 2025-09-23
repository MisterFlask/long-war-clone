# The Forge-Tyrant Rising: Build & Development Specification v1.0

## Development Philosophy

### Minimal Setup Goals
- **Single Command Start**: `npm install && npm run dev` should get you running
- **Zero Configuration**: Sensible defaults for everything
- **Fast Iteration**: Hot reloading for all file types
- **Immediate Feedback**: ESLint and TypeScript errors in real-time
- **Simple Deployment**: Static site generation for easy hosting

## Technology Stack

### Core Framework
```json
{
  "framework": "React 18+ with TypeScript",
  "bundler": "Vite (fast, minimal config)",
  "styling": "CSS Modules + PostCSS",
  "testing": "Vitest (Vite-native testing)",
  "linting": "ESLint + Prettier"
}
```

### Key Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.4.0",
    "vitest": "^0.34.0",
    "eslint": "^8.45.0",
    "prettier": "^3.0.0"
  }
}
```

## Project Structure

### Directory Layout
```
src/
├── components/          # React components
│   ├── common/         # Shared UI components
│   ├── strategy/       # Strategy layer components
│   ├── combat/         # Combat layer components
│   └── accessibility/  # Accessibility helpers
├── hooks/              # Custom React hooks
├── services/           # Game logic services
│   ├── gameState/     # Strategy layer logic
│   ├── combat/        # Combat system logic
│   └── accessibility/ # Screen reader support
├── types/              # TypeScript type definitions
├── assets/             # Static assets
│   ├── images/        # Game images
│   ├── audio/         # Sound effects and music
│   └── fonts/         # Typography assets
├── styles/             # Global styles
└── test/               # Test utilities and factories

public/                 # Static files served directly
├── index.html         # Main HTML template
├── favicon.ico        # Game icon
└── manifest.json      # PWA manifest
```

## Build Configuration

### Vite Configuration (`vite.config.ts`)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],

  // Path aliases for clean imports
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@services': resolve(__dirname, 'src/services'),
      '@types': resolve(__dirname, 'src/types'),
      '@assets': resolve(__dirname, 'src/assets')
    }
  },

  // Development server
  server: {
    port: 3000,
    open: true, // Auto-open browser
    host: true  // Allow network access
  },

  // Build optimization
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',

    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          game: ['src/services'],
          ui: ['src/components']
        }
      }
    }
  },

  // Testing configuration
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    globals: true
  },

  // CSS configuration
  css: {
    modules: {
      localsConvention: 'camelCase'
    },
    postcss: {
      plugins: [
        require('autoprefixer'),
        require('postcss-nested')
      ]
    }
  }
})
```

### TypeScript Configuration (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@services/*": ["src/services/*"],
      "@types/*": ["src/types/*"],
      "@assets/*": ["src/assets/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## Package Scripts

### Essential NPM Scripts (`package.json`)
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "npm run lint -- --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\"",
    "type-check": "tsc --noEmit",
    "validate": "npm run type-check && npm run lint && npm run test run",
    "clean": "rm -rf dist node_modules/.vite"
  }
}
```

## Development Workflow

### Getting Started (5-Minute Setup)
```bash
# 1. Clone and install
git clone <repository-url>
cd long-war-clone
npm install

# 2. Start development server
npm run dev

# 3. Open browser to http://localhost:3000
# Game should be running with hot reload enabled
```

### Daily Development Commands
```bash
# Start development with all features
npm run dev              # Hot reload server on :3000

# Code quality checks
npm run lint            # Check code style
npm run type-check      # TypeScript validation
npm run test            # Run test suite
npm run validate        # All checks together

# Code formatting
npm run format          # Auto-format all files
npm run lint:fix        # Auto-fix lint issues
```

### Build and Preview
```bash
# Production build
npm run build           # Creates optimized ./dist folder

# Preview production build locally
npm run preview         # Serves ./dist on :4173

# Clean build artifacts
npm run clean           # Remove dist and cache files
```

## Asset Management

### Static Assets
```typescript
// Asset organization
src/assets/
├── images/
│   ├── portraits/      # Investigator portraits
│   ├── cards/          # Card artwork
│   ├── enemies/        # Enemy sprites
│   ├── icons/          # UI icons and status effects
│   └── backgrounds/    # Scene backgrounds
├── audio/
│   ├── sfx/           # Sound effects
│   ├── music/         # Background music
│   └── ui/            # UI sounds
└── fonts/
    ├── cinzel/        # Header font
    └── source-sans/   # Body font

// Usage in components
import portraitDefault from '@assets/images/portraits/default.png'
import cardBack from '@assets/images/cards/card_back.png'

// CSS asset references
.investigator-portrait {
  background-image: url('@assets/images/portraits/default.png');
}
```

### Asset Loading Strategy
```typescript
// Lazy loading for large assets
const loadPortrait = (investigatorId: string) =>
  import(`@assets/images/portraits/${investigatorId}.png`)

// Preload critical assets
const preloadAssets = [
  '@assets/images/ui/background.jpg',
  '@assets/images/icons/status_icons.png',
  '@assets/audio/ui/button_click.mp3'
]
```

## Environment Configuration

### Environment Variables (`.env.local`)
```bash
# Development settings
VITE_DEBUG_MODE=true
VITE_SKIP_INTRO=true
VITE_AUTO_SAVE_INTERVAL=30000

# Asset paths
VITE_ASSET_BASE_URL=/assets/

# Testing flags
VITE_MOCK_SAVE_SYSTEM=false
VITE_ENABLE_PERFORMANCE_MONITORING=true
```

### Environment-Specific Builds
```typescript
// vite.config.ts environment handling
export default defineConfig(({ mode }) => ({
  define: {
    __DEV__: mode === 'development',
    __PROD__: mode === 'production',
    __VERSION__: JSON.stringify(process.env.npm_package_version)
  },

  // Development-only features
  ...(mode === 'development' && {
    plugins: [
      react(),
      // Add development tools
    ]
  })
}))
```

## Code Quality Configuration

### ESLint Configuration (`.eslintrc.cjs`)
```javascript
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended' // Accessibility linting
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', 'jsx-a11y'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true }
    ],
    // Accessibility rules
    'jsx-a11y/no-autofocus': 'error',
    'jsx-a11y/aria-props': 'error',
    // Game-specific rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error'
  }
}
```

### Prettier Configuration (`.prettierrc`)
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

## Testing Setup

### Test Configuration (`src/test/setup.ts`)
```typescript
import '@testing-library/jest-dom'
import { beforeAll, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Global test setup
beforeAll(() => {
  // Mock browser APIs
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => {},
    }),
  })

  // Mock audio context for game sounds
  global.AudioContext = class MockAudioContext {
    createOscillator = () => ({ connect: () => {}, start: () => {}, stop: () => {} })
    createGain = () => ({ connect: () => {}, gain: { value: 1 } })
    destination = {}
  } as any
})

// Cleanup after each test
afterEach(() => {
  cleanup()
})
```

### Test Commands
```bash
# Run tests in different modes
npm run test            # Watch mode with hot reload
npm run test:ui         # Visual test interface
npm run test:coverage   # Generate coverage report
npm test -- --run       # Single run (CI mode)
npm test -- GameState   # Run specific test file
```

## Deployment Options

### Static Site Hosting
```bash
# Build for production
npm run build

# Deploy to any static host:
# - Upload ./dist folder to web server
# - Point domain to ./dist/index.html
# - Configure server for SPA routing
```

### Simple Server Configuration
```nginx
# nginx.conf for SPA routing
server {
  listen 80;
  root /path/to/dist;
  index index.html;

  # Handle client-side routing
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Cache static assets
  location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

### Development vs Production
```typescript
// Automatic environment detection
const isDevelopment = import.meta.env.DEV
const isProduction = import.meta.env.PROD

// Development features
if (isDevelopment) {
  // Enable debug tools
  import('./dev-tools').then(({ enableDevTools }) => enableDevTools())
}

// Production optimizations
if (isProduction) {
  // Disable console logs
  console.log = () => {}
  console.warn = () => {}
}
```

## Performance Optimization

### Bundle Analysis
```bash
# Analyze bundle size
npm run build -- --analyze

# Check for duplicate dependencies
npx depcheck

# Audit for vulnerabilities
npm audit
```

### Build Optimizations
```typescript
// vite.config.ts optimizations
export default defineConfig({
  build: {
    // Tree shaking
    rollupOptions: {
      treeshake: true,
      external: ['react', 'react-dom'] // For library builds
    },

    // Asset optimization
    assetsInlineLimit: 4096, // Inline small assets
    cssCodeSplit: true,      // Split CSS by routes

    // Compression
    minify: 'esbuild', // Faster than terser
    target: 'es2020'   // Modern browsers only
  }
})
```

## Troubleshooting

### Common Issues and Solutions

#### Build Failures
```bash
# Clear cache and reinstall
npm run clean
rm -rf node_modules package-lock.json
npm install

# Check Node.js version (requires 16+)
node --version

# Update dependencies
npm update
```

#### Development Server Issues
```bash
# Port already in use
npm run dev -- --port 3001

# Network access issues
npm run dev -- --host 0.0.0.0

# Clear Vite cache
rm -rf node_modules/.vite
```

#### TypeScript Errors
```bash
# Regenerate types
npm run type-check

# Clear TypeScript cache
npx tsc --build --clean
```

### Performance Monitoring
```typescript
// Development performance tracking
if (import.meta.env.DEV) {
  // Monitor render performance
  import('react-dom/profiling').then(({ Profiler }) => {
    // Wrap app in Profiler component
  })

  // Bundle size monitoring
  import('webpack-bundle-analyzer').then(({ analyzeBundle }) => {
    // Show bundle composition
  })
}
```

This build specification provides a minimal, modern development setup that gets the game running locally with a single command while maintaining professional development practices and easy deployment options.