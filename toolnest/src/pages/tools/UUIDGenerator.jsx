
import { useState } from 'react';
import {
  Check,
  Clipboard,
  Download,
  Fingerprint,
  RefreshCw,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

import ToolLayout from '../../components/ToolLayout';

// Generate a UUID v4 using a cryptographically secure browser API.
function createUUID() {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error(
      'Secure random generation is unavailable in this browser.'
    );
  }

  // Prefer the built-in UUID generator when available.
  if (typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  // Fallback for browsers that support secure random bytes
  // but do not provide crypto.randomUUID().
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);

  // Set the UUID version to 4.
  bytes[6] = (bytes[6] & 0x0f) | 0x40;

  // Set the RFC-compatible variant bits.
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join('-');
}

export default function UUIDGenerator() {
  const [quantity, setQuantity] = useState('5');
  const [uppercase, setUppercase] = useState(false);
  const [removeHyphens, setRemoveHyphens] = useState(false);
  const [uuids, setUuids] = useState([]);
  const [error, setError] = useState('');
  const [copiedItem, setCopiedItem] = useState('');

  // Apply the selected display format to a UUID.
  function formatUUID(uuid) {
    let result = uuid;

    if (removeHyphens) {
      result = result.replace(/-/g, '');
    }

    if (uppercase) {
      result = result.toUpperCase();
    }

    return result;
  }

  // Generate the requested number of UUIDs.
  function handleGenerate() {
    const count = Number(quantity);

    if (!Number.isInteger(count) || count < 1 || count > 100) {
      setError('Choose a quantity between 1 and 100.');
      return;
    }

    try {
      const generated = Array.from(
        { length: count },
        () => createUUID()
      );

      setUuids(generated);
      setError('');
      setCopiedItem('');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not generate UUIDs. Please try again.'
      );
    }
  }

  // Copy one UUID or the entire generated list.
  async function handleCopy(value, key) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedItem(key);
      setError('');

      setTimeout(() => {
        setCopiedItem((current) => current === key ? '' : current);
      }, 2000);
    } catch {
      setError(
        'Clipboard access failed. Select and copy the UUID manually.'
      );
    }
  }

  // Download all UUIDs, one per line.
  function handleDownload() {
    if (uuids.length === 0) return;

    const content = uuids.map(formatUUID).join('\n');
    const blob = new Blob([content], {
      type: 'text/plain;charset=utf-8',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'toolnest-uuids.txt';
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  // Clear generated results and errors.
  function handleClear() {
    setUuids([]);
    setError('');
    setCopiedItem('');
  }

  return (
    <ToolLayout
      title="UUID Generator"
      description="Generate random UUID v4 identifiers instantly. Create one or a batch of unique-looking IDs, customize their format, and copy or download the results."
      category="Utilities"
      icon={Fingerprint}
    >
      <div className="space-y-6">
        {/* Generation settings */}
        <section className="space-y-5 rounded-2xl border
          border-gray-200 bg-white p-5 dark:border-white/10
          dark:bg-[#1e1e1e] sm:p-6"
        >
          <div className="space-y-2">
            <label
              htmlFor="uuid-quantity"
              className="block text-sm font-semibold
                text-gray-800 dark:text-gray-200"
            >
              Number of UUIDs
            </label>

            <input
              id="uuid-quantity"
              type="number"
              min="1"
              max="100"
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              className="w-full rounded-xl border border-gray-200
                bg-white px-4 py-3 text-gray-900 outline-none
                focus:border-blue-500 focus:ring-2
                focus:ring-blue-500/20 dark:border-white/10
                dark:bg-white/5 dark:text-white sm:max-w-xs"
            />

            <p className="text-xs text-gray-500">
              Generate between 1 and 100 UUIDs per batch.
            </p>
          </div>

          {/* Output formatting controls */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-800
              dark:text-gray-200"
            >
              Output options
            </p>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(event) => setUppercase(event.target.checked)}
                className="h-4 w-4 accent-blue-600"
              />

              <span className="text-sm text-gray-700 dark:text-gray-300">
                Uppercase letters
              </span>
            </label>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={removeHyphens}
                onChange={(event) =>
                  setRemoveHyphens(event.target.checked)
                }
                className="h-4 w-4 accent-blue-600"
              />

              <span className="text-sm text-gray-700 dark:text-gray-300">
                Remove hyphens
              </span>
            </label>

            <p className="text-xs leading-5 text-gray-500">
              Formatting changes how generated UUIDs are displayed and
              copied. The underlying UUID v4 values remain unchanged.
            </p>
          </div>

          {/* Main actions */}
          <div className="flex flex-wrap gap-3 border-t
            border-gray-200 pt-5 dark:border-white/10"
          >
            <button
              type="button"
              onClick={handleGenerate}
              className="inline-flex items-center justify-center
                gap-2 rounded-xl bg-blue-600 px-5 py-3
                text-sm font-semibold text-white transition-colors
                hover:bg-blue-700"
            >
              <RefreshCw size={17} />
              Generate UUIDs
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center justify-center
                gap-2 rounded-xl border border-gray-200 px-4 py-3
                text-sm font-medium text-gray-700 transition-colors
                hover:bg-gray-100 dark:border-white/10
                dark:text-gray-300 dark:hover:bg-white/5"
            >
              <Trash2 size={16} />
              Clear results
            </button>
          </div>
        </section>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200
              bg-red-50 px-4 py-3 text-sm text-red-700
              dark:border-red-500/20 dark:bg-red-500/10
              dark:text-red-300"
          >
            {error}
          </div>
        )}

        {/* Generated results */}
        <section className="overflow-hidden rounded-2xl border
          border-gray-200 bg-white dark:border-white/10
          dark:bg-[#1e1e1e]"
        >
          <div className="flex flex-wrap items-center justify-between
            gap-3 border-b border-gray-200 px-4 py-4
            dark:border-white/10 sm:px-5"
          >
            <div>
              <h2 className="font-semibold text-gray-900
                dark:text-white"
              >
                Generated UUIDs
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {uuids.length} {uuids.length === 1 ? 'UUID' : 'UUIDs'} generated
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  handleCopy(
                    uuids.map(formatUUID).join('\n'),
                    'all'
                  )
                }
                disabled={uuids.length === 0}
                className="inline-flex items-center gap-2 rounded-lg
                  border border-gray-200 px-3 py-2 text-sm
                  text-gray-700 transition-colors hover:bg-gray-100
                  disabled:cursor-not-allowed disabled:opacity-40
                  dark:border-white/10 dark:text-gray-300
                  dark:hover:bg-white/5"
              >
                {copiedItem === 'all'
                  ? <Check size={15} />
                  : <Clipboard size={15} />}
                {copiedItem === 'all' ? 'Copied all!' : 'Copy all'}
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={uuids.length === 0}
                className="inline-flex items-center gap-2 rounded-lg
                  bg-gray-900 px-3 py-2 text-sm font-medium
                  text-white transition-colors hover:bg-gray-700
                  disabled:cursor-not-allowed disabled:opacity-40
                  dark:bg-white dark:text-gray-900
                  dark:hover:bg-gray-200"
              >
                <Download size={15} />
                Download
              </button>
            </div>
          </div>

          {uuids.length > 0 ? (
            <div className="divide-y divide-gray-100
              dark:divide-white/5"
            >
              {uuids.map((uuid, index) => {
                const formatted = formatUUID(uuid);
                const key = `uuid-${index}`;

                return (
                  <div
                    key={uuid}
                    className="flex min-w-0 items-start gap-3
                      px-4 py-4 sm:px-5"
                  >
                    <span className="flex h-7 w-7 shrink-0
                      items-center justify-center rounded-lg
                      bg-gray-100 text-xs font-semibold
                      text-gray-600 dark:bg-white/5
                      dark:text-gray-400"
                    >
                      {index + 1}
                    </span>

                    <code className="min-w-0 flex-1 break-all
                      pt-1 font-mono text-sm leading-6
                      text-gray-800 dark:text-gray-200"
                    >
                      {formatted}
                    </code>

                    <button
                      type="button"
                      onClick={() => handleCopy(formatted, key)}
                      title="Copy this UUID"
                      aria-label={`Copy UUID ${index + 1}`}
                      className="shrink-0 rounded-lg border
                        border-gray-200 p-2 text-gray-600
                        transition-colors hover:bg-gray-100
                        dark:border-white/10 dark:text-gray-300
                        dark:hover:bg-white/5"
                    >
                      {copiedItem === key
                        ? <Check size={16} />
                        : <Clipboard size={16} />}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center
              justify-center px-5 py-14 text-center"
            >
              <div className="mb-4 rounded-2xl bg-gray-100
                p-4 dark:bg-white/5"
              >
                <Fingerprint
                  size={30}
                  className="text-gray-500 dark:text-gray-400"
                />
              </div>

              <h3 className="font-semibold text-gray-900
                dark:text-white"
              >
                No UUIDs generated yet
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6
                text-gray-500"
              >
                Choose how many identifiers you need, then click
                Generate UUIDs to see your results here.
              </p>
            </div>
          )}
        </section>

        {/* Privacy and security information */}
        <div className="flex items-start gap-3 rounded-xl
          border border-gray-200 bg-gray-50 p-4
          dark:border-white/10 dark:bg-white/[0.03]"
        >
          <ShieldCheck
            size={20}
            className="mt-0.5 shrink-0 text-green-600"
          />

          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-gray-800
              dark:text-gray-200"
            >
              Generated locally
            </h3>

            <p className="text-sm leading-6 text-gray-600
              dark:text-gray-400"
            >
              UUIDs are generated in your browser using a
              cryptographically secure random source. No request
              to a Toolnest backend is needed.
            </p>
          </div>
        </div>

        {/* Educational content */}
        <section className="space-y-3 border-t border-gray-200
          pt-6 dark:border-white/10"
        >
          <h2 className="text-lg font-semibold text-gray-900
            dark:text-white"
          >
            What is a UUID?
          </h2>

          <p className="text-sm leading-7 text-gray-600
            dark:text-gray-400"
          >
            A Universally Unique Identifier (UUID) is a 128-bit
            value commonly used to identify records, resources,
            sessions, and objects in software applications. UUID
            version 4 is based on random data with specific bits
            reserved to identify its version and variant.
          </p>

          <p className="text-sm leading-7 text-gray-600
            dark:text-gray-400"
          >
            UUIDs have an extremely low probability of collision
            when generated correctly, but they are not a mathematical
            guarantee of uniqueness in every possible system.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}