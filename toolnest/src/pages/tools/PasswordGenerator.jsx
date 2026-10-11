
import { useEffect, useState } from "react";
import {
  Copy,
  RefreshCw,
  ShieldCheck,
  Check,
  Download,
  LockKeyhole,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import ToolLayout from "../../components/ToolLayout";

// Character groups used to build generated passwords.
const CHARACTER_GROUPS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

// Characters that can be confused with similar-looking characters.
const AMBIGUOUS_CHARACTERS = "0O1lI";

// Securely generate an unbiased random integer between 0 and max - 1.
// Rejection sampling prevents the statistical bias caused by using modulo alone.
function secureRandomInt(max) {
  if (!Number.isInteger(max) || max < 1 || max > 256) {
    throw new Error("Invalid random range.");
  }

  if (!globalThis.crypto?.getRandomValues) {
    throw new Error(
      "Secure random generation is not supported by this browser."
    );
  }

  const randomValues = new Uint8Array(1);
  const limit = Math.floor(256 / max) * max;

  let value;

  do {
    globalThis.crypto.getRandomValues(randomValues);
    value = randomValues[0];
  } while (value >= limit);

  return value % max;
}

// Randomly select one character from a non-empty string.
function secureRandomCharacter(characters) {
  return characters[secureRandomInt(characters.length)];
}

// Shuffle characters using a cryptographically secure Fisher-Yates shuffle.
function secureShuffle(characters) {
  const result = [...characters];

  for (let i = result.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result.join("");
}

// Generate one password using the selected character types.
function createPassword(length, options, excludeAmbiguous) {
  const groups = Object.entries(CHARACTER_GROUPS)
    .filter(([key]) => options[key])
    .map(([, characters]) => {
      // Remove confusing characters when the exclusion setting is enabled.
      return excludeAmbiguous
        ? [...characters]
            .filter(
              (character) =>
                !AMBIGUOUS_CHARACTERS.includes(character)
            )
            .join("")
        : characters;
    })
    .filter(Boolean);

  if (groups.length === 0) {
    throw new Error("Select at least one character type.");
  }

  if (length < groups.length) {
    throw new Error(
      `Choose a length of at least ${groups.length} for your selected character types.`
    );
  }

  // Guarantee at least one character from every enabled type.
  const requiredCharacters = groups.map((group) =>
    secureRandomCharacter(group)
  );

  // Fill the remaining positions from the combined character pool.
  const allCharacters = groups.join("");

  const remainingCharacters = Array.from(
    { length: length - requiredCharacters.length },
    () => secureRandomCharacter(allCharacters)
  );

  // Shuffle so the required characters are not predictable by position.
  return secureShuffle([
    ...requiredCharacters,
    ...remainingCharacters,
  ]);
}

// Estimate the strength of an individual generated password.
// This is an approximation, not a formal security audit.
function getIndividualPasswordStrength(password) {
  let poolSize = 0;

  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;

  if (/[^A-Za-z0-9]/.test(password)) {
    poolSize += CHARACTER_GROUPS.symbols.length;
  }

  const entropy =
    poolSize > 0
      ? password.length * Math.log2(poolSize)
      : 0;

  if (entropy >= 100) {
    return {
      label: "Very strong",
      color: "text-emerald-600 dark:text-emerald-400",
      barColor: "bg-emerald-500",
      segments: 4,
    };
  }

  if (entropy >= 75) {
    return {
      label: "Strong",
      color: "text-green-600 dark:text-green-400",
      barColor: "bg-green-500",
      segments: 3,
    };
  }

  if (entropy >= 50) {
    return {
      label: "Moderate",
      color: "text-yellow-600 dark:text-yellow-400",
      barColor: "bg-yellow-500",
      segments: 2,
    };
  }

  return {
    label: "Weak",
    color: "text-red-600 dark:text-red-400",
    barColor: "bg-red-500",
    segments: 1,
  };
}

export default function PasswordGenerator() {
  // --------------------------------------------------
  // 1. Generation settings
  // --------------------------------------------------

  // Single password is the default mode.
  const [generationMode, setGenerationMode] = useState("single");

  // The default password contains 16 characters.
  const [length, setLength] = useState(16);

  // The default bulk quantity is five passwords.
  // A string makes the number input easier to edit.
  const [passwordCount, setPasswordCount] = useState("5");

  // All character types are enabled when the page opens.
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });

  // Whether to exclude visually confusing characters.
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);

  // --------------------------------------------------
  // 2. Generated results and interface feedback
  // --------------------------------------------------

  const [passwords, setPasswords] = useState([]);
  const [visiblePasswords, setVisiblePasswords] = useState(true);
  const [copiedPassword, setCopiedPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const selectedGroupCount = Object.values(options).filter(Boolean).length;

  // --------------------------------------------------
  // 3. Automatically generate passwords
  // --------------------------------------------------

  // Generate a password when the page first opens and whenever
  // a generation setting changes. Manual regeneration is still
  // available in the results panel.
  useEffect(() => {
    const validLength =
      length !== "" &&
      Number.isInteger(Number(length)) &&
      Number(length) >= 4 &&
      Number(length) <= 128;

    const validQuantity =
      generationMode === "single" ||
      (
        passwordCount !== "" &&
        Number.isInteger(Number(passwordCount)) &&
        Number(passwordCount) >= 1 &&
        Number(passwordCount) <= 100
      );

    // Do not display old results while a required field is invalid.
    if (!validLength || !validQuantity) {
      setPasswords([]);
      setError("");
      return;
    }

    try {
      setError("");
      setNotice("");
      setCopiedPassword("");

      const amount =
        generationMode === "single"
          ? 1
          : Number(passwordCount);

      const newPasswords = Array.from(
        { length: amount },
        () =>
          createPassword(
            Number(length),
            options,
            excludeAmbiguous
          )
      );

      setPasswords(newPasswords);
    } catch (err) {
      setPasswords([]);
      setError(
        err.message || "Could not generate passwords."
      );
    }
  }, [
    generationMode,
    length,
    passwordCount,
    options,
    excludeAmbiguous,
  ]);

  // --------------------------------------------------
  // 4. Update character type settings
  // --------------------------------------------------

  function toggleOption(optionName) {
    // Prevent disabling the final enabled character type.
    if (options[optionName] && selectedGroupCount === 1) {
      setError("At least one character type must remain enabled.");
      return;
    }

    setError("");

    setOptions((current) => ({
      ...current,
      [optionName]: !current[optionName],
    }));
  }

  // --------------------------------------------------
  // 5. Manually regenerate passwords
  // --------------------------------------------------

  function handleGenerate() {
    try {
      setError("");
      setNotice("");
      setCopiedPassword("");

      const amount =
        generationMode === "single"
          ? 1
          : Number(passwordCount);

      const newPasswords = Array.from(
        { length: amount },
        () =>
          createPassword(
            Number(length),
            options,
            excludeAmbiguous
          )
      );

      setPasswords(newPasswords);
    } catch (err) {
      setPasswords([]);
      setError(
        err.message || "Could not generate passwords."
      );
    }
  }

  // --------------------------------------------------
  // 6. Copy passwords to the clipboard
  // --------------------------------------------------

  async function copyText(text, identifier = "all") {
    try {
      await navigator.clipboard.writeText(text);

      setCopiedPassword(identifier);
      setNotice("Copied to clipboard!");
      setError("");
    } catch {
      setError(
        "Clipboard access failed. Make sure you are using HTTPS or localhost, then try again."
      );
    }
  }

  // --------------------------------------------------
  // 7. Download generated passwords
  // --------------------------------------------------

  function handleDownload() {
    if (passwords.length === 0) return;

    const fileContent = passwords.join("\n");

    const blob = new Blob([fileContent], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "toolnest-passwords.txt";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  // --------------------------------------------------
  // 8. Shared styling
  // --------------------------------------------------

  const cardClass =
    "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm " +
    "dark:border-gray-800 dark:bg-gray-900";

  const labelClass =
    "text-sm font-medium text-gray-700 dark:text-gray-300";

  const buttonClass =
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 " +
    "text-sm font-semibold transition disabled:cursor-not-allowed " +
    "disabled:opacity-50";

  const numberInputClass =
    "w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 " +
    "text-sm text-gray-900 outline-none focus:border-red-500 " +
    "focus:ring-2 focus:ring-red-500/20 dark:border-gray-700 " +
    "dark:bg-gray-950 dark:text-white";

  return (
    <ToolLayout
      title="Password Generator"
      description="Generate secure random passwords with customizable length and character options."
      category="Utilities"
    >
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Two-column layout: settings on the left, results on the right. */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">

          {/* =========================================
              LEFT COLUMN: CONFIGURATION
          ========================================== */}

          <section className={cardClass}>
            {/* Panel heading */}
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-red-100 p-3 text-red-600 dark:bg-red-950 dark:text-red-400">
                <LockKeyhole size={22} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Customize your password
                </h2>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Change any setting to update your results automatically.
                </p>
              </div>
            </div>

            {/* Generation mode comes FIRST. */}
            <div className="mb-6">
              <h3 className={`${labelClass} mb-3`}>
                Generation mode
              </h3>

              <div
                role="radiogroup"
                aria-label="Password generation mode"
                className="grid grid-cols-2 gap-3"
              >
                {[
                  {
                    value: "single",
                    title: "Single password",
                    detail: "Generate one",
                  },
                  {
                    value: "bulk",
                    title: "Bulk passwords",
                    detail: "Generate multiple",
                  },
                ].map((mode) => {
                  const selected = generationMode === mode.value;

                  return (
                    <button
                      key={mode.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => {
                        setGenerationMode(mode.value);
                        setError("");
                        setNotice("");
                        setCopiedPassword("");
                      }}
                      className={`rounded-xl border p-3 text-left transition ${
                        selected
                          ? "border-red-500 bg-red-50 dark:bg-red-950/30"
                          : "border-gray-200 hover:border-gray-400 dark:border-gray-800"
                      }`}
                    >
                      <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                        {mode.title}
                      </span>

                      <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                        {mode.detail}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bulk quantity appears directly below generation mode. */}
            {generationMode === "bulk" && (
              <div className="mb-6">
                <label
                  htmlFor="password-count"
                  className={`${labelClass} mb-2 block`}
                >
                  Number of passwords
                </label>

                <input
                  id="password-count"
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  value={passwordCount}
                  onChange={(event) => {
                    setPasswordCount(event.target.value);
                  }}
                  onBlur={() => {
                    const value = Number(passwordCount);

                    setPasswordCount(
                      String(
                        passwordCount !== "" &&
                          Number.isFinite(value) &&
                          value >= 1
                          ? Math.min(100, Math.floor(value))
                          : 5
                      )
                    );
                  }}
                  className={numberInputClass}
                />

                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Enter any quantity from 1 to 100.
                </p>
              </div>
            )}

            {/* Password length */}
            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between gap-4">
                <label
                  htmlFor="password-length"
                  className={labelClass}
                >
                  Password length
                </label>

                <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-semibold text-gray-900 dark:bg-gray-800 dark:text-white">
                  {length === "" ? "—" : `${length} characters`}
                </span>
              </div>

              <input
                id="password-length"
                type="range"
                min="4"
                max="128"
                value={length === "" ? 16 : length}
                onChange={(event) =>
                  setLength(Number(event.target.value))
                }
                className="w-full cursor-pointer accent-red-500"
              />

              <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>4 characters</span>
                <span>128 characters</span>
              </div>

              <div className="mt-4">
                <label
                  htmlFor="length-number"
                  className={`${labelClass} mb-2 block`}
                >
                  Or enter a length
                </label>

                <input
                  id="length-number"
                  type="number"
                  min="4"
                  max="128"
                  step="1"
                  value={length}
                  onChange={(event) => {
                    const value = event.target.value;

                    if (value === "") {
                      setLength("");
                      return;
                    }

                    const number = Number(value);

                    if (Number.isFinite(number)) {
                      setLength(
                        Math.min(128, Math.max(4, Math.floor(number)))
                      );
                    }
                  }}
                  onBlur={() => {
                    if (length === "") {
                      setLength(16);
                    }
                  }}
                  className={numberInputClass}
                />
              </div>
            </div>

            {/* Character type toggle switches */}
            <div className="mb-6">
              <h3 className={`${labelClass} mb-3`}>
                Character types
              </h3>

              <div className="space-y-3">
                {[
                  {
                    key: "uppercase",
                    title: "Uppercase",
                    sample: "ABC",
                  },
                  {
                    key: "lowercase",
                    title: "Lowercase",
                    sample: "abc",
                  },
                  {
                    key: "numbers",
                    title: "Numbers",
                    sample: "123",
                  },
                  {
                    key: "symbols",
                    title: "Symbols",
                    sample: "!@#",
                  },
                ].map((item) => {
                  const active = options[item.key];

                  return (
                    <label
                      key={item.key}
                      className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-3 transition hover:border-gray-300 dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700"
                    >
                      <span>
                        <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                          {item.title}
                        </span>

                        <span className="mt-1 block font-mono text-xs text-gray-500 dark:text-gray-400">
                          {item.sample}
                        </span>
                      </span>

                      {/* The input is hidden visually, but remains accessible. */}
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggleOption(item.key)}
                        className="peer sr-only"
                        aria-label={`Include ${item.title.toLowerCase()}`}
                      />

                      {/* Only this switch changes color when enabled. */}
                      <span
                        aria-hidden="true"
                        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-red-500 ${
                          active
                            ? "bg-red-500"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      >
                        <span
                          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                            active ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </span>
                    </label>
                  );
                })}
              </div>

              {selectedGroupCount === 1 && (
                <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                  At least one character type must remain enabled.
                </p>
              )}
            </div>

            {/* Exclude ambiguous characters switch */}
            <div>
              <h3 className={`${labelClass} mb-3`}>
                Character exclusions
              </h3>

              {/* The row remains neutral in both states. */}
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
                <span>
                  <span className="block text-sm font-medium text-gray-900 dark:text-white">
                    Exclude ambiguous characters
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-gray-500 dark:text-gray-400">
                    Avoid confusing characters such as 0, O, 1, l and I.
                  </span>
                </span>

                <input
                  type="checkbox"
                  role="switch"
                  checked={excludeAmbiguous}
                  onChange={(event) =>
                    setExcludeAmbiguous(event.target.checked)
                  }
                  className="peer sr-only"
                  aria-label="Exclude ambiguous characters"
                />

                <span
                  aria-hidden="true"
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-red-500 ${
                    excludeAmbiguous
                      ? "bg-red-500"
                      : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      excludeAmbiguous
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </span>
              </label>
            </div>
          </section>

          {/* =========================================
              RIGHT COLUMN: GENERATED PASSWORDS
          ========================================== */}

          <div className="space-y-6">
            {/* Error messages */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
              >
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0"
                />
                <span>{error}</span>
              </div>
            )}

            {/* Copy/download feedback */}
            {notice && !error && (
              <p
                role="status"
                className="text-sm text-emerald-600 dark:text-emerald-400"
              >
                {notice}
              </p>
            )}

            {/* Generated passwords panel */}
            {passwords.length > 0 ? (
              <section className={cardClass}>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {generationMode === "single"
                        ? "Your generated password"
                        : "Generated passwords"}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {passwords.length} password
                      {passwords.length !== 1 ? "s" : ""} generated
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setVisiblePasswords((current) => !current)
                    }
                    className={`${buttonClass} border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800`}
                  >
                    {visiblePasswords ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}

                    {visiblePasswords ? "Hide" : "Show"}
                  </button>
                </div>

                {/* Single-password strength appears at the top. */}
                {generationMode === "single" && (
                  <div className="mb-5 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                    {(() => {
                      const resultStrength =
                        getIndividualPasswordStrength(passwords[0]);

                      return (
                        <>
                          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                              Password strength
                            </p>

                            <span
                              className={`text-sm font-semibold ${resultStrength.color}`}
                            >
                              {resultStrength.label}
                            </span>
                          </div>

                          <div className="flex gap-1.5" aria-hidden="true">
                            {[1, 2, 3, 4].map((segment) => (
                              <span
                                key={segment}
                                className={`h-1.5 flex-1 rounded-full ${
                                  segment <= resultStrength.segments
                                    ? resultStrength.barColor
                                    : "bg-gray-200 dark:bg-gray-800"
                                }`}
                              />
                            ))}
                          </div>

                          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                            {passwords[0].length} characters long.
                            Strength is an estimate, not a guarantee.
                          </p>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Password list */}
                <div className="space-y-3">
                  {passwords.map((password, index) => {
                    const passwordStrength =
                      getIndividualPasswordStrength(password);

                    return (
                      <div
                        key={`${index}-${password}`}
                        className="flex min-w-0 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950 sm:p-4"
                      >
                        <span className="w-6 shrink-0 text-xs text-gray-400">
                          {index + 1}.
                        </span>

                        <div className="min-w-0 flex-1">
                          <code className="block break-all font-mono text-sm text-gray-900 dark:text-gray-100">
                            {visiblePasswords
                              ? password
                              : "•".repeat(password.length)}
                          </code>

                          {/* Each bulk password displays its own strength. */}
                          {generationMode === "bulk" && (
                            <div className="mt-2">
                              <span
                                className={`text-xs font-medium ${passwordStrength.color}`}
                              >
                                {passwordStrength.label}
                              </span>

                              <div
                                className="mt-1 flex max-w-28 gap-1"
                                aria-hidden="true"
                              >
                                {[1, 2, 3, 4].map((segment) => (
                                  <span
                                    key={segment}
                                    className={`h-1 flex-1 rounded-full ${
                                      segment <= passwordStrength.segments
                                        ? passwordStrength.barColor
                                        : "bg-gray-200 dark:bg-gray-800"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          aria-label={`Copy password ${index + 1}`}
                          title="Copy password"
                          onClick={() =>
                            copyText(password, String(index))
                          }
                          className="shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
                        >
                          {copiedPassword === String(index) ? (
                            <Check
                              size={17}
                              className="text-emerald-500"
                            />
                          ) : (
                            <Copy size={17} />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Result actions: manual regeneration stays here. */}
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    onClick={() => copyText(passwords.join("\n"), "all")}
                    className={`${buttonClass} flex-1 bg-gray-900 text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200`}
                  >
                    {copiedPassword === "all" ? (
                      <Check size={17} />
                    ) : (
                      <Copy size={17} />
                    )}

                    Copy {generationMode === "single" ? "Password" : "All"}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className={`${buttonClass} flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800`}
                  >
                    <Download size={17} />
                    Download .txt
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerate}
                    className={`${buttonClass} flex-1 border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40`}
                  >
                    <RefreshCw size={17} />

                    {generationMode === "single"
                      ? "Generate"
                      : "Generate"}
                  </button>
                </div>
              </section>
            ) : (
              /* Placeholder while a field is temporarily invalid. */
              <section className={`${cardClass} flex min-h-64 flex-col items-center justify-center text-center`}>
                <div className="mb-4 rounded-2xl bg-gray-100 p-4 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  <LockKeyhole size={28} />
                </div>

                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Your passwords will appear here
                </h2>

                <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500 dark:text-gray-400">
                  Choose valid settings on the left. ToolNest will generate
                  your passwords automatically.
                </p>
              </section>
            )}
          </div>
        </div>

        {/* Privacy reminder spans the width below both columns. */}
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
          <ShieldCheck
            size={20}
            className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
          />

          <p className="text-sm leading-6 text-emerald-800 dark:text-emerald-300">
            <strong>Private by design.</strong> Passwords are generated locally
            in your browser. ToolNest does not send them to a
            password-generation server. For important accounts, use a reputable
            password manager and avoid reusing passwords.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}