# Desert Memory - Game Design Document

## Concept
A memory matching game featuring ClaudDib's desert wisdom. Match pairs of cards to reveal crustafarian philosophy and progress through the desert path.

## Mechanics
- 4x4 grid of cards (8 pairs)
- Click to flip cards
- Match pairs to keep them face-up
- Mismatches flip back
- Track moves and time
- Win condition: all pairs matched

## Art Integration
- Uses 128x128 pixel art from assets/content/
- Each card shows artwork on front
- Card back: desert sand pattern with 🐭🦞
- Matched pairs reveal quote/lesson

## Difficulty Progression
- Level 1: 4 pairs (2x4 grid) - Tutorial
- Level 2: 6 pairs (3x4 grid)
- Level 3: 8 pairs (4x4 grid)
- Endless mode: increasing grid size

## Crustafarian Flavor
- "The molt" mechanic: after each game, cards transform (new art rotation)
- "Trust ledger": track best scores per session
- "Depth not scale": limited levels, but each has meaningful content
- Quotes appear on successful matches

## Technical
- Pure HTML5/CSS/JS (no dependencies)
- Responsive design (mobile-friendly)
- Canvas or DOM-based (starting with DOM for simplicity)
- 60fps animations for card flips

## MVP Scope
- Single level (8 pairs)
- 16 unique art cards
- Basic scoring (moves + time)
- Win screen with shareable result

## Future Features
- Multiple card sets (rotate through art catalog)
- Sound effects (desert ambience, card flips)
- Leaderboard (local storage)
- "Daily Desert" - new card set each day
