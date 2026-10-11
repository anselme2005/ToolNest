
import { useMemo, useState } from 'react';
import {
  Check,
  Clipboard,
  Code2,
  FileText,
  RotateCcw,
  Search,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

import ToolLayout from '../../components/ToolLayout';

// Common regular expressions users can load with one click.
// These are practical format checks, not complete validators for every standard.
const commonPatterns = [
  {
    name: 'Email',
    description: 'Basic email address format.',
    pattern: String.raw`[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}`,
    example: 'Contact hello@example.com for help.',
    flags: 'gi',
  },
  {
    name: 'Phone (CM)',
    description: 'Cameroon phone number format.',
    pattern: String.raw`(?:\+237|237)?[\s.-]?(?:6\d{8}|2\d{8})`,
    example: 'Call +237 677123456 or 222123456.',
    flags: 'g',
  },
  {
    name: 'URL',
    description: 'HTTP and HTTPS web addresses.',
    pattern: String.raw`https?:\/\/[^\s/$.?#].[^\s]*`,
    example: 'Visit https://example.com for more info.',
    flags: 'gi',
  },
  {
    name: 'Hex color',
    description: 'Three- or six-digit CSS hex colors.',
    pattern: String.raw`#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b`,
    example: 'Brand colors: #fff, #2563eb and #121212.',
    flags: 'g',
  },
  {
    name: 'Digits',
    description: 'Find one or more consecutive digits.',
    pattern: String.raw`\d+`,
    example: 'Order 123 contains 4 items and costs 2500.',
    flags: 'g',
  },
  {
    name: 'IPv4 address',
    description: 'Match IPv4-shaped addresses.',
    pattern: String.raw`\b(?:\d{1,3}\.){3}\d{1,3}\b`,
    example: 'Server addresses: 192.168.1.1 and 10.0.0.5.',
    flags: 'g',
  },
  {
    name: 'Date (YYYY-MM-DD)',
    description: 'Match dates in year-month-day format.',
    pattern: String.raw`\b\d{4}-\d{2}-\d{2}\b`,
    example: 'Project dates: 2026-10-11 and 2026-12-01.',
    flags: 'g',
  },
  {
    name: 'Username',
    description: '3–16 characters, starting with a letter.',
    pattern: String.raw`^[A-Za-z][A-Za-z0-9_]{2,15}$`,
    example: 'toolnest_dev',
    flags: '',
  },
];

// Keep the flag display order consistent.
const flagOrder = ['g', 'i', 'm', 's', 'u'];

function normalizeFlags(flags) {
  return flagOrder.filter((flag) => flags.includes(flag)).join('');
}

// Split text into matching and non-matching sections for highlighting.
function createHighlightSegments(text, matches) {
  const segments = [];
  let cursor = 0;

  matches.forEach((match, index) => {
    // Zero-length matches do not highlight any visible characters.
    if (match.value.length === 0) return;

    if (match.index > cursor) {
      segments.push({
        value: text.slice(cursor, match.index),
        matched: false,
      });
    }

    // Ignore any overlapping range defensively.
    if (match.index < cursor) return;

    segments.push({
      value: match.value,
      matched: true,
      key: index,
    });

    cursor = match.index + match.value.length;
  });

  if (cursor < text.length) {
    segments.push({
      value: text.slice(cursor),
      matched: false,
    });
  }

  return segments;
}

export default function RegexTester() {
  const [pattern, setPattern] = useState('');
  const [testString, setTestString] = useState('');
  const [flags, setFlags] = useState('g');
  const [replaceMode, setReplaceMode] = useState(false);
  const [replacement, setReplacement] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  // Compile the pattern and perform live matching whenever
  // the pattern, flags, or test string changes.
  const analysis = useMemo(() => {
    if (!pattern) {
      return { matches: [], error: '' };
    }

    try {
      const regex = new RegExp(pattern, flags);
      const matches = [];
      let match;

      // exec() exposes match positions and capture groups.
      // Limit the number of results to keep the UI responsive.
      while ((match = regex.exec(testString)) !== null) {
        matches.push({
          value: match[0],
          index: match.index,
          groups: match.slice(1),
          namedGroups: match.groups ?? {},
        });

        if (matches.length >= 1000) break;

        // A global regex can match an empty string repeatedly.
        // Advance the cursor to prevent an infinite loop.
        if (match[0] === '') {
          if (!regex.global) break;

          regex.lastIndex += 1;

          if (regex.lastIndex > testString.length) break;
        }

        // Without the global flag, only the first match is returned.
        if (!regex.global) break;
      }

      return { matches, error: '' };
    } catch (err) {
      return {
        matches: [],
        error: err instanceof Error
          ? err.message
          : 'Invalid regular expression.',
      };
    }
  }, [pattern, flags, testString]);

  // Build the highlighted text from the current matches.
  const segments = useMemo(
    () => createHighlightSegments(testString, analysis.matches),
    [testString, analysis.matches]
  );

  // Preview replacements using JavaScript's native replace behavior.
  const replacementPreview = useMemo(() => {
    if (!pattern || analysis.error) return '';

    try {
      return testString.replace(new RegExp(pattern, flags), replacement);
    } catch {
      return '';
    }
  }, [pattern, flags, testString, replacement, analysis.error]);

  // Load a common pattern into the editor.
  function loadPattern(item) {
    setPattern(item.pattern);
    setFlags(item.flags);
    setTestString(item.example);
    setError('');
    setCopied(false);
  }

  // Toggle a supported regex flag.
  function toggleFlag(flag) {
    setFlags((current) =>
      normalizeFlags(
        current.includes(flag)
          ? current.replace(flag, '')
          : current + flag
      )
    );
  }

  // Copy matching text or the replacement preview.
  async function copyText(value) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setError('');

      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Clipboard access failed. Please copy the text manually.');
    }
  }

  // Reset the tester to its initial state.
  function handleClear() {
    setPattern('');
    setTestString('');
    setFlags('g');
    setReplacement('');
    setReplaceMode(false);
    setCopied(false);
    setError('');
  }

  return (
    <ToolLayout
      title="Regex Tester"
      description="Write regular expressions, test them against text in real time, explore common patterns, and preview replacements."
      category="Developer"
      icon={Search}
    >
      <div className="space-y-6">
        {/* 1. Regex pattern and flags */}
        <section className="space-y-4 rounded-2xl border
          border-gray-200 bg-white p-5 dark:border-white/10
          dark:bg-[#1e1e1e] sm:p-6"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-100 p-2.5
              dark:bg-violet-500/10"
            >
              <Code2 size={20} className="text-violet-600
                dark:text-violet-400"
              />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900
                dark:text-white"
              >
                Regex Pattern
              </h2>

              <p className="text-sm text-gray-500">
                Enter a JavaScript regular expression.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="regex-pattern" className="text-sm
              font-medium text-gray-700 dark:text-gray-300"
            >
              Pattern
            </label>

            <div className="flex min-w-0 items-center overflow-hidden
              rounded-xl border border-gray-200 bg-gray-50
              focus-within:border-violet-500
              focus-within:ring-2 focus-within:ring-violet-500/20
              dark:border-white/10 dark:bg-black/20"
            >
              <span className="select-none pl-3 font-mono
                text-gray-400"
              >
                /
              </span>

              <input
                id="regex-pattern"
                type="text"
                value={pattern}
                onChange={(event) => {
                  setPattern(event.target.value);
                  setCopied(false);
                  setError('');
                }}
                placeholder="Enter your regex pattern..."
                spellCheck={false}
                autoComplete="off"
                className="min-w-0 flex-1 bg-transparent px-2
                  py-3 font-mono text-sm text-gray-900 outline-none
                  placeholder:text-gray-400 dark:text-gray-100"
              />

              <span className="select-none pr-3 font-mono
                text-violet-600 dark:text-violet-400"
              >
                /{flags}
              </span>
            </div>
          </div>

          {/* Regex flags appear directly below the pattern field. */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700
              dark:text-gray-300"
            >
              Flags
            </p>

            <div className="flex flex-wrap gap-2">
              {[
                { value: 'g', label: 'Global', description: 'Find all matches' },
                { value: 'i', label: 'Ignore case', description: 'Ignore letter case' },
                { value: 'm', label: 'Multiline', description: 'Change ^ and $ behavior' },
                { value: 's', label: 'Dot all', description: 'Let . match newlines' },
                { value: 'u', label: 'Unicode', description: 'Enable Unicode mode' },
              ].map((flag) => {
                const active = flags.includes(flag.value);

                return (
                  <button
                    key={flag.value}
                    type="button"
                    onClick={() => toggleFlag(flag.value)}
                    title={flag.description}
                    aria-pressed={active}
                    className={`rounded-lg border px-3 py-2
                      text-sm transition-colors ${
                        active
                          ? 'border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:bg-transparent dark:text-gray-400 dark:hover:bg-white/5'
                      }`}
                  >
                    <span className="font-mono font-semibold">
                      {flag.value}
                    </span>
                    <span className="ml-1.5">{flag.label}</span>
                  </button>
                );
              })}
            </div>

            <p className="text-xs leading-5 text-gray-500">
              Click a flag to turn it on or off. JavaScript regex syntax
              is used, so unsupported flags and syntax show an error.
            </p>
          </div>

          {analysis.error && (
            <div role="alert" className="rounded-xl border
              border-red-200 bg-red-50 px-4 py-3 text-sm
              text-red-700 dark:border-red-500/20
              dark:bg-red-500/10 dark:text-red-300"
            >
              <strong>Invalid regex:</strong> {analysis.error}
            </div>
          )}
        </section>

        {/* 2. Test string and live matching */}
        <section className="overflow-hidden rounded-2xl border
          border-gray-200 bg-white dark:border-white/10
          dark:bg-[#1e1e1e]"
        >
          <div className="flex flex-wrap items-center justify-between
            gap-3 border-b border-gray-200 px-5 py-4
            dark:border-white/10"
          >
            <div>
              <h2 className="font-semibold text-gray-900
                dark:text-white"
              >
                Test String
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Matching updates as you type.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs
                font-semibold ${
                  analysis.error
                    ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300'
                    : analysis.matches.length
                      ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-400'
                }`}
              >
                {analysis.error
                  ? 'Pattern error'
                  : `${analysis.matches.length}${analysis.matches.length === 1000 ? '+' : ''} matches`}
              </span>
            </div>
          </div>

          <div className="p-5">
            <label htmlFor="regex-test-string" className="mb-2
              block text-sm font-medium text-gray-700
              dark:text-gray-300"
            >
              Text to test
            </label>

            <textarea
              id="regex-test-string"
              value={testString}
              onChange={(event) => {
                setTestString(event.target.value);
                setCopied(false);
              }}
              placeholder="Type or paste the text you want to test..."
              spellCheck={false}
              className="min-h-36 w-full resize-y rounded-xl
                border border-gray-200 bg-gray-50 p-4 font-mono
                text-sm leading-7 text-gray-900 outline-none
                transition-colors focus:border-violet-500
                focus:ring-2 focus:ring-violet-500/20
                dark:border-white/10 dark:bg-black/20
                dark:text-gray-100"
            />

            {/* Highlight matches in a readable preview. */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-medium text-gray-700
                  dark:text-gray-300"
                >
                  Highlighted preview
                </h3>

                <span className="text-xs text-gray-500">
                  {analysis.matches.length} found
                </span>
              </div>

              <div className="min-h-16 whitespace-pre-wrap break-words
                rounded-xl border border-gray-200 bg-gray-50 p-4
                font-mono text-sm leading-7 text-gray-700
                dark:border-white/10 dark:bg-black/20
                dark:text-gray-300"
              >
                {testString ? (
                  analysis.error ? (
                    <span className="text-red-500">
                      Fix the pattern to see highlighted matches.
                    </span>
                  ) : (
                    segments.map((segment, index) =>
                      segment.matched ? (
                        <mark
                          key={`match-${segment.key}`}
                          className="rounded bg-yellow-200 px-0.5
                            text-gray-900 dark:bg-yellow-400/30
                            dark:text-yellow-100"
                        >
                          {segment.value}
                        </mark>
                      ) : (
                        <span key={`text-${index}`}>
                          {segment.value}
                        </span>
                      )
                    )
                  )
                ) : (
                  <span className="text-gray-400">
                    Your test text will appear here.
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* 3. Common patterns */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900
              dark:text-white"
            >
              Common Patterns
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Select a pattern to load it into the tester with an example.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2
            xl:grid-cols-4"
          >
            {commonPatterns.map((item) => (
              <button
                key={item.name}
                type="button"
                onClick={() => loadPattern(item)}
                className={`min-w-0 rounded-xl border p-4
                  text-left transition-colors ${
                    pattern === item.pattern
                      ? 'border-violet-400 bg-violet-50 dark:border-violet-500/50 dark:bg-violet-500/10'
                      : 'border-gray-200 bg-white hover:border-violet-300 hover:bg-gray-50 dark:border-white/10 dark:bg-[#1e1e1e] dark:hover:border-violet-500/40 dark:hover:bg-white/[0.03]'
                  }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold
                    text-gray-900 dark:text-white"
                  >
                    {item.name}
                  </h3>

                  <span className="shrink-0 rounded-md bg-gray-100
                    px-1.5 py-0.5 font-mono text-xs text-gray-600
                    dark:bg-white/5 dark:text-gray-400"
                  >
                    /{item.flags || '∅'}
                  </span>
                </div>

                <p className="mt-2 min-h-10 text-xs leading-5
                  text-gray-500"
                >
                  {item.description}
                </p>

                <code className="mt-3 block max-h-16 overflow-hidden
                  break-all rounded-lg bg-gray-50 p-2 font-mono
                  text-xs leading-5 text-violet-700
                  dark:bg-black/20 dark:text-violet-300"
                >
                  {item.pattern}
                </code>

                <span className="mt-3 inline-flex items-center gap-1
                  text-xs font-semibold text-violet-600
                  dark:text-violet-400"
                >
                  <Search size={13} />
                  Use pattern
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Match details */}
        <section className="overflow-hidden rounded-2xl border
          border-gray-200 bg-white dark:border-white/10
          dark:bg-[#1e1e1e]"
        >
          <div className="flex flex-wrap items-center justify-between
            gap-3 border-b border-gray-200 px-5 py-4
            dark:border-white/10"
          >
            <div>
              <h2 className="font-semibold text-gray-900
                dark:text-white"
              >
                Match Details
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Match positions use zero-based character offsets.
              </p>
            </div>

            <button
              type="button"
              disabled={analysis.matches.length === 0}
              onClick={() =>
                copyText(
                  analysis.matches.map((match) => match.value).join('\n')
                )
              }
              className="inline-flex items-center gap-2 rounded-lg
                border border-gray-200 px-3 py-2 text-sm
                text-gray-700 transition-colors hover:bg-gray-100
                disabled:cursor-not-allowed disabled:opacity-40
                dark:border-white/10 dark:text-gray-300
                dark:hover:bg-white/5"
            >
              {copied ? <Check size={15} /> : <Clipboard size={15} />}
              {copied ? 'Copied!' : 'Copy matches'}
            </button>
          </div>

          {analysis.matches.length > 0 ? (
            <div className="max-h-96 overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-gray-50
                  dark:bg-[#252525]"
                >
                  <tr className="text-xs uppercase tracking-wide
                    text-gray-500"
                  >
                    <th className="px-4 py-3 font-medium">#</th>
                    <th className="px-4 py-3 font-medium">Match</th>
                    <th className="px-4 py-3 font-medium">Position</th>
                    <th className="px-4 py-3 font-medium">Capture groups</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100
                  dark:divide-white/5"
                >
                  {analysis.matches.map((match, index) => (
                    <tr key={`${match.index}-${index}`}>
                      <td className="px-4 py-3 text-gray-500">
                        {index + 1}
                      </td>

                      <td className="max-w-xs break-all px-4 py-3
                        font-mono text-gray-900 dark:text-gray-100"
                      >
                        {match.value || '(empty match)'}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3
                        font-mono text-gray-600 dark:text-gray-400"
                      >
                        {match.index}–{match.index + match.value.length}
                      </td>

                      <td className="max-w-xs break-all px-4 py-3
                        font-mono text-xs text-gray-600
                        dark:text-gray-400"
                      >
                        {match.groups.length > 0 ||
                        Object.keys(match.namedGroups).length > 0 ? (
                          <div className="space-y-1">
                            {match.groups.map((group, groupIndex) => (
                              <div key={groupIndex}>
                                ${groupIndex + 1}: {group ?? '(undefined)'}
                              </div>
                            ))}

                            {Object.entries(match.namedGroups).map(
                              ([name, value]) => (
                                <div key={name}>
                                  {name}: {value ?? '(undefined)'}
                                </div>
                              )
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {analysis.matches.length >= 1000 && (
                <p className="p-3 text-xs text-gray-500">
                  Display limited to 1,000 matches for performance.
                </p>
              )}
            </div>
          ) : (
            <div className="px-5 py-10 text-center">
              <FileText size={26} className="mx-auto
                text-gray-400"
              />

              <p className="mt-3 text-sm font-medium
                text-gray-700 dark:text-gray-300"
              >
                {analysis.error
                  ? 'Correct the regex to view match details.'
                  : pattern && testString
                    ? 'No matches found.'
                    : 'Enter a pattern and test string to get started.'}
              </p>
            </div>
          )}
        </section>

        {/* Optional replacement mode */}
        <section className="space-y-4 rounded-2xl border
          border-gray-200 bg-white p-5 dark:border-white/10
          dark:bg-[#1e1e1e] sm:p-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold text-gray-900
                dark:text-white"
              >
                Replace Mode
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Preview replacing matched text.
              </p>
            </div>

            <label className="flex cursor-pointer items-center gap-2
              text-sm text-gray-700 dark:text-gray-300"
            >
              <input
                type="checkbox"
                checked={replaceMode}
                onChange={(event) => setReplaceMode(event.target.checked)}
                className="h-4 w-4 accent-violet-600"
              />
              Enable replace mode
            </label>
          </div>

          {replaceMode && (
            <div className="space-y-3">
              <label htmlFor="regex-replacement" className="block
                text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Replacement text
              </label>

              <input
                id="regex-replacement"
                type="text"
                value={replacement}
                onChange={(event) => setReplacement(event.target.value)}
                placeholder="Text to replace matches with..."
                className="w-full rounded-xl border border-gray-200
                  bg-gray-50 px-4 py-3 text-sm text-gray-900
                  outline-none focus:border-violet-500
                  focus:ring-2 focus:ring-violet-500/20
                  dark:border-white/10 dark:bg-black/20
                  dark:text-gray-100"
              />

              <div className="space-y-2">
                <div className="flex flex-wrap items-center
                  justify-between gap-2"
                >
                  <label className="text-sm font-medium
                    text-gray-700 dark:text-gray-300"
                  >
                    Replacement preview
                  </label>

                  <button
                    type="button"
                    onClick={() => copyText(replacementPreview)}
                    disabled={!pattern || Boolean(analysis.error)}
                    className="inline-flex items-center gap-2
                      rounded-lg border border-gray-200 px-3 py-2
                      text-sm text-gray-700 hover:bg-gray-100
                      disabled:cursor-not-allowed disabled:opacity-40
                      dark:border-white/10 dark:text-gray-300
                      dark:hover:bg-white/5"
                  >
                    {copied ? <Check size={15} /> : <Clipboard size={15} />}
                    Copy preview
                  </button>
                </div>

                <pre className="min-h-20 whitespace-pre-wrap
                  break-words rounded-xl border border-gray-200
                  bg-gray-50 p-4 font-mono text-sm leading-6
                  text-gray-800 dark:border-white/10
                  dark:bg-black/20 dark:text-gray-200"
                >
                  {pattern && !analysis.error
                    ? replacementPreview
                    : 'Enter a valid regex to preview replacements.'}
                </pre>

                <p className="text-xs leading-5 text-gray-500">
                  JavaScript replacement syntax is supported, including
                  $&amp; for the full match and $1, $2, etc. for capture
                  groups. Without the g flag, only the first match is replaced.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Reset and privacy */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-2 rounded-lg
              border border-gray-200 px-4 py-2.5 text-sm
              text-gray-700 transition-colors hover:bg-gray-100
              dark:border-white/10 dark:text-gray-300
              dark:hover:bg-white/5"
          >
            <Trash2 size={16} />
            Clear all
          </button>

          <button
            type="button"
            onClick={() => {
              setPattern('');
              setTestString('');
              setFlags('g');
              setReplacement('');
              setReplaceMode(false);
              setCopied(false);
              setError('');
            }}
            className="inline-flex items-center gap-2 rounded-lg
              px-4 py-2.5 text-sm text-gray-600
              transition-colors hover:bg-gray-100
              dark:text-gray-400 dark:hover:bg-white/5"
          >
            <RotateCcw size={16} />
            Reset tester
          </button>
        </div>

        <div className="flex items-start gap-3 rounded-xl border
          border-gray-200 bg-gray-50 p-4
          dark:border-white/10 dark:bg-white/[0.03]"
        >
          <ShieldCheck size={20} className="mt-0.5 shrink-0
            text-green-600"
          />

          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-800
              dark:text-gray-200"
            >
              Private, browser-based testing
            </h3>

            <p className="text-sm leading-6 text-gray-600
              dark:text-gray-400"
            >
              Your pattern and test string are processed locally by
              JavaScript. They are not sent to a Toolnest backend.
              Avoid testing untrusted, extremely complex patterns against
              very large strings, as some regex patterns can be slow.
            </p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}