"use client";

import { useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Menu, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { games } from "@/lib/games-config";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="ghost" size="icon" aria-label="Open menu">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[300px] bg-[var(--background)] border-[var(--border)]"
      >
        <SheetHeader>
          <SheetTitle className="text-[var(--color-neon-cyan)]">
            Games
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-2 mt-6">
          {games.map((game) => (
            <Link
              key={game.id}
              href={game.route}
              onClick={() => setOpen(false)}
              className="block px-4 py-3 rounded-lg hover:bg-[var(--muted)] hover:text-[var(--color-neon-cyan)] transition-colors"
            >
              {game.name}
            </Link>
          ))}
        </nav>

        {/* Theme Toggle */}
        <div className="flex items-center gap-3 mt-8 px-4 py-3 border-t border-[var(--border)]">
          <Sun className="h-4 w-4 text-[var(--muted-foreground)]" />
          <Switch
            checked={theme === "dark"}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            aria-label="Toggle theme"
          />
          <Moon className="h-4 w-4 text-[var(--muted-foreground)]" />
          <span className="text-sm text-[var(--muted-foreground)]">
            {theme === "dark" ? "Dark" : "Light"} Mode
          </span>
        </div>
      </SheetContent>
    </Sheet>
  );
}
