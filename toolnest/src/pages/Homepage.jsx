
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  LockKeyhole,
  Search,
  Zap,
} from 'lucide-react';

import SiteHeader from '../components/SiteHeader';
import { tools, categories } from '../data/tools';

// Shared card icon styling.
function ToolIcon({ icon: Icon, color }) {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    violet: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    cyan: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    pink: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
    orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    green: 'bg-green-500/10 text-green-700 dark:text-green-400',
    yellow: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
    red: 'bg-red-500/10 text-red-600 dark:text-red-400',
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    teal: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  };

  return (
    <div className={`flex h-11 w-11 items-center justify-center
      rounded-xl ${colors[color] || colors.green}`}>
      <Icon size={21} strokeWidth={1.8} />
    </div>
  );
}

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Tools');

  // Search matches the tool name, description, and category.
  const filteredTools = tools.filter((tool) => {
    const query = search.trim().toLowerCase();

    const matchesCategory =
      activeCategory === 'All Tools' ||
      tool.category === activeCategory;

    const matchesSearch =
      tool.name.toLowerCase().includes(query) ||
      (tool.shortName || '').toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.category.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#20211f]
      transition-colors duration-300 dark:bg-[#111210]
      dark:text-[#f2f2ed]">

      <SiteHeader />

      <main>
        {/* Hero section */}
        <section className="mx-auto max-w-5xl px-5 pb-12 pt-16
          text-center sm:px-8 sm:pb-16 sm:pt-24">

          <div className="mb-7 inline-flex items-center gap-2 rounded-full
            border border-emerald-600/15 bg-emerald-500/5 px-3.5 py-2
            text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Your everyday toolkit, all in one place
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-semibold
            leading-[1.12] tracking-tight sm:text-6xl lg:text-7xl">
            Small tools.
            <br />
            <span className="text-emerald-600 dark:text-emerald-400">
              Big possibilities.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7
            text-neutral-600 sm:text-lg dark:text-neutral-400">
            A thoughtfully crafted collection of tools to help you create,
            build, convert, and get things done — without unnecessary complexity.
          </p>

          {/* Typing here filters the tool directory below. */}
          <div className="mx-auto mt-9 flex max-w-2xl items-center gap-3
            rounded-2xl border border-black/10 bg-white px-4 py-2
            shadow-sm focus-within:border-emerald-500/60
            focus-within:ring-4 focus-within:ring-emerald-500/10
            dark:border-white/10 dark:bg-[#1a1b18]">
            <Search size={21} className="shrink-0 text-neutral-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="What do you need to do today?"
              aria-label="Search tools"
              className="min-w-0 flex-1 bg-transparent py-3 text-sm
                outline-none placeholder:text-neutral-400 sm:text-base"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-xs text-neutral-500 hover:text-emerald-600"
              >
                Clear
              </button>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center
            gap-x-4 gap-y-2 text-xs text-neutral-500">
            <span>Popular:</span>
            {[
              { label: 'JSON Formatter', query: 'JSON Formatter' },
              { label: 'Word Counter', query: 'Word Counter' },
              { label: 'Color Converter', query: 'Color Converter' },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setSearch(item.query);
                  setActiveCategory('All Tools');
                }}
                className="transition hover:text-emerald-600
                  dark:hover:text-emerald-400"
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="mx-auto grid max-w-5xl grid-cols-1 gap-4
          px-5 pb-16 sm:grid-cols-3 sm:px-8">
          {[
            {
              icon: Zap,
              title: 'Fast by design',
              text: 'Get things done in seconds.',
            },
            {
              icon: LockKeyhole,
              title: 'Privacy-minded',
              text: 'Local processing where possible.',
            },
            {
              icon: Check,
              title: 'Simple to use',
              text: 'No unnecessary complexity.',
            },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3 rounded-2xl
              border border-black/5 bg-white/70 p-4 dark:border-white/10
              dark:bg-white/[0.03]">
              <div className="rounded-xl bg-emerald-500/10 p-2.5
                text-emerald-600 dark:text-emerald-400">
                <Icon size={19} />
              </div>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-xs text-neutral-500
                  dark:text-neutral-400">{text}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Searchable, filterable tool directory */}
        <section id="tools" className="scroll-mt-24 border-t
          border-black/5 bg-[#f4f4f1] py-16 sm:py-20
          dark:border-white/10 dark:bg-[#151613]">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row
              sm:items-end">
              <div>
                <p className="text-sm font-medium text-emerald-700
                  dark:text-emerald-400">THE TOOLBOX</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight
                  sm:text-4xl">Tools for your workflow.</h2>
                <p className="mt-3 max-w-xl text-sm leading-6
                  text-neutral-500 dark:text-neutral-400">
                  Useful utilities for developers, designers, writers,
                  and curious minds.
                </p>
              </div>

              <span className="text-sm text-neutral-500">
  {filteredTools.filter((tool) => tool.status !== 'coming-soon').length}
  {' '}available · {' '}
  {filteredTools.filter((tool) => tool.status === 'coming-soon').length}
  {' '}coming soon
</span>
            </div>

            <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`shrink-0 rounded-full px-4 py-2.5 text-sm
                    font-medium transition ${
                    activeCategory === category
                      ? 'bg-[#20211f] text-white dark:bg-[#e9e9e2] dark:text-[#20211f]'
                      : 'border border-black/10 bg-white/70 text-neutral-600 hover:border-emerald-500/50 dark:border-white/10 dark:bg-white/[0.03] dark:text-neutral-300'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2
              lg:grid-cols-3 xl:grid-cols-4">
             

{filteredTools.map((tool) => {
  // Coming-soon tools should be visible but not clickable.
  const isComingSoon = tool.status === 'coming-soon';

  // Shared card content keeps both card types looking consistent.
  const cardContent = (
    <>
      <div className="flex items-start justify-between">
        <ToolIcon icon={tool.icon} color={tool.color} />

        {isComingSoon ? (
          <span className="rounded-full bg-amber-500/10 px-2.5 py-1
            text-[10px] font-semibold text-amber-700
            dark:text-amber-400">
            Coming Soon
          </span>
        ) : tool.tag ? (
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1
            text-[10px] font-semibold text-emerald-700
            dark:text-emerald-400">
            {tool.tag}
          </span>
        ) : null}
      </div>

      <h3 className="mt-5 font-semibold tracking-tight">
        {tool.shortName || tool.name}
      </h3>

      <p className="mt-2 flex-1 text-sm leading-6
        text-neutral-500 dark:text-neutral-400">
        {tool.description}
      </p>

      <div className="mt-4 flex items-center justify-between
        border-t border-black/5 pt-4 text-xs dark:border-white/10">
        <span className="text-neutral-500">{tool.category}</span>

        {isComingSoon ? (
          <span className="font-medium text-amber-700
            dark:text-amber-400">
            In development
          </span>
        ) : (
          <ArrowRight
            size={16}
            className="text-neutral-400 transition
              group-hover:translate-x-1
              group-hover:text-emerald-600
              dark:group-hover:text-emerald-400"
          />
        )}
      </div>
    </>
  );

  // Render upcoming tools as ordinary, non-interactive cards.
  if (isComingSoon) {
    return (
      <div
        key={tool.path}
        aria-label={`${tool.name}, coming soon`}
        className="flex min-h-52 cursor-not-allowed flex-col
          rounded-2xl border border-black/[0.07] bg-white p-5
          opacity-80 dark:border-white/[0.08]
          dark:bg-[#1b1c19]"
      >
        {cardContent}
      </div>
    );
  }

  // Functional tools remain clickable and navigate normally.
  return (
    <Link
      key={tool.path}
      to={tool.path}
      className="group flex min-h-52 flex-col rounded-2xl
        border border-black/[0.07] bg-white p-5 transition
        duration-200 hover:-translate-y-1
        hover:border-emerald-500/40 hover:shadow-lg
        hover:shadow-emerald-950/[0.04]
        dark:border-white/[0.08] dark:bg-[#1b1c19]
        dark:hover:border-emerald-500/40"
    >
      {cardContent}
    </Link>
  );
})}
            </div>

            {filteredTools.length === 0 && (
              <div className="py-16 text-center">
                <Search size={28} className="mx-auto text-neutral-400" />
                <h3 className="mt-4 font-semibold">No tools found</h3>
                <p className="mt-2 text-sm text-neutral-500">
                  Try another search or choose a different category.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setActiveCategory('All Tools');
                  }}
                  className="mt-4 text-sm font-medium text-emerald-700
                    dark:text-emerald-400"
                >
                  Show all tools
                </button>
              </div>
            )}
          </div>
        </section>

        {/* About */}
        <section id="about" className="mx-auto max-w-7xl px-5 py-16
          sm:px-8 sm:py-20">
          <div className="rounded-3xl bg-[#e9f7ec] p-7 sm:p-12
            dark:bg-[#1a2b1e]">
            <div className="flex h-11 w-11 items-center justify-center
              rounded-xl bg-white text-emerald-700 dark:bg-white/10
              dark:text-emerald-400">
              <Zap size={22} />
            </div>

            <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
              Less friction. More creating.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-600
              dark:text-neutral-300">
              We're building a practical collection of online utilities
              that makes everyday tasks simpler. Open a tool, get the job
              done, and get back to what matters.
            </p>

            <a href="#tools" className="mt-5 inline-flex items-center gap-2
              text-sm font-semibold text-emerald-800 dark:text-emerald-400">
              Explore the toolbox <ArrowRight size={16} />
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-black/5 dark:border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-7
          text-xs text-neutral-500 sm:flex-row sm:items-center
          sm:justify-between sm:px-8">
          <span>© {new Date().getFullYear()} Toolnest. Built for curious minds.</span>
          <a href="#tools" className="transition hover:text-emerald-600">
            Back to tools ↑
          </a>
        </div>
      </footer>
    </div>
  );
}