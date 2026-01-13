# Joker Poker Board - Svelte 5 + SvelteKit

Poker game frontend built with **Svelte 5**, **SvelteKit**, and **Stake Engine** integration.

## 🚀 Quick Start

### Development

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Build for Production

```bash
npm run build
```

Output will be in `build/` directory - ready to upload to Stake Engine CDN.

### Type Checking

```bash
npm run check
```

## 📁 Project Structure

```
src/
├── lib/
│   ├── api/
│   │   ├── stakeRgsClient.ts       # Stake Engine RGS client
│   │   └── EventProcessor.ts       # Process RGS events
│   ├── game/
│   │   ├── gameState.svelte.ts     # Global game state (Svelte 5 runes)
│   │   └── GameController.svelte.ts # Game logic controller
│   ├── components/
│   │   ├── BoardView.svelte         # 5-card board display
│   │   ├── CardSprite.svelte        # Individual card component
│   │   ├── ControlsView.svelte      # Play button + bet controls
│   │   └── WinModal.svelte          # Win celebration modal
│   ├── types/
│   │   └── index.ts                 # TypeScript types
│   └── config.ts                    # Configuration
└── routes/
    ├── +page.svelte                 # Main game page
    └── +layout.svelte               # Root layout
```

## 🎮 Game Features

### Implemented
- ✅ 5-card poker board with flop → turn → river animations
- ✅ Joker transformation animations
- ✅ Win modal with hand categories
- ✅ Balance, bet, and win display
- ✅ Stake Engine RGS integration
- ✅ Event-driven architecture
- ✅ TypeScript types matching math output
- ✅ Responsive UI

### Architecture

**State Management**: Svelte 5 runes (`$state`, `$derived`, `$effect`)
```typescript
// Global reactive state
import { gameState } from '$lib/game/gameState.svelte';

// Usage in components
$: balance = gameState.balance;
```

**Game Flow**:
1. `GameController` - orchestrates game logic
2. `EventProcessor` - converts RGS events to animations
3. Components - reactive UI updates via `gameState`

**RGS Integration**:
```typescript
// stakeRgsClient.ts wraps official stake-engine package
import * as rgsClient from '$lib/api/stakeRgsClient';

// Authenticate
const response = await rgsClient.authenticate({ sessionID });

// Play round
const playResponse = await rgsClient.play({ sessionID, amount, mode: 'BASE' });
```

## 🔧 Configuration

### RGS Mode
Edit `src/lib/config.ts`:

```typescript
export default {
  rgsMode: 'stake' as 'mock' | 'local' | 'stake',
  enableDebug: true,
  logRgsCalls: true,
};
```

- **`stake`**: Production - uses real Stake Engine RGS
- **`mock`**: Development - uses mock data (not yet implemented)
- **`local`**: Development - uses local Python server (not yet implemented)

## 📦 Dependencies

### Production
- `svelte@^5.0.0` - Reactive framework with runes
- `@sveltejs/kit@^2.49.1` - SvelteKit framework
- `stake-engine@^0.1.32` - Official Stake Engine client
- `pixi.js@^7.4.0` - 2D WebGL renderer (for future enhancements)
- `pixi-svelte@^2.0.0` - PixiJS + Svelte integration (for future enhancements)

### Development
- `typescript@^5.9.3`
- `vite@^6.0.0`
- `@sveltejs/adapter-static@^3.0.6` - Static build adapter
- `svelte-check@^4.3.4` - Type checking

## 🎯 Next Steps

### To Do
1. **Mock RGS Client**: Implement mock mode for local development without Python server
2. **PixiJS Integration**: Replace CSS animations with PixiJS for better performance
3. **Sound Effects**: Add audio feedback
4. **Storybook**: Component testing setup
5. **Mobile Optimization**: Test and optimize for mobile devices

### Deployment to Stake Engine

1. **Build**:
   ```bash
   npm run build
   ```

2. **Upload to Stake Engine**:
   - Upload `build/` folder to Stake Engine CDN
   - Configure game in admin panel
   - Test with `?sessionID=...` parameter

## 🐛 Troubleshooting

### TypeScript Errors
```bash
npm run check
```

### Module Resolution Issues
```bash
rm -rf node_modules package-lock.json
npm install
```

### Stake Engine Connection Fails
- Check `sessionID` in URL params
- Verify `stake-engine` package is installed
- Check console for RGS errors

## 📚 Resources

- [Svelte 5 Docs](https://svelte.dev/docs/svelte/overview)
- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [Stake Engine Docs](https://stakeengine.github.io/)
- [FRONTEND_SPECIFICATION.md](../FRONTEND_SPECIFICATION.md) - Full spec from Stake Engine docs

## 🤝 Contributing

This is a production game - no external contributions at this time.

---

**Built with ❤️ using Svelte 5 + SvelteKit + Stake Engine**
