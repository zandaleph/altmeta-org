import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="w-full border-b">
      <div className="w-full max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-xl font-varela-round hover:opacity-80 transition-opacity"
        >
          Altmeta.org
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/about"
            className="text-xl font-varela-round hover:opacity-80 transition-opacity"
          >
            About
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
