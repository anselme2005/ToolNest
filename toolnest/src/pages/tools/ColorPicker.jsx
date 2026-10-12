import { useState } from "react";
import { Copy, Check, Pipette, RotateCcw, Palette } from "lucide-react";
import ToolLayout from "../../components/ToolLayout";

// Convert a HEX color to RGB.
function hexToRgb(hex) {
  const normalized = hex.replace("#", "");

  const fullHex =
    normalized.length === 3
      ? normalized
          .split("")
          .map((character) => character + character)
          .join("")
      : normalized;

  const value = Number.parseInt(fullHex, 16);

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

// Convert RGB values to HSL.
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const difference = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (difference !== 0) {
    s = difference / (1 - Math.abs(2 * l - 1));

    switch (max) {
      case r:
        h = ((g - b) / difference) % 6;
        break;
      case g:
        h = (b - r) / difference + 2;
        break;
      default:
        h = (r - g) / difference + 4;
    }

    h *= 60;

    if (h < 0) h += 360;
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Ensure HEX values always use the six-digit format.
function normalizeHex(hex) {
  let value = hex.replace("#", "");

  if (value.length === 3) {
    value = value
      .split("")
      .map((character) => character + character)
      .join("");
  }

  return `#${value.toUpperCase()}`;
}

// Common colors for quick selection.
const PRESET_COLORS = [
  "#EF4444",
  "#F97316",
  "#F59E0B",
  "#EAB308",
  "#84CC16",
  "#22C55E",
  "#10B981",
  "#14B8A6",
  "#06B6D4",
  "#0EA5E9",
  "#3B82F6",
  "#6366F1",
  "#8B5CF6",
  "#A855F7",
  "#D946EF",
  "#EC4899",
  "#F43F5E",
  "#64748B",
  "#6B7280",
  "#111827",
  "#FFFFFF",
  "#E5E7EB",
  "#9CA3AF",
  "#000000",
];

export default function ColorPicker() {
  // Selected color is stored as a six-digit HEX value.
  const [color, setColor] = useState("#3B82F6");

  // Keep the input editable while the user types.
  const [hexInput, setHexInput] = useState("#3B82F6");

  // Track recently selected colors for quick reuse.
  const [recentColors, setRecentColors] = useState([]);

  // Track which value was copied to provide feedback.
  const [copiedValue, setCopiedValue] = useState("");

  const [error, setError] = useState("");

  // Derive RGB and HSL values from the selected color.
  const { r, g, b } = hexToRgb(color);
  const { h, s, l } = rgbToHsl(r, g, b);

  const rgbValue = `rgb(${r}, ${g}, ${b})`;
  const hslValue = `hsl(${h}, ${s}%, ${l}%)`;

  // Apply a color and update the recent-color history.
  function applyColor(value) {
    const normalized = normalizeHex(value);

    setColor(normalized);
    setHexInput(normalized);
    setError("");
    setCopiedValue("");

    setRecentColors((current) =>
      [normalized, ...current.filter((item) => item !== normalized)].slice(
        0,
        8,
      ),
    );
  }

  // Update the HEX input while typing.
  // Only a full 6-digit code is applied live. Applying 3-digit shorthand
  // here would rewrite "#3b8" to "#33BB88" and interrupt the user mid-typing.
  // Shorthand is applied when the field loses focus or Enter is pressed
  // (see handleHexBlur below).
  function handleHexChange(value) {
    setHexInput(value);

    const trimmed = value.trim();

    if (/^#?[0-9a-fA-F]{6}$/.test(trimmed)) {
      applyColor(trimmed);
      setHexInput(normalizeHex(trimmed));
    } else {
      setError("");
    }
  }

  // Restore the last valid color if the input is invalid on blur.
  function handleHexBlur() {
    const normalized = hexInput.trim();

    if (/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(normalized)) {
      applyColor(normalized);
    } else {
      setHexInput(color);
      setError("Enter a valid 3-digit or 6-digit HEX color.");
    }
  }

  // Copy a color value to the clipboard.
  async function copyValue(value, identifier) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(identifier);
      setError("");

      // Brief feedback resets on the next interaction.
    } catch {
      setError(
        "Could not copy the color. Check your browser's clipboard permissions.",
      );
    }
  }

  // Shared styling for input fields.
  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 " +
    "text-sm text-gray-900 outline-none transition focus:border-blue-500 " +
    "focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 " +
    "dark:bg-gray-950 dark:text-white";

  const cardClass =
    "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm " +
    "dark:border-gray-800 dark:bg-gray-900";

  const labelClass =
    "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <ToolLayout
      title="Color Picker"
      description="Pick colors, explore HEX, RGB and HSL values, and copy color codes for your projects."
      category="Design"
      icon={Palette}
    >
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Main workspace: picker and color information sit side by side. */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          {/* LEFT COLUMN: COLOR PICKER */}
          <section className={cardClass}>
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                <Pipette size={22} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Choose a color
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Pick a color or enter a HEX code.
                </p>
              </div>
            </div>

            {/* Large live color preview. */}
            <div
              className="mb-5 h-44 rounded-2xl border border-black/10 transition-colors sm:h-52"
              style={{ backgroundColor: color }}
              aria-label={`Selected color ${color}`}
              role="img"
            />

            {/* Native color picker and HEX input. */}
            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-[auto_1fr]">
              <div>
                <label htmlFor="native-color" className={labelClass}>
                  Color picker
                </label>

                <input
                  id="native-color"
                  type="color"
                  value={color}
                  onChange={(event) => applyColor(event.target.value)}
                  className="h-12 w-full cursor-pointer rounded-xl border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-950 sm:w-20"
                  aria-label="Choose a color visually"
                />
              </div>

              <div>
                <label htmlFor="hex-input" className={labelClass}>
                  HEX color
                </label>

                <input
                  id="hex-input"
                  type="text"
                  value={hexInput}
                  onChange={(event) => handleHexChange(event.target.value)}
                  onBlur={handleHexBlur}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleHexBlur();
                      event.currentTarget.blur();
                    }
                  }}
                  placeholder="#3B82F6"
                  maxLength={7}
                  spellCheck={false}
                  className={`${inputClass} font-mono uppercase`}
                />
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="mb-4 text-sm text-red-600 dark:text-red-400"
              >
                {error}
              </p>
            )}

            {/* Preset color palette. */}
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Preset colors
                </h3>

                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {PRESET_COLORS.length} colors
                </span>
              </div>

              <div className="grid grid-cols-8 gap-2 sm:grid-cols-12">
                {PRESET_COLORS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    title={preset}
                    aria-label={`Select ${preset}`}
                    aria-pressed={color === preset}
                    onClick={() => applyColor(preset)}
                    className={`aspect-square rounded-lg border transition hover:scale-105 ${
                      color === preset
                        ? "border-blue-500 ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900"
                        : "border-black/10 dark:border-white/10"
                    }`}
                    style={{ backgroundColor: preset }}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN: COLOR VALUES AND HISTORY */}
          <div className="space-y-6">
            {/* Color format values. */}
            <section className={cardClass}>
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-purple-100 p-3 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                  <Palette size={22} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Color values
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Copy a format for CSS or design work.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: "HEX", value: color, id: "hex" },
                  { label: "RGB", value: rgbValue, id: "rgb" },
                  { label: "HSL", value: hslValue, id: "hsl" },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="flex min-w-0 items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-950"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        {item.label}
                      </p>

                      <code className="block break-all font-mono text-sm text-gray-900 dark:text-gray-100">
                        {item.value}
                      </code>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyValue(item.value, item.id)}
                      title={`Copy ${item.label}`}
                      aria-label={`Copy ${item.label} value`}
                      className="shrink-0 rounded-lg p-2 text-gray-500 transition hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white"
                    >
                      {copiedValue === item.id ? (
                        <Check size={17} className="text-emerald-500" />
                      ) : (
                        <Copy size={17} />
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  copyValue(
                    `HEX: ${color}\nRGB: ${rgbValue}\nHSL: ${hslValue}`,
                    "all",
                  )
                }
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
              >
                {copiedValue === "all" ? (
                  <Check size={17} />
                ) : (
                  <Copy size={17} />
                )}
                Copy all formats
              </button>

              {copiedValue && (
                <p
                  role="status"
                  className="mt-3 text-center text-xs text-emerald-600 dark:text-emerald-400"
                >
                  Copied successfully.
                </p>
              )}
            </section>

            {/* Recent colors from this page session. */}
            <section className={cardClass}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    Recent colors
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Your recently selected colors.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setRecentColors([])}
                  disabled={recentColors.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  <RotateCcw size={14} />
                  Clear
                </button>
              </div>

              {recentColors.length > 0 ? (
                <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
                  {recentColors.map((recent) => (
                    <button
                      key={recent}
                      type="button"
                      onClick={() => applyColor(recent)}
                      title={`Use ${recent}`}
                      aria-label={`Use recent color ${recent}`}
                      className="group min-w-0"
                    >
                      <span
                        className="mb-1.5 block aspect-square rounded-xl border border-black/10 transition group-hover:scale-105 dark:border-white/10"
                        style={{ backgroundColor: recent }}
                      />

                      <span className="block truncate text-center text-[10px] text-gray-500 dark:text-gray-400">
                        {recent}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-300 px-4 py-6 text-center dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Pick a color to start building your recent-color list.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Compact information footer. */}
        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
          Colors update instantly. Recent colors are kept in page memory and are
          cleared when the page is refreshed.
        </p>
      </div>
    </ToolLayout>
  );
}
