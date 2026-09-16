export function formatShortDate(dateStr: string | undefined, language: 'en' | 'bn'): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  const date = new Date(year, month, day);
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  
  // Example outputs: "Sep 16" (en), "১৬ সেপ্টে" (bn)
  return date.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', options);
}
