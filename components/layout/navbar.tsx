"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon, Gamepad2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { games } from "@/lib/games-config";
import { MobileNav } from "./mobile-nav";

export function Navbar() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Gamepad2 className="h-8 w-8 text-[var(--color-neon-cyan)] group-hover:text-[var(--color-neon-pink)] transition-colors" />
          <span className="text-xl font-bold text-[var(--color-neon-cyan)] group-hover:text-glow transition-all">
            Retro Games
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1">
                Games
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-[var(--card)] border-[var(--border)]">
              {games.map((game) => (
                <DropdownMenuItem key={game.id} asChild>
                  <Link
                    href={game.route}
                    className="w-full cursor-pointer hover:text-[var(--color-neon-cyan)]"
                  >
                    {game.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-[var(--muted-foreground)]" />
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              aria-label="Toggle theme"
            />
            <Moon className="h-4 w-4 text-[var(--muted-foreground)]" />
          </div>
        </nav>

        {/* Mobile Navigation */}
        <MobileNav />
      </div>
    </header>
  );
}
