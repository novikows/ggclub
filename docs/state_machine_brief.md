# State Machine Implementation Brief

**Project:** Joker Poker Board MVP  
**Topic:** Game State Machine Flow & Transitions  
**Status:** AWAITING CLARIFICATION  
**Date:** 2026-01-11

---

## 1. Overview

This brief outlines the game's State Machine architecture and identifies critical design decisions that need clarification before implementation.

**Current FSM States:**
```
INIT → IDLE ⇄ SPINNING → JOKER_TRANSFORM → DISPLAYING_WIN → IDLE
  ↓                                ↓
ERROR ←─────────────────────────────
```

---

## 2. State Definitions (Summary)

| State | Purpose | Entry Condition | Exit Condition |
|-------|---------|----------------|----------------|
| **INIT** | Load game, authenticate | App loads | Auth success → IDLE |
| **IDLE** | Ready for player input | Round complete | Player clicks PLAY → SPINNING |
| **SPINNING** | Playing round, animating cards | PLAY clicked | Cards revealed → JOKER_TRANSFORM or DISPLAYING_WIN |
| **JOKER_TRANSFORM** | Animate joker transformation | Joker(s) on board | Animation done → DISPLAYING_WIN |
| **DISPLAYING_WIN** | Show result, update balance | Hand evaluated | User clicks / timeout → IDLE |
| **ERROR** | Handle errors | Any error occurs | User retries → INIT |

---

## 3. Open Questions & Decisions Needed

### 3.1 Reconnection & Round Recovery

**Question 1: What happens if player disconnects during SPINNING state?**

- Scenario: Player clicks PLAY, bet is debited, cards start animating, then connection drops
- Does Stake Engine provide a "pending round" API?
- On reconnect (page reload), should we:
  - A) Restore and replay the full round animation?
  - B) Skip animations and show final result immediately?
  - C) Let user click PLAY again (duplicate bet issue)?

**Question 2: Does `/wallet/authenticate` return pending round state?**

- If yes, what does the response look like?
- Should we check for incomplete rounds on INIT?

**Action needed:**
- [ ] Review Stake Engine docs on reconnection flow
- [ ] Test: disconnect during `/play` → reload page → check response
- [ ] Define reconnection UX (show "Resuming round..." message?)

---

### 3.2 Rapid Clicking & Race Conditions

**Question 3: Can player spam-click PLAY button?**

- What if player clicks PLAY 3 times rapidly before state changes?
- Possible solutions:
  - A) Debounce PLAY button (e.g., 500ms cooldown)
  - B) Disable button immediately on click (until state = IDLE again)
  - C) Check state before `/play` call (only allow if state === IDLE)

**Question 4: Can player change bet during SPINNING?**

- Should +/- buttons be disabled during active round?
- Or allow queuing bet change for next round?

**Action needed:**
- [ ] Define button enable/disable rules per state
- [ ] Implement state check before `/play` API call
- [ ] Add visual feedback (grayed out buttons, loading spinner)

---

### 3.3 Modal Interactions During Active Round

**Question 5: Can player open Info/Paytable during SPINNING or DISPLAYING_WIN?**

- Should Info/Paytable buttons work during animations?
- If modal opens, should animations pause or continue in background?
- What about Sound toggle during active round?

**Recommendation:**
- Allow Info/Paytable/Sound at any time (non-blocking)
- Animations continue in background
- Modals are overlays, don't interrupt state flow

**Action needed:**
- [ ] Confirm: modals are non-blocking
- [ ] Implement modal overlay (doesn't pause game state)

---

### 3.4 Balance Update Timing

**Question 6: When does balance update in UI?**

Current understanding:
- `/wallet/play` response → balance after bet deducted
- `/wallet/end-round` response → balance after win credited

Clarifications needed:
- Should we update UI balance **immediately** after each API response?
- Or batch updates (only after full round completes)?
- What if `/end-round` fails? Retry? Show error?

**Action needed:**
- [ ] Define balance update flow diagram
- [ ] Handle `/end-round` failure scenario (retry logic)

---

### 3.5 Error Recovery Strategy

**Question 7: Which errors are recoverable vs fatal?**

| Error Type | Code | Recoverable? | Action |
|------------|------|--------------|--------|
| Invalid session | ERR_IS | ❓ | Retry auth? Force reload? |
| Insufficient balance | ERR_IPB | ❓ | Show error, stay IDLE? |
| Network timeout | ERR_NETWORK | ❓ | Auto-retry? Manual retry? |
| RGS server error | 5xx | ❓ | Retry? Contact support? |

**Question 8: Should we auto-retry on network timeout?**

- Retry count limit? (e.g., 3 attempts)
- Exponential backoff? (e.g., 1s, 2s, 4s delays)
- Show "Retrying..." indicator to player?

**Action needed:**
- [ ] Categorize all possible errors (from Stake Engine docs)
- [ ] Define retry strategy per error type
- [ ] Design error modal UX (retry button, support link)

---

### 3.6 Round In Progress on Page Load

**Question 9: What if player refreshes page during active round?**

- Scenario: Player is in DISPLAYING_WIN state, refreshes browser
- Expected behavior:
  - A) Round is lost (bet refunded)?
  - B) Round state restored (replay animation)?
  - C) Round result shown immediately (skip animation)?

**Question 10: Can multiple rounds be "in progress" simultaneously?**

- Or is there only ever 1 active round per session?
- Does Stake Engine prevent concurrent `/play` calls?

**Action needed:**
- [ ] Test: start round → refresh page → check auth response
- [ ] Define UX: "Round in progress" banner? Auto-resume?
- [ ] Review Stake Engine round lifecycle docs

---

## 4. Additional State Machine Considerations

### 4.1 Loading States

Should we add intermediate loading states?

```
IDLE → [LOADING_PLAY] → SPINNING
DISPLAYING_WIN → [LOADING_END_ROUND] → IDLE
```

**Benefits:**
- Show spinner during API calls
- Prevent UI flicker if network is slow

**Action needed:**
- [ ] Decide: add loading states or use flags (e.g., `isLoading: boolean`)?

---

### 4.2 Animation Cancellation

**Question 11: Can player skip animations?**

- Common in casino games: "Tap anywhere to skip"
- Should we allow skipping flop/turn/river animations?
- What about joker transformation? Win modal?

**Recommendation (for MVP):**
- No animation skipping (keep simple)
- Fixed 300ms timing for all animations
- Future: add "Quick Spin" button

**Action needed:**
- [ ] Confirm: no animation skip in MVP

---

### 4.3 State Persistence

**Question 12: Should we save game state to localStorage?**

- Use case: Player closes tab mid-round, returns later
- What to persist:
  - Current state?
  - Last bet amount?
  - Sound on/off preference?

**Recommendation:**
- Persist: last bet amount, sound preference
- Don't persist: game state (rely on Stake Engine round recovery)

**Action needed:**
- [ ] Define localStorage schema
- [ ] Implement state hydration on INIT

---

## 5. Recommended Next Steps

### Priority 1: Critical for Development Start
1. **Research Stake Engine reconnection docs** (Question 1, 2, 9, 10)
2. **Define button enable/disable rules** (Question 3, 4)
3. **Clarify error handling strategy** (Question 7, 8)

### Priority 2: Can Iterate During Development
4. Confirm modal interaction behavior (Question 5)
5. Define balance update timing (Question 6)
6. Decide on loading states (4.1)

### Priority 3: Nice-to-Have for MVP
7. Animation skip feature (Question 11) → **Defer to post-MVP**
8. State persistence (Question 12) → **Implement basic: bet + sound only**

---

## 6. Action Items

**For Product/Game Design:**
- [ ] Review reconnection UX scenarios
- [ ] Approve error modal designs
- [ ] Decide: animation skip yes/no

**For Backend/Integration:**
- [ ] Provide Stake Engine reconnection flow documentation
- [ ] List all possible RGS error codes
- [ ] Confirm: round recovery API exists?

**For Frontend Developer:**
- [ ] Read Stake Engine docs: https://stakeengine.github.io/math-sdk/rgs_docs/RGS/
- [ ] Implement state machine FSM (use xstate or custom)
- [ ] Create state transition tests

---

## 7. References

- Global Specification: `docs/global_specification.md` Section 13
- Stake Engine RGS Docs: https://stakeengine.github.io/math-sdk/rgs_docs/RGS/
- Stake Engine Events: https://stakeengine.github.io/math-sdk/math_docs/gamestate_section/events_info/

---

**Status:** Awaiting answers to questions 1-12 before finalizing state machine implementation.


