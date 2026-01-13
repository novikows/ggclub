# Changelog

## [1.0.0] - 2026-01-13

### ✨ Initial Release - Svelte 5 Migration

**Complete rewrite from PixiJS to Svelte 5 + SvelteKit**

#### Added
- ✅ **Svelte 5 Framework**: Modern reactive framework with runes (`$state`, `$derived`, `$effect`)
- ✅ **SvelteKit**: Static site generation with `adapter-static`
- ✅ **Stake Engine Integration**: Full RGS client implementation
- ✅ **Mock RGS Client**: Local development mode without backend
- ✅ **Game Components**:
  - `BoardView.svelte` - 5-card poker board with animations
  - `CardSprite.svelte` - Individual card with flip/transform animations
  - `ControlsView.svelte` - Bet controls and play button
  - `WinModal.svelte` - Win celebration modal with hand categories
- ✅ **Game State Management**: Reactive state using Svelte 5 runes
- ✅ **Event-Driven Architecture**: RGS events → animations pipeline
- ✅ **TypeScript Types**: Full type safety matching math module output

#### Architecture
- **State Management**: `gameState.svelte.ts` - Global reactive state
- **Game Controller**: `GameController.svelte.ts` - Game logic orchestration
- **Event Processor**: `EventProcessor.ts` - Converts RGS events to animation actions
- **RGS Clients**: Auto-selects mock/stake client based on config

#### Features
- 🎴 Flop → Turn → River card reveal animations
- 🃏 Joker transformation animations
- 🏆 Win modal with hand categories (High Card → Royal Flush)
- 💰 Balance, bet, and win tracking
- 🎮 Responsive controls
- 📱 Mobile-ready layout

#### Development
- **Mock Mode**: Local development without backend connection
- **Stake Mode**: Production mode with real Stake Engine RGS
- **Type Safety**: 0 TypeScript errors, full type coverage
- **Build Output**: Static files ready for CDN deployment

#### Migration Notes
This version replaces the previous PixiJS-based implementation (`client/`) with a Stake Engine compliant Svelte 5 application.

**Key Differences**:
- Framework: PixiJS → Svelte 5
- State: Class-based → Svelte runes
- Components: Canvas → DOM + CSS
- Build: Vite → SvelteKit static adapter

**Compatibility**: 
- ✅ Event types match math module output
- ✅ Stake Engine RGS protocol compliance
- ✅ Ready for admin panel upload

---

## Development Setup

```bash
npm install
npm run dev     # Start dev server (mock mode)
npm run build   # Build for production
npm run check   # TypeScript validation
```

## Configuration

Edit `src/lib/config.ts`:
```typescript
rgsMode: 'mock'   // Local development
rgsMode: 'stake'  // Production (requires sessionID)
```
