import { useState } from "react";
import {
  Copy,
  Download,
  RefreshCw,
  Check,
  Database,
  FileJson,
  FileSpreadsheet,
} from "lucide-react";
import ToolLayout from "../../components/ToolLayout";

// Every field has a label and a function that generates a fake value.
const FIELD_OPTIONS = [
  { id: "id", label: "ID", generate: (_, index) => index + 1 },
  {
    id: "uuid",
    label: "UUID",
    generate: () => crypto.randomUUID(),
  },
  {
    id: "fullName",
    label: "Full Name",
    generate: (random) =>
      `${pick(random, FIRST_NAMES)} ${pick(random, LAST_NAMES)}`,
  },
  {
    id: "firstName",
    label: "First Name",
    generate: (random) => pick(random, FIRST_NAMES),
  },
  {
    id: "lastName",
    label: "Last Name",
    generate: (random) => pick(random, LAST_NAMES),
  },
  {
    id: "email",
    label: "Email",
    generate: (random) => {
      const first = pick(random, FIRST_NAMES).toLowerCase();
      const last = pick(random, LAST_NAMES).toLowerCase();
      return `${first}.${last}${randomInt(random, 1, 99)}@example.com`;
    },
  },
  {
    id: "username",
    label: "Username",
    generate: (random) =>
      `${pick(random, FIRST_NAMES).toLowerCase()}${randomInt(random, 10, 999)}`,
  },

  {
    id: "phone",
    label: "Phone",
    generate: (random) => {
      // Generate a Cameroon-style mobile number using +237.
      // The number is synthetic and may not be unassigned in reality.
      const prefix = pick(random, ["6", "6", "6", "2"]);
      const remainingDigits = Array.from({ length: 8 }, () =>
        randomInt(random, 0, 9),
      ).join("");

      return `+237 ${prefix}${remainingDigits}`;
    },
  },
  {
    id: "age",
    label: "Age",
    generate: (random) => randomInt(random, 18, 75),
  },
  {
    id: "gender",
    label: "Gender",
    generate: (random) => pick(random, ["Male", "Female", "Non-binary"]),
  },
  {
    id: "company",
    label: "Company",
    generate: (random) =>
      `${pick(random, COMPANY_WORDS)} ${pick(random, COMPANY_TYPES)}`,
  },
  {
    id: "jobTitle",
    label: "Job Title",
    generate: (random) => pick(random, JOB_TITLES),
  },
  {
    id: "city",
    label: "City",
    generate: (random) => pick(random, CITIES),
  },
  {
    id: "country",
    label: "Country",
    generate: (random) => pick(random, COUNTRIES),
  },
  {
    id: "address",
    label: "Street Address",
    generate: (random) =>
      `${randomInt(random, 10, 999)} ${pick(random, STREET_NAMES)}`,
  },
  {
    id: "postalCode",
    label: "Postal Code",
    generate: (random) => `${randomInt(random, 10000, 99999)}`,
  },
  {
    id: "website",
    label: "Website",
    generate: (random) => `https://www.${pick(random, WEBSITE_NAMES)}.example`,
  },
  {
    id: "date",
    label: "Date",
    generate: (random) => {
      const start = new Date("2020-01-01").getTime();
      const end = new Date("2026-12-31").getTime();

      return new Date(randomInt(random, start, end)).toISOString().slice(0, 10);
    },
  },
];

// Sample value pools. These are fictional test values, not real user records.

const FIRST_NAMES = [
  "Anselme",
  "Brenda",
  "Achille",
  "Carine",
  "Emmanuel",
  "Mireille",
  "Junior",
  "Esther",
  "Fabrice",
  "Grace",
  "Arnaud",
  "Sandrine",
  "Yvan",
  "Prisca",
  "Patrick",
  "Nadine",
  "Cedric",
  "Ruth",
  "Christian",
  "Ariane",
  "Kevin",
  "Diane",
  "Serge",
  "Faith",
  "Marcel",
  "Chantal",
  "Boris",
  "Stephanie",
  "Joel",
  "Gloria",
];

const LAST_NAMES = [
  "Tchoumi",
  "Ngongang",
  "Fomukong",
  "Tambe",
  "Nfor",
  "Nchotu",
  "Mbah",
  "Talla",
  "Munyenge",
  "Atangana",
  "Nana",
  "Fotso",
  "Mbappe",
  "Ewumbue",
  "Nkeng",
  "Tita",
  "Neba",
  "Biya",
  "Kamdem",
  "Nsom",
  "Molina",
  "Abanda",
  "Mballa",
  "Eto'o",
  "Ndongo",
];

const COMPANY_WORDS = [
  "Mboa",
  "Green",
  "Mount Cameroon",
  "Bamenda",
  "Central",
  "Atlantic",
  "Unity",
  "New Dawn",
  "Savannah",
  "Great Lakes",
];

const COMPANY_TYPES = [
  "Technologies",
  "Solutions",
  "Enterprise",
  "Group",
  "Trading",
  "Services",
  "Digital",
  "Consulting",
  "Industries",
  "Logistics",
];

const JOB_TITLES = [
  "Software Developer",
  "Web Developer",
  "IT Technician",
  "Accountant",
  "Teacher",
  "Business Manager",
  "Data Analyst",
  "Graphic Designer",
  "Civil Engineer",
  "Nurse",
  "Marketing Officer",
  "Customer Service Officer",
  "Project Coordinator",
  "Network Administrator",
  "Entrepreneur",
  "Administrative Assistant",
];

const CITIES = [
  "Bamenda",
  "Douala",
  "Yaounde",
  "Buea",
  "Limbe",
  "Bafoussam",
  "Garoua",
  "Maroua",
  "Kumba",
  "Kribi",
  "Bertoua",
  "Ebolowa",
  "Ngaoundere",
  "Dschang",
  "Foumban",
  "Kumbo",
  "Mamfe",
  "Tiko",
  "Nkongsamba",
];

const COUNTRIES = ["Cameroon"];

const STREET_NAMES = [
  "Commercial Avenue",
  "Mankon Street",
  "Mile 2 Road",
  "Molyko Street",
  "Bonanjo Avenue",
  "Nkwen Road",
  "Up Station Road",
  "Bambili Road",
  "Akwa Street",
  "New Layout Road",
  "Mile 4 Road",
  "Bastos Avenue",
];

const WEBSITE_NAMES = [
  "mboatech",
  "camdev",
  "greenmboa",
  "bamendadigital",
  "africode",
  "newdawncm",
  "samplebusiness",
];

// Select one item from an array using the supplied random function.
function pick(random, items) {
  return items[Math.floor(random() * items.length)];
}

// Generate an integer between min and max, inclusive.
function randomInt(random, min, max) {
  return Math.floor(random() * (max - min + 1)) + min;
}

// Create one fake record for each requested row.
function generateRecords(selectedFields, count) {
  return Array.from({ length: count }, (_, index) => {
    const record = {};

    selectedFields.forEach((field) => {
      record[field.id] = field.generate(Math.random, index);
    });

    return record;
  });
}

// Escape CSV cells so commas, quotes, and line breaks remain valid.
function escapeCsv(value) {
  const text = String(value ?? "");

  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

export default function FakeDataGenerator() {
  const defaultFields = [
    "fullName",
    "email",
    "phone",
    "company",
    "jobTitle",
    "city",
  ];

  const [selectedIds, setSelectedIds] = useState(defaultFields);
  const [recordCount, setRecordCount] = useState(10);
  const [records, setRecords] = useState(() =>
    generateRecords(
      FIELD_OPTIONS.filter((field) => defaultFields.includes(field.id)),
      10,
    ),
  );
  const [copied, setCopied] = useState("");
  const [notice, setNotice] = useState("");

  const selectedFields = FIELD_OPTIONS.filter((field) =>
    selectedIds.includes(field.id),
  );

  // Toggle a field on or off without changing the others.
  function toggleField(id) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );

    setNotice("");
  }

  // Generate a new dataset using the current settings.
  function handleGenerate() {
    if (selectedIds.length === 0) {
      setNotice("Select at least one field before generating data.");
      return;
    }

    const fields = FIELD_OPTIONS.filter((field) =>
      selectedIds.includes(field.id),
    );

    setRecords(generateRecords(fields, recordCount));
    setCopied("");
    setNotice(`${recordCount} sample records generated.`);
  }

  // Convert the current records into JSON or CSV.
  function getExportData(format) {
    if (format === "json") {
      return JSON.stringify(records, null, 2);
    }

    const headers = selectedFields.map((field) => field.label);

    const rows = records.map((record) =>
      selectedFields.map((field) => escapeCsv(record[field.id])),
    );

    return [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");
  }

  // Copy generated data to the clipboard.
  async function handleCopy(format) {
    try {
      await navigator.clipboard.writeText(getExportData(format));
      setCopied(format);
      setNotice(`${format.toUpperCase()} copied to clipboard.`);

      setTimeout(() => setCopied(""), 1800);
    } catch {
      setNotice("Copy failed. Check your browser clipboard permissions.");
    }
  }

  // Download the generated dataset as a file.
  function handleDownload(format) {
    const content = getExportData(format);
    const mimeType = format === "json" ? "application/json" : "text/csv";

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `toolnest-fake-data.${format}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <ToolLayout
      title="Fake Data Generator"
      description="Generate realistic sample records for testing, development, and prototypes."
      category="Developer Tools"
    >
      <div className="space-y-5">
        {/* Configuration and preview sit side by side on desktop. */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
          {/* LEFT: Generator settings */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-[#1e1e1e]">
            <div className="mb-4 flex items-center gap-2">
              <Database size={19} className="text-blue-500" />
              <h2 className="font-semibold">Configure data</h2>
            </div>

            <label
              htmlFor="recordCount"
              className="mb-2 block text-sm font-medium"
            >
              Number of records
            </label>

            <input
              id="recordCount"
              type="number"
              min="1"
              max="500"
              value={recordCount}
              onChange={(event) => {
                const value = Number(event.target.value);

                if (value >= 1 && value <= 500) {
                  setRecordCount(value);
                } else if (event.target.value === "") {
                  setRecordCount("");
                }
              }}
              onBlur={() => {
                if (!recordCount || recordCount < 1) setRecordCount(1);
                if (recordCount > 500) setRecordCount(500);
              }}
              className="mb-5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-[#121212]"
            />

            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">Fields to include</h3>

              <button
                type="button"
                onClick={() =>
                  setSelectedIds(FIELD_OPTIONS.map((field) => field.id))
                }
                className="text-xs text-blue-500 hover:underline"
              >
                Select all
              </button>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              {FIELD_OPTIONS.map((field) => (
                <label
                  key={field.id}
                  className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(field.id)}
                    onChange={() => toggleField(field.id)}
                    className="accent-blue-500"
                  />
                  <span>{field.label}</span>
                </label>
              ))}
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={!recordCount || selectedIds.length === 0}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw size={17} />
              Generate data
            </button>

            {notice && (
              <p
                role="status"
                className="mt-3 text-sm text-gray-600 dark:text-gray-300"
              >
                {notice}
              </p>
            )}

            <p className="mt-4 text-xs leading-relaxed text-gray-500">
              Sample data is generated locally in your browser. Email addresses
              use the reserved example.com domain.
            </p>
          </section>

          {/* RIGHT: Preview and export controls */}
          <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-[#1e1e1e]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">Data preview</h2>
                <p className="mt-1 text-xs text-gray-500">
                  {records.length} records · {selectedFields.length} fields
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy("json")}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  {copied === "json" ? <Check size={15} /> : <Copy size={15} />}
                  JSON
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload("json")}
                  className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  title="Download JSON"
                  aria-label="Download JSON"
                >
                  <Download size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy("csv")}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  {copied === "csv" ? <Check size={15} /> : <Copy size={15} />}
                  CSV
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload("csv")}
                  className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  title="Download CSV"
                  aria-label="Download CSV"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>

            {selectedFields.length === 0 ? (
              <div className="flex min-h-48 items-center justify-center rounded-xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 dark:border-gray-700">
                Select at least one field, then generate your data.
              </div>
            ) : (
              <div className="max-h-[520px] overflow-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="sticky top-0 bg-gray-50 dark:bg-[#252525]">
                    <tr>
                      {selectedFields.map((field) => (
                        <th
                          key={field.id}
                          className="whitespace-nowrap border-b border-gray-200 px-3 py-3 font-semibold dark:border-gray-700"
                        >
                          {field.label}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {records.map((record, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                      >
                        {selectedFields.map((field) => (
                          <td
                            key={field.id}
                            className="whitespace-nowrap px-3 py-3 text-gray-600 dark:text-gray-300"
                          >
                            {record[field.id]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
              <span>Previewing {records.length} generated records</span>
              <span className="flex items-center gap-1">
                <FileJson size={14} />
                JSON
                <span className="mx-1">·</span>
                <FileSpreadsheet size={14} />
                CSV
              </span>
            </div>
          </section>
        </div>
      </div>
    </ToolLayout>
  );
}
