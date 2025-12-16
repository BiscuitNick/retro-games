import { render, screen } from '@testing-library/react'
import { Navbar } from '@/components/layout/navbar'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
}))

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'dark',
    setTheme: jest.fn(),
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

describe('Navbar', () => {
  it('renders the logo/brand name', () => {
    render(<Navbar />)
    expect(screen.getByText('Retro Games')).toBeInTheDocument()
  })

  it('renders the Games dropdown trigger', () => {
    render(<Navbar />)
    expect(screen.getByRole('button', { name: /games/i })).toBeInTheDocument()
  })

  it('renders theme toggle switch', () => {
    render(<Navbar />)
    expect(screen.getByRole('switch', { name: /toggle theme/i })).toBeInTheDocument()
  })

  it('renders mobile menu button', () => {
    render(<Navbar />)
    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument()
  })

  it('logo links to home page', () => {
    render(<Navbar />)
    const logoLink = screen.getByRole('link', { name: /retro games/i })
    expect(logoLink).toHaveAttribute('href', '/')
  })
})
