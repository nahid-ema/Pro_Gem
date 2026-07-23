/**
 * Normalizes text for search comparison:
 * - Converts to lowercase
 * - Converts Bengali numerals (০-৯) to English numerals (0-9)
 * - Trims whitespace
 */
export function normalizeSearchText(val: string | number | null | undefined): string {
  if (val === undefined || val === null) return '';
  const str = String(val).toLowerCase();
  const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  let res = '';
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const idx = bnNums.indexOf(char);
    if (idx !== -1) {
      res += idx;
    } else {
      res += char;
    }
  }
  return res.trim();
}

/**
 * Checks if target fields match the query string.
 * Supports searching across multiple string/number fields with dual-numeral support (Bengali/English).
 */
export function matchesQuery(query: string, fields: (string | number | null | undefined)[]): boolean {
  const normQuery = normalizeSearchText(query);
  if (!normQuery) return true;

  return fields.some((field) => {
    if (field === undefined || field === null) return false;
    const normField = normalizeSearchText(field);
    return normField.includes(normQuery);
  });
}
