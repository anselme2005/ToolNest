
import { useState } from 'react';
import {
  ArrowDownUp,
  ArrowLeftRight,
  Check,
  Clipboard,
  Code2,
  Download,
  FileText,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

import ToolLayout from '../../components/ToolLayout';

// Example text users can load to test the converter.
const sampleText =
  'Hello, Toolnest! Base64 supports text like café and emojis 🚀.';

// Convert a JavaScript string into Base64 safely, including Unicode.
function encodeBase64(value) {
  const bytes = new TextEncoder().encode(value);

  // Convert the bytes into a binary string for btoa().
  let binary = '';

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

// Convert Base64 back into readable UTF-8 text.
function decodeBase64(value) {
  // Allow users to paste Base64 with whitespace or line breaks.
  const cleaned = value.replace(/\s/g, '');

  // Reject malformed Base64 rather than silently accepting it.
  if (
    cleaned.length % 4 !== 0 ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
      cleaned
    )
  ) {
    throw new Error('Invalid Base64 input. Please check the format.');
  }

  const binary = atob(cleaned);

  // Convert decoded bytes back to UTF-8.
  const bytes = Uint8Array.from(
    binary,
    (character) => character.charCodeAt(0)
  );

  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}

export default function Base64Converter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Run the selected conversion.
  function handleConvert() {
    setError('');
    setCopied(false);
    setOutput('');

    if (!input.trim()) {
      setError('Enter some text to get started.');
      return;
    }

    try {
      const result =
        mode === 'encode'
          ? encodeBase64(input)
          : decodeBase64(input);

      setOutput(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong during conversion.'
      );
    }
  }

  // Copy the converted result.
  async function handleCopy() {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);

      // Reset the copied indicator after a short delay.
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(
        'Could not access the clipboard. Try copying the result manually.'
      );
    }
  }

  // Switch between encoding and decoding.
  function handleModeChange(nextMode) {
    setMode(nextMode);
    setInput('');
    setOutput('');
    setError('');
    setCopied(false);
  }

  // Move the output back into the input.
  function handleSwap() {
    if (!output) return;

    setInput(output);
    setOutput('');
    setMode(mode === 'encode' ? 'decode' : 'encode');
    setError('');
    setCopied(false);
  }

  // Load the example in the appropriate mode.
  function handleExample() {
    setError('');
    setCopied(false);

    if (mode === 'encode') {
      setInput(sampleText);
    } else {
      setInput(encodeBase64(sampleText));
    }

    setOutput('');
  }

  // Download the result as a text file.
  function handleDownload() {
    if (!output) return;

    const blob = new Blob([output], {
      type: 'text/plain;charset=utf-8',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = mode === 'encode'
      ? 'base64-encoded.txt'
      : 'base64-decoded.txt';

    link.click();
    URL.revokeObjectURL(url);
  }

  // Clear everything and return to the default state.
  function handleClear() {
    setInput('');
    setOutput('');
    setError('');
    setCopied(false);
  }

  return (
    <ToolLayout
      title="Base64 Converter"
      description="Encode text to Base64 or decode Base64 back into readable text. Fast, simple, and processed locally in your browser."
      category="Developer"
      icon={Code2}
    >
      <div className="space-y-6">
        {/* Encoding and decoding mode selector */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className="inline-flex rounded-xl border border-gray-200
              bg-gray-100 p-1 dark:border-white/10 dark:bg-white/5"
          >
            <button
              type="button"
              onClick={() => handleModeChange('encode')}
              className={`rounded-lg px-4 py-2 text-sm font-medium
                transition-colors ${
                  mode === 'encode'
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-white/10 dark:text-white'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
            >
              Encode
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('decode')}
              className={`rounded-lg px-4 py-2 text-sm font-medium
                transition-colors ${
                  mode === 'decode'
                    ? 'bg-white text-gray-900 shadow-sm dark:bg-white/10 dark:text-white'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
            >
              Decode
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExample}
              className="inline-flex items-center gap-2 rounded-lg border
                border-gray-200 px-3 py-2 text-sm text-gray-700
                transition-colors hover:bg-gray-100
                dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
            >
              <FileText size={16} />
              Load example
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-2 rounded-lg border
                border-gray-200 px-3 py-2 text-sm text-gray-700
                transition-colors hover:bg-gray-100
                dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
            >
              <Trash2 size={16} />
              Clear
            </button>
          </div>
        </div>

        {/* Input and output panels */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Input panel */}
          <section
            className="overflow-hidden rounded-2xl border
              border-gray-200 bg-white dark:border-white/10
              dark:bg-[#1e1e1e]"
          >
            <div className="flex items-center justify-between gap-3
              border-b border-gray-200 px-4 py-3
              dark:border-white/10"
            >
              <label
                htmlFor="base64-input"
                className="text-sm font-semibold text-gray-800
                  dark:text-gray-200"
              >
                {mode === 'encode' ? 'Plain text' : 'Base64 input'}
              </label>

              <span className="text-xs text-gray-500">
                {input.length.toLocaleString()} characters
              </span>
            </div>

            <textarea
              id="base64-input"
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                setError('');
                setOutput('');
                setCopied(false);
              }}
              placeholder={
                mode === 'encode'
                  ? 'Enter the text you want to encode...'
                  : 'Paste your Base64 string here...'
              }
              spellCheck={false}
              className="min-h-64 w-full resize-y bg-transparent p-4
                font-mono text-sm leading-6 text-gray-800 outline-none
                placeholder:text-gray-400 focus:ring-2 focus:ring-inset
                focus:ring-blue-500/40 dark:text-gray-200"
            />

            <div className="border-t border-gray-200 px-4 py-3
              text-xs text-gray-500 dark:border-white/10"
            >
              {mode === 'encode'
                ? 'Enter ordinary text, including Unicode characters.'
                : 'Whitespace is ignored when decoding.'}
            </div>
          </section>

          {/* Output panel */}
          <section
            className="overflow-hidden rounded-2xl border
              border-gray-200 bg-white dark:border-white/10
              dark:bg-[#1e1e1e]"
          >
            <div className="flex items-center justify-between gap-3
              border-b border-gray-200 px-4 py-3
              dark:border-white/10"
            >
              <label
                htmlFor="base64-output"
                className="text-sm font-semibold text-gray-800
                  dark:text-gray-200"
              >
                {mode === 'encode' ? 'Base64 output' : 'Decoded text'}
              </label>

              <span className="text-xs text-gray-500">
                {output.length.toLocaleString()} characters
              </span>
            </div>

            <textarea
              id="base64-output"
              value={output}
              readOnly
              placeholder="Your converted result will appear here..."
              spellCheck={false}
              className="min-h-64 w-full resize-y bg-transparent p-4
                font-mono text-sm leading-6 text-gray-800 outline-none
                placeholder:text-gray-400 dark:text-gray-200"
            />

            <div className="flex flex-wrap items-center justify-between
              gap-2 border-t border-gray-200 px-4 py-3
              dark:border-white/10"
            >
              <span className="text-xs text-gray-500">
                {output
                  ? `${new Blob([output]).size.toLocaleString()} bytes`
                  : 'Waiting for conversion'}
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSwap}
                  disabled={!output}
                  title="Use the result as the next input"
                  className="inline-flex items-center gap-2 rounded-lg
                    border border-gray-200 px-3 py-2 text-sm
                    text-gray-700 transition-colors hover:bg-gray-100
                    disabled:cursor-not-allowed disabled:opacity-40
                    dark:border-white/10 dark:text-gray-300
                    dark:hover:bg-white/5"
                >
                  <ArrowDownUp size={15} />
                  Swap
                </button>

                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!output}
                  className="inline-flex items-center gap-2 rounded-lg
                    bg-gray-900 px-3 py-2 text-sm font-medium text-white
                    transition-colors hover:bg-gray-700
                    disabled:cursor-not-allowed disabled:opacity-40
                    dark:bg-white dark:text-gray-900
                    dark:hover:bg-gray-200"
                >
                  {copied ? <Check size={15} /> : <Clipboard size={15} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!output}
                  title="Download result"
                  className="inline-flex items-center justify-center
                    rounded-lg border border-gray-200 px-3 py-2
                    text-gray-700 transition-colors hover:bg-gray-100
                    disabled:cursor-not-allowed disabled:opacity-40
                    dark:border-white/10 dark:text-gray-300
                    dark:hover:bg-white/5"
                >
                  <Download size={15} />
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Validation errors */}
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50
              px-4 py-3 text-sm text-red-700
              dark:border-red-500/20 dark:bg-red-500/10
              dark:text-red-300"
          >
            {error}
          </div>
        )}

        {/* Main conversion action */}
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleConvert}
            className="inline-flex w-full items-center justify-center
              gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold
              text-white shadow-sm transition-colors hover:bg-blue-700
              sm:w-auto"
          >
            <ArrowLeftRight size={18} />
            {mode === 'encode' ? 'Encode to Base64' : 'Decode Base64'}
          </button>

          <p className="text-center text-xs text-gray-500">
            Conversion runs only when you click the button.
          </p>
        </div>

        {/* Privacy notice */}
        <div className="flex items-start gap-3 rounded-xl border
          border-gray-200 bg-gray-50 p-4
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
              Your data stays in your browser
            </h3>

            <p className="text-sm leading-6 text-gray-600
              dark:text-gray-400"
            >
              This converter does not send your input to a server.
              Remember that Base64 is an encoding format, not encryption.
              Never use it as a way to protect passwords or confidential data.
            </p>
          </div>
        </div>

        {/* Brief explanation for users and search engines */}
        <section className="space-y-3 border-t border-gray-200 pt-6
          dark:border-white/10"
        >
          <h2 className="text-lg font-semibold text-gray-900
            dark:text-white"
          >
            What is Base64?
          </h2>

          <p className="text-sm leading-7 text-gray-600
            dark:text-gray-400"
          >
            Base64 represents binary data using a set of 64 printable
            characters. Developers commonly use it to represent data in
            JSON, email messages, data URLs, and APIs. It is useful for
            transporting data, but it does not make the data secret.
          </p>
        </section>
      </div>
    </ToolLayout>
  );
}