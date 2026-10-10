import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Moon, Sun, Zap, GitBranch, Star, Lightbulb } from 'lucide-react';

import RequestToolModal from './RequestToolModal';
import siteConfig from '../data/siteConfig';

export default function SiteHeader() {
  // Read the saved theme preference.
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem('toolnest-theme') === 'dark'
  );

  // Control the request modal from the shared header.
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Apply the theme and save the preference.
  function toggleTheme() {
    const nextTheme = !isDark;

    setIsDark(nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme);
    localStorage.setItem('toolnest-theme', nextTheme ? 'dark' : 'light');
  }

  return (
    <>
      <header
        className="sticky top-0 z-30 border-b border-black/5
          bg-[#fafaf9]/90 backdrop-blur-xl dark:border-white/10
          dark:bg-[#111210]/90"
      >
        <nav
          className="mx-auto flex max-w-7xl items-center
            justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-8 sm:py-4"
        >
          {/* Brand */}
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <span
              className="flex h-9 w-9 items-center justify-center
                rounded-xl bg-[#bdf5cb] text-[#183d25]"
            >
              <Zap size={21} fill="currentColor" />
            </span>

            <span
              className="text-xl font-bold tracking-tight
                text-[#20211f] dark:text-[#f2f2ed]"
            >
              tool<span className="text-emerald-600 dark:text-emerald-400">
                nest
              </span>
            </span>
          </Link>

          {/* Navigation and actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `hidden text-sm transition sm:inline ${
                  isActive
                    ? 'font-semibold text-emerald-700 dark:text-emerald-400'
                    : 'text-neutral-500 hover:text-emerald-600 dark:text-neutral-400'
                }`
              }
            >
              Home
            </NavLink>

            <a
              href="/#tools"
              className="hidden text-sm text-neutral-500
                transition hover:text-emerald-600 sm:inline
                dark:text-neutral-400"
            >
              Explore tools
            </a>

            {/* Opens the configured GitHub repository. */}
            <a
              href={siteConfig.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Star Toolnest on GitHub"
              className="inline-flex h-10 items-center justify-center
                gap-2 rounded-xl border border-black/10 px-3
                text-sm font-medium transition hover:bg-black/5
                dark:border-white/10 dark:hover:bg-white/10"
            >
              <img
  src="/images/github-logo.png"
  alt="GitHub"
  className="h-7 w-7 object-contain"
/>
              <span className="hidden sm:inline">Star on GitHub</span>
              <span className="sm:hidden">Star</span>
            </a>

            {/* Opens the modal without navigating away. */}
            <button
              type="button"
              onClick={() => setIsRequestModalOpen(true)}
              className="inline-flex h-10 items-center justify-center
                gap-2 rounded-xl bg-emerald-600 px-3
                text-sm font-semibold text-white transition
                hover:bg-emerald-700 sm:px-4"
            >
              <Lightbulb size={17} />
              <span className="hidden sm:inline">Request a Tool</span>
              <span className="sm:hidden">Request</span>
            </button>

            {/* Existing light/dark theme control. */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="flex h-10 w-10 shrink-0 items-center
                justify-center rounded-xl border border-black/10
                transition hover:bg-black/5 dark:border-white/10
                dark:hover:bg-white/10"
            >
              {isDark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
          </div>
        </nav>
      </header>

      {/* The modal is shared across all pages using this header. */}
      <RequestToolModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
      />
    </>
  );
}