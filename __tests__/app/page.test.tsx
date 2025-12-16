import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

describe('Home Page', () => {
  it('renders the main heading', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { name: /retro games/i, level: 1 })).toBeInTheDocument()
  })

  it('renders the tagline', () => {
    render(<Home />)
    expect(screen.getByText(/10 classic games/i)).toBeInTheDocument()
  })

  it('renders all 10 game cards', () => {
    render(<Home />)

    // Check for all game names
    const gameNames = [
      'Snake',
      'Tetris',
      'Minesweeper',
      "Conway's Life",
      'Blackjack',
      'Asteroids',
      'Space Invaders',
      'Breakout',
      'Pinball',
      'Barrack',
    ]

    gameNames.forEach((gameName) => {
      expect(screen.getByText(gameName)).toBeInTheDocument()
    })
  })

  it('renders game cards with links to game pages', () => {
    render(<Home />)

    // Check for links by href attribute
    const links = screen.getAllByRole('link')

    const expectedRoutes = [
      '/games/snake',
      '/games/tetris',
      '/games/minesweeper',
      '/games/conways-life',
      '/games/blackjack',
      '/games/asteroids',
      '/games/space-invaders',
      '/games/breakout',
      '/games/pinball',
      '/games/barrack',
    ]

    expectedRoutes.forEach((route) => {
      const link = links.find((l) => l.getAttribute('href') === route)
      expect(link).toBeTruthy()
    })
  })

  it('renders game descriptions', () => {
    render(<Home />)

    // Check for some descriptions
    expect(screen.getByText(/classic snake eating food/i)).toBeInTheDocument()
    expect(screen.getByText(/falling block puzzle/i)).toBeInTheDocument()
    expect(screen.getByText(/cellular automaton/i)).toBeInTheDocument()
  })

  it('renders controls information for each game', () => {
    render(<Home />)

    // Check for controls text
    const controlsElements = screen.getAllByText(/controls:/i)
    expect(controlsElements.length).toBe(10)
  })
})
