# Retro Games App Specification

## Overview
A retro games web application featuring 10 classic games, each playable both on the home page (in card format) and on dedicated full-page views.

## Tech Stack
- **Framework**: Next.js 16
- **Styling**: Tailwind CSS 4
- **UI Components**: Shadcn/UI (Cards, Buttons, Navigation, Theme Toggle)
- **Language**: TypeScript

## Games to Implement
1. **Pinball** - Classic pinball game with flippers and bumpers
2. **Conway's Game of Life** - Cellular automaton simulation
3. **Minesweeper** - Grid-based mine detection puzzle
4. **Asteroids** - Space shooter with rotating ship and asteroids
5. **Snake** - Classic snake eating food and growing
6. **Tetris** - Falling block puzzle game
7. **Space Invaders** - Classic alien shooting arcade game
8. **Breakout** - Brick-breaking paddle game
9. **Blackjack** - Card game (21)
10. **Barrack** - Ambrosia Software style artillery/strategy game

## Features

### Home Page
- Grid of all 10 games displayed in Card components
- Each card contains a playable mini version of the game
- Responsive layout:
  - Desktop (wide): 3 cards per row
  - Tablet: 2 cards per row
  - Mobile: 1 card per row
- Cards should have consistent sizing and hover effects

### Individual Game Pages
- Full-screen playable version of each game
- Route structure: `/games/[game-name]`
- Game controls and instructions displayed
- Score tracking where applicable

### Layout (All Pages)
- Persistent navigation menu bar
- Links to all 10 games
- Light/Dark theme toggle using Shadcn/UI
- Responsive navigation (hamburger menu on mobile)
- Footer with game credits/info

### Design Requirements
- Retro aesthetic (pixel fonts, neon colors, arcade styling)
- Smooth animations and transitions
- Consistent color scheme across light/dark themes
- Accessible design with proper contrast ratios
- Game cards with glowing borders/effects

### Technical Requirements
- Canvas-based rendering for arcade games (Asteroids, Space Invaders, Breakout, Pinball)
- Grid-based rendering for puzzle games (Minesweeper, Conway's Life, Snake, Tetris)
- Card game logic for Blackjack
- Keyboard and touch controls
- Pause/Resume functionality
- Sound effects (optional, with mute toggle)

## Responsive Breakpoints
- Mobile: < 640px (1 column)
- Tablet: 640px - 1024px (2 columns)
- Desktop: > 1024px (3 columns)

## File Structure
```
/app
  /layout.tsx          # Root layout with nav and theme
  /page.tsx            # Home page with game cards grid
  /games
    /pinball/page.tsx
    /conways-life/page.tsx
    /minesweeper/page.tsx
    /asteroids/page.tsx
    /snake/page.tsx
    /tetris/page.tsx
    /space-invaders/page.tsx
    /breakout/page.tsx
    /blackjack/page.tsx
    /barrack/page.tsx
/components
  /ui                  # Shadcn components
  /games               # Game components
  /layout              # Navigation, Footer
/lib
  /games               # Game logic/engines
/hooks                 # Custom React hooks
```
