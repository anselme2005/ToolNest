
import { useMemo, useState } from 'react';
import {
  Braces,
  Check,
  Clipboard,
  Download,
  FileJson,
  Minimize2,
  RotateCcw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import ToolLayout from '../../components/ToolLayout';

// Example data users can load to try the formatter.
const sampleJSON = {
  project: 'Toolnest',
  description: 'A collection of useful online tools',
  version: 1,
  active: true,
  features: ['JSON formatting', 'Validation', 'Minification'],
  author: {
    role: 'Developer',
    website: 'https://example.com',
  },
};

// Convert any JSON value into a readable string.
// A two-space indentation is the default.
function formatJSON(value, indentation) {
  return JSON.stringify(value, null, indentation);
}

export default function JsonFormatter() {
  const [input, setInput] = useState('');
  const [indentation, setIndentation] = useState('2');
  const [mode, setMode] = useState('pretty');
  const [copied, setCopied] = useState(false);

  // Validate whenever the input changes.
  // useMemo avoids recalculating until input or formatting options change.
  const result = useMemo(() => {
    if (!input.trim()) {
      return {
        valid: null,
        output: '',
        error: '',
      };
    }

    try {
      const parsed = JSON.parse(input);

      // Pretty mode uses indentation; minify mode removes extra whitespace.
      const output =
        mode === 'minify'
          ? JSON.stringify(parsed)
          : formatJSON(parsed, Number(indentation));

      return {
        valid: true,
        output,
        error: '',
      };
    } catch (error) {
      return {
        valid: false,
        output: '',
        error: error.message,
      };
    }
  }, [input, indentation, mode]);

  // Basic input statistics for the status bar.
  const statistics = useMemo(() => {
    const lines = input ? input.split('\n').length : 0;

    return {
      characters: input.length,
      lines,
      bytes: new TextEncoder().encode(input).length,
    };
  }, [input]);

  function loadSample() {
    setInput(JSON.stringify(sampleJSON, null, 2));
    setMode('pretty');
  }

  function clearEditor() {
    setInput('');
    setCopied(false);
  }

  async function copyOutput() {
    if (!result.valid || !result.output) return;

    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);

      // Reset the temporary button label after a short delay.
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard access can be blocked by browser permissions.
      window.alert('Could not access the clipboard. Please copy the output manually.');
    }
  }

  function downloadOutput() {
    if (!result.valid || !result.output) return;

    // Build a temporary downloadable JSON file in the browser.
    const blob = new Blob([result.output], {
      type: 'application/json;charset=utf-8',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'formatted.json';
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  return (
    <ToolLayout
      title="JSON Formatter & Validator"
      description="Format messy JSON, validate its syntax, and minify data for your projects. Everything runs in your browser."
      category="Developer"
      icon={Braces}
    >
      <div className="overflow-hidden rounded-2xl border border-black/10
        bg-white shadow-sm dark:border-white/10 dark:bg-[#1a1b18]">

        {/* Toolbar */}
        <div className="flex flex-col gap-4 border-b border-black/5
          p-4 dark:border-white/10 sm:flex-row sm:items-center
          sm:justify-between">

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={loadSample}
              className="inline-flex items-center gap-2 rounded-lg
                bg-emerald-600 px-3 py-2 text-sm font-medium text-white
                transition hover:bg-emerald-700"
            >
              <Sparkles size={16} />
              Load example
            </button>

            <button
              type="button"
              onClick={clearEditor}
              className="inline-flex items-center gap-2 rounded-lg
                border border-black/10 px-3 py-2 text-sm transition
                hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
            >
              <Trash2 size={15} />
              Clear
            </button>
          </div>

          <label className="flex items-center gap-2 text-sm
            text-neutral-600 dark:text-neutral-300">
            Indentation

            <select
              value={indentation}
              onChange={(event) => setIndentation(event.target.value)}
              disabled={mode === 'minify'}
              className="rounded-lg border border-black/10 bg-white
                px-3 py-2 outline-none focus:border-emerald-500
                disabled:opacity-50 dark:border-white/10
                dark:bg-[#22231f]"
            >
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
              <option value="8">8 spaces</option>
            </select>
          </label>
        </div>

        {/* Editor and output */}
        <div className="grid grid-cols-1 lg:grid-cols-2">

          {/* Input panel */}
          <section className="min-w-0 border-b border-black/5
            dark:border-white/10 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between gap-3
              border-b border-black/5 px-4 py-3 dark:border-white/10">
              <h2 className="text-sm font-semibold">Input JSON</h2>
              <span className="text-xs text-neutral-500">
                {statistics.characters} characters
              </span>
            </div>

            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={'Paste your JSON here...\n\n{\n  "name": "Example"\n}'}
              spellCheck={false}
              aria-label="Input JSON"
              className="min-h-[360px] w-full resize-y bg-transparent
                p-4 font-mono text-sm leading-6 outline-none
                placeholder:text-neutral-400 focus:bg-emerald-500/[0.02]
                sm:min-h-[480px]"
            />

            <div className="flex flex-wrap gap-x-4 gap-y-1 border-t
              border-black/5 px-4 py-3 text-xs text-neutral-500
              dark:border-white/10">
              <span>{statistics.lines} lines</span>
              <span>{statistics.bytes} bytes</span>
            </div>
          </section>

          {/* Output panel */}
          <section className="min-w-0">
            <div className="flex flex-wrap items-center justify-between
              gap-3 border-b border-black/5 px-4 py-3
              dark:border-white/10">
              <h2 className="text-sm font-semibold">Formatted output</h2>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setMode('pretty')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium
                    transition ${
                    mode === 'pretty'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-black/5 text-neutral-600 dark:bg-white/10 dark:text-neutral-300'
                  }`}
                >
                  Format
                </button>

                <button
                  type="button"
                  onClick={() => setMode('minify')}
                  className={`inline-flex items-center gap-1.5
                    rounded-lg px-3 py-1.5 text-xs font-medium
                    transition ${
                    mode === 'minify'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-black/5 text-neutral-600 dark:bg-white/10 dark:text-neutral-300'
                  }`}
                >
                  <Minimize2 size={13} />
                  Minify
                </button>
              </div>
            </div>

            {/* Valid JSON output */}
            {result.valid === true && (
              <>
                <pre className="min-h-[360px] overflow-auto whitespace-pre
                  p-4 font-mono text-sm leading-6 text-emerald-800
                  dark:text-emerald-300 sm:min-h-[480px]">
                  {result.output}
                </pre>

                <div className="flex flex-wrap gap-2 border-t
                  border-black/5 p-4 dark:border-white/10">
                  <button
                    type="button"
                    onClick={copyOutput}
                    className="inline-flex items-center gap-2 rounded-lg
                      bg-emerald-600 px-3 py-2 text-sm font-medium
                      text-white transition hover:bg-emerald-700"
                  >
                    {copied ? <Check size={16} /> : <Clipboard size={16} />}
                    {copied ? 'Copied!' : 'Copy output'}
                  </button>

                  <button
                    type="button"
                    onClick={downloadOutput}
                    className="inline-flex items-center gap-2 rounded-lg
                      border border-black/10 px-3 py-2 text-sm
                      transition hover:bg-black/5 dark:border-white/10
                      dark:hover:bg-white/5"
                  >
                    <Download size={16} />
                    Download JSON
                  </button>
                </div>
              </>
            )}

            {/* Invalid JSON feedback */}
            {result.valid === false && (
              <div className="min-h-[360px] p-5 sm:min-h-[480px]">
                <div className="rounded-xl border border-red-500/20
                  bg-red-500/5 p-4">
                  <div className="flex items-center gap-2 font-semibold
                    text-red-700 dark:text-red-400">
                    <FileJson size={18} />
                    Invalid JSON
                  </div>

                  <p className="mt-3 break-words font-mono text-sm
                    leading-6 text-red-700 dark:text-red-300">
                    {result.error}
                  </p>

                  <p className="mt-3 text-xs leading-5 text-neutral-500">
                    Check for missing commas, unmatched braces,
                    unquoted property names, or invalid string quotes.
                  </p>
                </div>
              </div>
            )}

            {/* Empty state */}
            {result.valid === null && (
              <div className="flex min-h-[360px] flex-col items-center
                justify-center px-6 text-center sm:min-h-[480px]">
                <div className="flex h-14 w-14 items-center justify-center
                  rounded-2xl bg-black/5 text-neutral-400
                  dark:bg-white/5">
                  <Braces size={27} />
                </div>

                <h3 className="mt-4 text-sm font-semibold">
                  Your output will appear here
                </h3>

                <p className="mt-2 max-w-xs text-sm leading-6
                  text-neutral-500">
                  Paste JSON into the editor or load an example
                  to get started.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Validation status */}
        <div className="flex flex-wrap items-center justify-between
          gap-3 border-t border-black/5 bg-black/[0.02] px-4 py-3
          dark:border-white/10 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2 text-xs">
            <span className={`h-2 w-2 rounded-full ${
              result.valid === true
                ? 'bg-emerald-500'
                : result.valid === false
                  ? 'bg-red-500'
                  : 'bg-neutral-400'
            }`} />

            <span className="text-neutral-600 dark:text-neutral-300">
              {result.valid === true
                ? 'Valid JSON'
                : result.valid === false
                  ? 'Syntax error detected'
                  : 'Waiting for input'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setInput('');
              setMode('pretty');
              setIndentation('2');
              setCopied(false);
            }}
            className="inline-flex items-center gap-1.5 text-xs
              text-neutral-500 transition hover:text-emerald-600"
          >
            <RotateCcw size={13} />
            Reset options
          </button>
        </div>
      </div>

      {/* Small explanatory section below the tool. */}
      <section className="mt-10 max-w-3xl">
        <h2 className="text-xl font-semibold tracking-tight">
          How to use the JSON Formatter
        </h2>

        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm
          leading-6 text-neutral-600 dark:text-neutral-400">
          <li>Paste your JSON into the input editor or load the example.</li>
          <li>Choose Format for readable indentation or Minify for compact output.</li>
          <li>Check the validation status to see whether the input is valid.</li>
          <li>Copy the result or download it as a JSON file.</li>
        </ol>

        <p className="mt-5 text-sm leading-6 text-neutral-500">
          Your JSON is processed locally in your browser. This tool does
          not send your input to a server.
        </p>
      </section>
    </ToolLayout>
  );
}