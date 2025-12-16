import { render, screen, fireEvent } from '@testing-library/react'
import { GameCard } from '@/components/games/game-card'
import { GameConfig } from '@/lib/games-config'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

const mockGame: GameConfig = {
  id: 'test-game',
  name: 'Test Game',
  route: '/games/test-game',
  description: 'A test game description',
  controls: 'Test controls',
}

describe('GameCard', () => {
  it('renders game name', () => {
    render(
      <GameCard game={mockGame}>
        <div>Game content</div>
      </GameCard>
    )
    expect(screen.getByText('Test Game')).toBeInTheDocument()
  })

  it('renders game description', () => {
    render(
      <GameCard game={mockGame}>
        <div>Game content</div>
      </GameCard>
    )
    expect(screen.getByText('A test game description')).toBeInTheDocument()
  })

  it('renders controls info when paused', () => {
    render(
      <GameCard game={mockGame}>
        <div>Game content</div>
      </GameCard>
    )
    expect(screen.getByText('Test controls')).toBeInTheDocument()
  })

  it('has link to full game page', () => {
    render(
      <GameCard game={mockGame}>
        <div>Game content</div>
      </GameCard>
    )
    const link = screen.getByRole('link', { name: /test game/i })
    expect(link).toHaveAttribute('href', '/games/test-game')
  })

  it('renders play/pause button', () => {
    render(
      <GameCard game={mockGame}>
        <div>Game content</div>
      </GameCard>
    )
    expect(screen.getByRole('button', { name: /play|pause/i })).toBeInTheDocument()
  })

  it('renders fullscreen button', () => {
    render(
      <GameCard game={mockGame}>
        <div>Game content</div>
      </GameCard>
    )
    expect(screen.getByRole('link', { name: /full screen/i })).toBeInTheDocument()
  })

  it('shows placeholder when paused', () => {
    render(
      <GameCard game={mockGame}>
        <div data-testid="game-content">Game content</div>
      </GameCard>
    )
    expect(screen.getByText('Click play to start')).toBeInTheDocument()
  })

  it('toggles pause state when play button clicked', () => {
    render(
      <GameCard game={mockGame}>
        <div data-testid="game-content">Game content</div>
      </GameCard>
    )

    // Initially paused
    expect(screen.getByText('Click play to start')).toBeInTheDocument()

    // Click play
    const playButton = screen.getByRole('button', { name: /play/i })
    fireEvent.click(playButton)

    // Should show game content now (placeholder removed)
    expect(screen.queryByText('Click play to start')).not.toBeInTheDocument()
  })
})
