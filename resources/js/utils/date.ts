import dayjs from 'dayjs'
import { parseDate, type DateValue } from '@internationalized/date'

/**
 * Normalizes various date string formats (including full ISO strings) into a CalendarDate (DateValue).
 * Returns null if the value is falsy or cannot be parsed to a valid calendar date.
 */
export function normalizeToCalendarDate(value?: string | null): DateValue | null {
    if (!value) {
        return null
    }

    // Fast path: already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        try {
            return parseDate(value)
        } catch {
            // fallthrough to broader parsing below
        }
    }

    // Try to parse using dayjs from ISO / other formats, then reformat to YYYY-MM-DD
    const d = dayjs(value)
    if (!d.isValid()) {
        return null
    }
    const formatted = d.format('YYYY-MM-DD')
    try {
        return parseDate(formatted)
    } catch {
        return null
    }
}
