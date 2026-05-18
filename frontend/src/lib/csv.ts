/**
 * Small RFC-4180-ish CSV parser. Handles quoted fields, escaped quotes (`""`),
 * commas inside quotes, CRLF/LF line endings, and trailing whitespace lines.
 * Header row is required — output is an array of objects keyed by header.
 *
 * Why we wrote this instead of pulling in PapaParse: the import flow is the
 * only place we need CSV. ~80 LOC beats a 12 KB dep in our bundle.
 */

export interface CsvParseResult {
  headers: string[];
  /** Each row keyed by header. Missing cells are empty strings (`""`), never `undefined`. */
  rows: Array<Record<string, string>>;
  /** Parse-time errors (malformed file). Per-row business validation lives elsewhere. */
  errors: string[];
}

export function parseCsv(text: string): CsvParseResult {
  const errors: string[] = [];
  const lines = splitCsvIntoLogicalLines(text);
  if (lines.length === 0) {
    return { headers: [], rows: [], errors: ['File is empty.'] };
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  if (headers.length === 0 || headers.every((h) => h === '')) {
    return { headers: [], rows: [], errors: ['Header row is empty.'] };
  }
  const dupHeaders = findDuplicates(headers);
  if (dupHeaders.length > 0) {
    errors.push(`Duplicate header columns: ${dupHeaders.join(', ')}`);
  }

  const rows: Array<Record<string, string>> = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === '') continue; // skip blank lines
    const cells = parseCsvLine(line);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = (cells[j] ?? '').trim();
    }
    rows.push(row);
  }

  return { headers, rows, errors };
}

/**
 * Splits the file into logical CSV lines (a logical line can span multiple
 * physical lines if a quoted field contains a newline).
 */
function splitCsvIntoLogicalLines(text: string): string[] {
  const out: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      // Check for escaped quote
      if (inQuotes && text[i + 1] === '"') {
        current += '""';
        i++;
        continue;
      }
      inQuotes = !inQuotes;
      current += ch;
      continue;
    }
    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      // CRLF: skip the LF after CR
      if (ch === '\r' && text[i + 1] === '\n') i++;
      out.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  if (current.length > 0) out.push(current);
  return out;
}

/** Parses a single logical CSV line into cell strings. */
function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
        continue;
      }
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === ',' && !inQuotes) {
      cells.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  cells.push(current);
  return cells;
}

function findDuplicates<T>(arr: T[]): T[] {
  const seen = new Set<T>();
  const dups = new Set<T>();
  for (const x of arr) {
    if (seen.has(x)) dups.add(x);
    seen.add(x);
  }
  return [...dups];
}

/** Convert a row of strings into a CSV-safe string. */
function csvEscapeCell(value: string): string {
  // Wrap in quotes if it contains comma, quote, newline, or leading/trailing whitespace
  if (/[",\n\r]/.test(value) || value !== value.trim()) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toCsv(headers: string[], rows: Array<Record<string, string>>): string {
  const headerLine = headers.map(csvEscapeCell).join(',');
  const bodyLines = rows.map((row) => headers.map((h) => csvEscapeCell(row[h] ?? '')).join(','));
  return [headerLine, ...bodyLines].join('\n');
}
