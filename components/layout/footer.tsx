import { Gamepad2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--background)]">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Gamepad2 className="h-6 w-6 text-[var(--color-neon-cyan)]" />
              <span className="text-lg font-bold text-[var(--color-neon-cyan)]">
                Retro Games
              </span>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              10 classic games, one nostalgic experience
            </p>
          </div>

          {/* Keyboard Shortcuts */}
          <div>
            <h3 className="font-semibold mb-3 text-[var(--foreground)]">
              Common Controls
            </h3>
            <ul className="text-sm text-[var(--muted-foreground)] space-y-1">
              <li>
                <kbd className="px-2 py-1 bg-[var(--muted)] rounded text-xs">
                  Space
                </kbd>{" "}
                - Pause/Action
              </li>
              <li>
                <kbd className="px-2 py-1 bg-[var(--muted)] rounded text-xs">
                  Arrow Keys
                </kbd>{" "}
                - Movement
              </li>
              <li>
                <kbd className="px-2 py-1 bg-[var(--muted)] rounded text-xs">
                  R
                </kbd>{" "}
                - Restart Game
              </li>
              <li>
                <kbd className="px-2 py-1 bg-[var(--muted)] rounded text-xs">
                  Esc
                </kbd>{" "}
                - Pause Menu
              </li>
            </ul>
          </div>

          {/* Credits */}
          <div>
            <h3 className="font-semibold mb-3 text-[var(--foreground)]">
              Credits
            </h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              Built with Next.js, Tailwind CSS, and shadcn/ui.
            </p>
            <p className="text-sm text-[var(--muted-foreground)] mt-2">
              Classic games reimagined for the modern web.
            </p>
          </div>
        </div>

        <div className="border-t border-[var(--border)] mt-8 pt-4 text-center text-sm text-[var(--muted-foreground)]">
          <p>&copy; {new Date().getFullYear()} Retro Games. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
