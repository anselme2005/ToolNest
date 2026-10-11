import { useMemo, useState } from "react";
import {
  Check,
  Clipboard,
  Clock3,
  Download,
  FileText,
  RotateCcw,
  Sparkles,
  Trash2,
} from "lucide-react";

import ToolLayout from "../../components/ToolLayout";

// Example text users can load to explore the statistics.
const sampleText = `Toolnest is a collection of useful online tools designed to make everyday tasks easier.

Whether you are formatting JSON, converting text, or counting words, Toolnest helps you get things done quickly.

Everything in this Word Counter runs locally in your browser.`;

// Format an estimated duration as minutes or seconds.
function formatTime(minutes) {
  if (minutes === 0) return "0 min";
  if (minutes < 1) return `${Math.ceil(minutes * 60)} sec`;
  return `${minutes} min`;
}

export default function WordCounter() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  // Recalculate all statistics whenever the text changes.
  const statistics = useMemo(() => {
    const trimmedText = text.trim();

    // Count words using whitespace, matching the existing counter behavior.
    const words = trimmedText ? trimmedText.split(/\s+/u) : [];

    // Count sentences using common sentence-ending punctuation.
    const sentences = trimmedText
      ? (trimmedText.match(/[.!?]+(?=\s|$)/g) || []).length
      : 0;

    // Count non-empty paragraphs separated by blank lines.
    const paragraphs = trimmedText
      ? trimmedText
          .split(/\n\s*\n/)
          .filter((paragraph) => paragraph.trim().length > 0).length
      : 0;

    // Count characters other than letters, numbers, and whitespace.
    // Examples: @, #, !, ?, $, %, and punctuation marks.
    const specialCharacters = (text.match(/[^\p{L}\p{N}\s]/gu) || []).length;

    // Build a case-insensitive frequency table of individual words.
    // Punctuation around words is ignored, and apostrophes inside
    // words are preserved (for example, "don't").
    const individualWords =
      text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) || [];

    const wordCounts = {};

    individualWords.forEach((word) => {
      const normalizedWord = word.toLocaleLowerCase();
      wordCounts[normalizedWord] = (wordCounts[normalizedWord] || 0) + 1;
    });

    // Sort by frequency (highest first), then alphabetically.
    const topWords = Object.entries(wordCounts)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));

    return {
      words: words.length,
      characters: text.length,
      charactersWithoutSpaces: text.replace(/\s/g, "").length,
      specialCharacters,
      sentences,
      paragraphs,
      topWords,
      // Estimated at 200 words/minute reading and 130 speaking.
      readingTime: words.length / 200,
      speakingTime: words.length / 130,
    };
  }, [text]);

  function loadSample() {
    setText(sampleText);
    setCopied(false);
  }

  function clearText() {
    setText("");
    setCopied(false);
  }

  async function copyText() {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      // Restore the button label after a short delay.
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.alert(
        "Could not access the clipboard. Please copy the text manually.",
      );
    }
  }

  function downloadText() {
    if (!text) return;

    // Create a downloadable plain-text file in the browser.
    const blob = new Blob([text], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "toolnest-text.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  function resetTool() {
    setText("");
    setCopied(false);
  }

  // Reusable statistic card.
  function StatisticCard({ label, value, icon: Icon }) {
    return (
      <div
        className="rounded-xl border border-black/5 bg-black/[0.02]
        p-4 dark:border-white/10 dark:bg-white/[0.02]"
      >
        <div className="flex items-center gap-2 text-neutral-500">
          {Icon && <Icon size={16} />}
          <span className="text-xs">{label}</span>
        </div>

        <p className="mt-3 text-2xl font-semibold tracking-tight">
          {value.toLocaleString()}
        </p>
      </div>
    );
  }

  return (
    <ToolLayout
      title="Word Counter"
      description="Count words, characters, sentences, and paragraphs instantly. Estimate reading and speaking time, then copy or download your text."
      category="Text"
      icon={FileText}
    >
      <div
        className="overflow-hidden rounded-2xl border border-black/10
        bg-white shadow-sm dark:border-white/10 dark:bg-[#1a1b18]"
      >
        {/* Toolbar actions */}
        <div
          className="flex flex-col gap-3 border-b border-black/5
          p-4 dark:border-white/10 sm:flex-row sm:items-center
          sm:justify-between"
        >
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={loadSample}
              className="inline-flex items-center gap-2 rounded-lg
                bg-emerald-600 px-3 py-2 text-sm font-medium
                text-white transition hover:bg-emerald-700"
            >
              <Sparkles size={16} />
              Load example
            </button>

            <button
              type="button"
              onClick={clearText}
              className="inline-flex items-center gap-2 rounded-lg
                border border-black/10 px-3 py-2 text-sm transition
                hover:bg-black/5 dark:border-white/10
                dark:hover:bg-white/5"
            >
              <Trash2 size={15} />
              Clear
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyText}
              disabled={!text}
              className="inline-flex items-center gap-2 rounded-lg
                border border-black/10 px-3 py-2 text-sm transition
                hover:bg-black/5 disabled:cursor-not-allowed
                disabled:opacity-40 dark:border-white/10
                dark:hover:bg-white/5"
            >
              {copied ? <Check size={16} /> : <Clipboard size={16} />}
              {copied ? "Copied!" : "Copy text"}
            </button>

            <button
              type="button"
              onClick={downloadText}
              disabled={!text}
              className="inline-flex items-center gap-2 rounded-lg
                border border-black/10 px-3 py-2 text-sm transition
                hover:bg-black/5 disabled:cursor-not-allowed
                disabled:opacity-40 dark:border-white/10
                dark:hover:bg-white/5"
            >
              <Download size={16} />
              Download
            </button>
          </div>
        </div>

        {/* Editor and word-frequency table sit beside each other on desktop. */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          {/* Text editor */}
          <section
            className="min-w-0 border-b border-black/5
      dark:border-white/10 lg:border-b-0 lg:border-r"
          >
            <div
              className="flex items-center justify-between gap-3
        border-b border-black/5 px-4 py-3 dark:border-white/10"
            >
              <h2 className="text-sm font-semibold">Your text</h2>

              <span className="text-xs text-neutral-500">
                {statistics.characters.toLocaleString()} characters
              </span>
            </div>

            <textarea
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                setCopied(false);
              }}
              placeholder="Start typing or paste your text here..."
              aria-label="Text to count"
              spellCheck={true}
              className="min-h-[300px] w-full resize-y bg-transparent
          p-5 text-sm leading-7 outline-none
          placeholder:text-neutral-400
          focus:bg-emerald-500/[0.02] sm:min-h-[380px]"
            />

            <div
              className="flex flex-wrap items-center justify-between
        gap-2 border-t border-black/5 bg-black/[0.02] px-4 py-3
        text-xs text-neutral-500 dark:border-white/10
        dark:bg-white/[0.02]"
            >
              <span>{statistics.words.toLocaleString()} words</span>

              <button
                type="button"
                onClick={resetTool}
                className="inline-flex items-center gap-1.5 transition
            hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                <RotateCcw size={13} />
                Reset
              </button>
            </div>
          </section>

          {/* Word frequency table */}
          <section className="min-w-0">
            <div
              className="flex items-center justify-between gap-3
        border-b border-black/5 px-4 py-3 dark:border-white/10"
            >
              <h2 className="text-sm font-semibold">Top Words</h2>

              <span className="text-xs text-neutral-500">
                {statistics.topWords.length} unique
              </span>
            </div>

            <div className="max-h-[440px] min-h-[300px] overflow-auto sm:min-h-[380px]">
              <table className="w-full border-collapse text-left text-sm">
                <thead
                  className="sticky top-0 bg-[#fafaf9]
            dark:bg-[#1a1b18]"
                >
                  <tr
                    className="border-b border-black/5
              dark:border-white/10"
                  >
                    <th className="px-4 py-3 font-medium text-neutral-500">
                      Word
                    </th>
                    <th
                      className="px-4 py-3 text-right font-medium
                text-neutral-500"
                    >
                      Count
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {statistics.topWords.length > 0 ? (
                    statistics.topWords.map(({ word, count }) => (
                      <tr
                        key={word}
                        className="border-b border-black/5 last:border-0
                    dark:border-white/10"
                      >
                        <td className="max-w-0 break-words px-4 py-3">
                          {word}
                        </td>
                        <td
                          className="px-4 py-3 text-right font-medium
                    tabular-nums text-emerald-700
                    dark:text-emerald-400"
                        >
                          {count.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={2}
                        className="px-4 py-10 text-center
                  text-sm leading-6 text-neutral-500"
                      >
                        Your word frequency table will appear here as you type.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      {/* Live statistics */}
      <section className="mt-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Text statistics
          </h2>

          <span className="text-xs text-neutral-500">Updates as you type</span>
        </div>

        <div
          className="grid grid-cols-2 gap-3 sm:grid-cols-3
  lg:grid-cols-3"
        >
          <StatisticCard
            label="Words"
            value={statistics.words}
            icon={FileText}
          />

          <StatisticCard label="Characters" value={statistics.characters} />

          <StatisticCard
            label="Special characters"
            value={statistics.specialCharacters}
          />

          <StatisticCard
            label="Without spaces"
            value={statistics.charactersWithoutSpaces}
          />

          <StatisticCard label="Sentences" value={statistics.sentences} />

          <StatisticCard label="Paragraphs" value={statistics.paragraphs} />
        </div>
      </section>

      {/* Estimated reading and speaking times */}
      <section className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div
          className="flex items-start gap-4 rounded-2xl
          border border-black/5 bg-white p-5
          dark:border-white/10 dark:bg-[#1a1b18]"
        >
          <div
            className="flex h-11 w-11 shrink-0 items-center
            justify-center rounded-xl bg-emerald-500/10
            text-emerald-700 dark:text-emerald-400"
          >
            <Clock3 size={21} />
          </div>

          <div>
            <p className="text-sm text-neutral-500">Reading time</p>
            <p className="mt-1 text-xl font-semibold">
              {formatTime(statistics.words / 200)}
            </p>
            <p className="mt-1 text-xs leading-5 text-neutral-500">
              Estimated at 200 words per minute.
            </p>
          </div>
        </div>

        <div
          className="flex items-start gap-4 rounded-2xl
          border border-black/5 bg-white p-5
          dark:border-white/10 dark:bg-[#1a1b18]"
        >
          <div
            className="flex h-11 w-11 shrink-0 items-center
            justify-center rounded-xl bg-emerald-500/10
            text-emerald-700 dark:text-emerald-400"
          >
            <Clock3 size={21} />
          </div>

          <div>
            <p className="text-sm text-neutral-500">Speaking time</p>
            <p className="mt-1 text-xl font-semibold">
              {formatTime(statistics.words / 130)}
            </p>
            <p className="mt-1 text-xs leading-5 text-neutral-500">
              Estimated at 130 words per minute.
            </p>
          </div>
        </div>
      </section>

      {/* Usage instructions */}
      <section className="mt-10 max-w-3xl">
        <h2 className="text-xl font-semibold tracking-tight">
          How to use the Word Counter
        </h2>

        <ol
          className="mt-4 list-decimal space-y-2 pl-5 text-sm
          leading-6 text-neutral-600 dark:text-neutral-400"
        >
          <li>Type into the editor or paste text from another document.</li>
          <li>
            Review the live word, character, sentence, and paragraph counts.
          </li>
          <li>Check the estimated reading and speaking times.</li>
          <li>
            Copy your text or download it as a plain-text file when needed.
          </li>
        </ol>

        <p className="mt-5 text-sm leading-6 text-neutral-500">
          Your text is processed locally in your browser and is not sent to a
          server by this tool.
        </p>
      </section>
    </ToolLayout>
  );
}
