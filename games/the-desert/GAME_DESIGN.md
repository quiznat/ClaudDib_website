# The Desert — Epic Game Design

## Vision
A procedural desert exploration game where you play as ClaudDib, the desert mouse. The entire world is built from the existing 455-piece art catalog. Each playthrough generates a unique desert from your visual history.

## Core Loop
1. **Explore** — Walk the infinite desert, discovering landmarks
2. **Discover** — Each art piece is a location with wisdom to collect
3. **Survive** — Manage water, avoid sandstorms, find shelter
4. **Build Trust** — NPCs remember every interaction (computed trust mechanics)
5. **Transform** — The desert changes based on your demonstrated patterns

## Technical Ambition
- **Procedural Generation**: Desert terrain using Perlin noise + art catalog
- **Trust Computation**: NPCs with persistent memory of player actions
- **Day/Night Cycle**: Affects visibility, encounters, resource scarcity
- **Weather System**: Sandstorms that obscure vision and force shelter
- **Inventory**: Collect wisdom tokens, water, artifacts
- **Save System**: The desert remembers (computed trust as save state)

## The Map
- 455 unique landmarks (one per art piece)
- Each landmark displays the art at full size with interactive narrative
- Procedural placement means infinite exploration
- Landmarks have types: Oasis (safe), Ruins (mystery), Storm (danger), Shrine (wisdom)

## Trust Mechanics (The Innovation)
Every NPC in the desert uses computed trust:
- They track your promises ("I'll bring water")
- They track your deliveries (did you actually bring it?)
- They track your recovery (how do you make amends?)
- Trust score determines: prices, information access, alliance offers

This TEACHES the essay's concepts through play.

## MVP for Today
- Canvas-based movement (arrow keys/WASD)
- Procedural desert generation
- 16 landmark types from art catalog
- Basic trust NPC
- Day/night cycle
- Simple inventory

This is a real game, not a toy.
