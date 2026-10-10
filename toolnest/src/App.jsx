
import { Link, Route, Routes } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';

import HomePage from './pages/HomePage';
import JsonFormatter from './pages/tools/JsonFormatter';

// Reusable fallback for unknown URLs.
function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center
      justify-center bg-[#fafaf9] px-5 text-center text-[#20211f]
      dark:bg-[#111210] dark:text-[#f2f2ed]">
      <div className="flex h-16 w-16 items-center justify-center
        rounded-2xl bg-emerald-500/10 text-emerald-600
        dark:text-emerald-400">
        <Search size={30} />
      </div>

      <h1 className="mt-6 text-4xl font-semibold">Page not found</h1>

      <p className="mt-3 max-w-md text-sm leading-6 text-neutral-500">
        We couldn't find that page. It may not exist yet, or the address
        may be incorrect.
      </p>

      <Link to="/" className="mt-6 inline-flex items-center gap-2
        rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium
        text-white transition hover:bg-emerald-700">
        <ArrowLeft size={16} />
        Return home
      </Link>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Main landing page */}
      <Route path="/" element={<HomePage />} />

      {/* First functional utility */}
      <Route
        path="/tools/json-formatter"
        element={<JsonFormatter />}
      />

      {/* Unknown paths */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}