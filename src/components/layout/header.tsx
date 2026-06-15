import Link from "next/link";
import { ThemeToggle } from "../theme-toggle";
import { AuthControls } from "../auth-controls";
import { NavLinks } from "../nav-links";
import { CreditCard } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <CreditCard className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">SubTracker</span>
          </Link>
          <div className="flex items-center gap-4">
            <NavLinks />
            <AuthControls />
            <ThemeToggle />
          </div>
        </div>
      </header>
  )
}