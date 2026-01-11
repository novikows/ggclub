# Testing Guide - Joker Poker Board MVP

## 🧪 Quick Test Checklist

### ✅ Basic Functionality

1. **Game Initialization**
   - [ ] Page loads without errors
   - [ ] Background image displays
   - [ ] Balance shows $4,530.00
   - [ ] Bet shows $0.10 (first bet level)
   - [ ] PLAY button is enabled

2. **Bet Controls**
   - [ ] Click **+** button → bet increases to $0.50
   - [ ] Click **+** multiple times → cycles through bet levels
   - [ ] Click **-** button → bet decreases
   - [ ] Cannot decrease below $0.10
   - [ ] Cannot increase above $1,000
   - [ ] Bet controls disabled during spin

3. **Play Round**
   - [ ] Click **PLAY** button
   - [ ] Balance decreases by bet amount
   - [ ] PLAY button disabled during round
   - [ ] Cards appear in sequence (flop → turn → river)
   - [ ] Each card flips from back to face
   - [ ] Animations smooth and timed correctly

4. **Win Display**
   - [ ] Winning cards highlighted with glow
   - [ ] Win modal appears with correct info
   - [ ] Modal shows hand name (e.g., "Pair")
   - [ ] Modal shows multiplier (e.g., "x0.4")
   - [ ] Modal shows win amount in dollars
   - [ ] Click anywhere to close modal
   - [ ] Balance updates after win credited

5. **Joker Scenarios**
   - [ ] Joker card displays correctly
   - [ ] After river, joker pulses/glows
   - [ ] Joker flips to back then to target card
   - [ ] Transformation smooth and visible
   - [ ] Win calculated correctly with joker

### 🎯 Test Scenarios

Run multiple rounds to see different scenarios:

#### Normal Wins
- Play ~10 rounds to see various pairs and two pairs
- Check that multipliers match paytable (x0.1 - x0.8)
- Verify modal shows NORMAL tier (blue color)

#### Medium Wins
- Continue playing to get Three of a Kind (low cards)
- Verify x1.5 multiplier
- Check MEDIUM tier modal (purple color)

#### High Wins
- Play until Three of a Kind (Aces) or Straight
- Verify x3 or x5 multiplier
- Check HIGH tier modal (orange color)

#### Jackpot Wins
- Keep playing for Flush, Full House, Four of a Kind
- Verify x10+ multipliers
- Check JACKPOT tier modal (gold color)
- Watch for pulse animation on jackpot modal

#### Royal Flush
- Extremely rare - may take 100+ spins
- Multiplier should be x1000
- Massive win amount
- Gold modal with pulse effect

### 🃏 Joker Testing

Play until you see joker scenarios (weighted to appear ~20% of time):

1. **Single Joker**
   - [ ] Joker appears during initial reveal
   - [ ] After river, joker pulses
   - [ ] Joker transforms to target card
   - [ ] Win calculated correctly

2. **Double Joker**
   - [ ] Both jokers visible
   - [ ] Both pulse simultaneously
   - [ ] Transform one at a time
   - [ ] Final hand correct (likely Four of a Kind)

### 📱 Responsive Testing

1. **Desktop**
   - [ ] Full screen layout works
   - [ ] Cards properly scaled
   - [ ] Controls positioned correctly
   - [ ] Modal centered

2. **Tablet** (resize browser to ~768px)
   - [ ] Layout adapts smoothly
   - [ ] All elements visible
   - [ ] Touch targets adequate size

3. **Mobile** (resize browser to ~375px)
   - [ ] Portrait orientation works
   - [ ] Cards fit on screen
   - [ ] Controls accessible
   - [ ] Modal readable

### 🔍 Browser Console Testing

Open browser DevTools (F12) and check console:

#### Expected Logs

```
🎰 JOKER POKER BOARD - MVP
[GameApp] Created
[GameApp] Starting...
[BoardView] Initializing...
[BoardView] Initialized with 5 cards
[GameController] Initializing...
[MockRGS] Authenticate: {sessionID: "default-session"}
[GameController] Authenticated successfully
[GameStateManager] INIT → IDLE
```

#### During Round

```
[GameApp] Play clicked
[GameController] Starting round...
[GameStateManager] IDLE → SPINNING
[MockRGS] Play: {sessionID: "...", amount: 1000000, mode: "BASE"}
[MockRGS] Generated scenario: "Pair of Aces" x0.4 Win: 400000
[BoardView] Revealing flop (0, 1, 2)
[BoardView] Revealing turn (3)
[BoardView] Revealing river (4)
[BoardView] Highlighting positions: [0, 1]
[GameController] Win amount: 400000
[MockRGS] Credited win: 400000
[GameStateManager] DISPLAYING_WIN → IDLE
```

### ⚠️ Error Testing

1. **Insufficient Balance**
   - Play until balance < bet
   - PLAY button should disable
   - Try to play → should not work

2. **Rapid Clicking**
   - Click PLAY multiple times quickly
   - Only one round should start
   - Button disabled during round

### 🎨 Visual Quality Testing

1. **Card Quality**
   - [ ] Cards crisp and clear
   - [ ] No pixelation or blur
   - [ ] Colors accurate
   - [ ] Joker card distinctive

2. **Animations**
   - [ ] Smooth 60fps
   - [ ] No stuttering
   - [ ] Proper timing (300ms standard)
   - [ ] Flip effect convincing

3. **Win Modal**
   - [ ] Colors distinct per tier
   - [ ] Text readable
   - [ ] Layout balanced
   - [ ] Animation smooth

### 📊 Performance Testing

Open DevTools → Performance tab:

1. Record during 5 rounds
2. Check for:
   - [ ] Consistent 60fps
   - [ ] No memory leaks
   - [ ] Fast API responses (<500ms mock)
   - [ ] Quick animation execution

### 🐛 Known Issues

None currently - this is MVP v1.0!

### 🔧 Troubleshooting

#### Cards Not Loading
- Check `/public/assets/cards/` folder
- Verify all 54 card images present
- Check browser console for 404 errors

#### Animations Stuttering
- Close other browser tabs
- Check CPU usage
- Try different browser

#### Balance Not Updating
- Check console for RGS errors
- Verify mock client working
- Refresh page

#### Modal Not Showing
- Check if win amount > 0
- Verify hand result event fired
- Check console logs

## 📝 Test Report Template

```markdown
## Test Session Report

**Date:** 2026-01-11
**Browser:** Chrome 120 / Safari 17 / Firefox 121
**Device:** Desktop / Tablet / Mobile
**Rounds Played:** X

### Results
- ✅ All basic functionality working
- ✅ Bet controls working
- ✅ Animations smooth
- ✅ Win modal displays correctly
- ✅ Joker transformation working
- ⚠️ [Any issues found]

### Scenarios Seen
- [X] Pair
- [X] Two Pair
- [X] Three of a Kind
- [ ] Straight
- [ ] Flush
- [ ] Full House
- [ ] Four of a Kind
- [ ] Straight Flush
- [ ] Royal Flush
- [X] Joker scenarios

### Notes
[Any additional observations]
```

## 🎯 Success Criteria

MVP is successful if:
- ✅ Game loads and initializes
- ✅ All 15 scenarios work correctly
- ✅ Animations smooth and bug-free
- ✅ Win calculations accurate
- ✅ Balance management correct
- ✅ Joker transformations work
- ✅ Responsive on mobile/tablet/desktop
- ✅ No console errors

## 🚀 Ready to Test?

```bash
cd client
npm run dev
```

Then open http://localhost:3000 and start testing! 🎰

Good luck getting that Royal Flush! 👑
