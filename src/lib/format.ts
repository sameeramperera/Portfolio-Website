const monthYear = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' });
const fullDate = new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

/** "2023-03" → "Mar 2023" */
export const formatMonth = (ym: string) => monthYear.format(new Date(`${ym}-01T00:00:00Z`));

/** "2023-03" → "Mar 2023", "2023" → "2023" */
export const formatPeriod = (d: string) => (d.length === 4 ? d : formatMonth(d));

/** ISO → "20 Sep 2026" */
export const formatDate = (iso: string) => fullDate.format(new Date(iso));
