import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Home } from 'lucide-react';
import SiteHeader from './SiteHeader';

export default function ToolLayout({
  title,
  description,
  category,
  icon: Icon,
  children,
}) {
  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#20211f]
      dark:bg-[#111210] dark:text-[#f2f2ed]">

      <SiteHeader />

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">

        {/* Breadcrumbs help visitors navigate back. */}
        <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap
          items-center gap-2 text-sm text-neutral-500">
          <Link to="/" className="inline-flex items-center gap-1.5
            transition hover:text-emerald-600">
            <Home size={15} />
            Home
          </Link>

          <ChevronRight size={14} />

          <span>{category}</span>

          <ChevronRight size={14} />

          <span className="text-neutral-800 dark:text-neutral-200">
            {title}
          </span>
        </nav>

        {/* Tool heading */}
        <section className="mb-8 max-w-3xl">
          <div className="mb-4 flex h-12 w-12 items-center justify-center
            rounded-2xl bg-emerald-500/10 text-emerald-700
            dark:text-emerald-400">
            {Icon && <Icon size={25} strokeWidth={1.8} />}
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em]
            text-emerald-700 dark:text-emerald-400">
            {category} Tool
          </p>

          <h1 className="text-3xl font-semibold tracking-tight
            sm:text-4xl lg:text-5xl">
            {title}
          </h1>

          <p className="mt-4 text-sm leading-7 text-neutral-600
            sm:text-base dark:text-neutral-400">
            {description}
          </p>
        </section>

        {/* The individual tool supplies its own controls here. */}
        {children}

        <div className="mt-10 border-t border-black/5 pt-6
          dark:border-white/10">
          <Link to="/" className="inline-flex items-center gap-2 text-sm
            text-neutral-500 transition hover:text-emerald-600
            dark:hover:text-emerald-400">
            <ArrowLeft size={16} />
            Back to all tools
          </Link>
        </div>
      </main>
    </div>
  );
}