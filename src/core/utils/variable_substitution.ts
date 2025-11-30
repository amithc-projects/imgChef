import { TransformationContext } from '../types';

/**
 * Formats a date object according to a format string.
 * Supported tokens: YYYY, YY, MM, DD, HH, mm, ss
 */
const formatDate = (date: Date, format: string): string => {
    const pad = (n: number) => n.toString().padStart(2, '0');

    const map: Record<string, string> = {
        'YYYY': date.getFullYear().toString(),
        'YY': date.getFullYear().toString().slice(-2),
        'MM': pad(date.getMonth() + 1),
        'DD': pad(date.getDate()),
        'HH': pad(date.getHours()),
        'mm': pad(date.getMinutes()),
        'ss': pad(date.getSeconds())
    };

    return format.replace(/YYYY|YY|MM|DD|HH|mm|ss/g, matched => map[matched]);
};

/**
 * Parses standard EXIF date string "YYYY:MM:DD HH:MM:SS"
 */
const parseExifDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    // Try standard EXIF format: "YYYY:MM:DD HH:MM:SS"
    const parts = dateStr.split(/[:\s]/);
    if (parts.length >= 6) {
        return new Date(
            parseInt(parts[0]),
            parseInt(parts[1]) - 1,
            parseInt(parts[2]),
            parseInt(parts[3]),
            parseInt(parts[4]),
            parseInt(parts[5])
        );
    }
    // Try standard JS Date parsing
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;

    return null;
};

/**
 * Resolves variables in a text string using the transformation context.
 * Syntax:
 * - {{key}} : Simple replacement
 * - {{key::UpperCase}} : Case modification
 * - {{key:dateTime::Format}} : Date formatting
 */
export const resolveVariables = (text: string, context: TransformationContext): string => {
    if (!text) return '';

    // Regex to match {{key...}}
    // Captures: 
    // 1. Key
    // 2. Optional: :Type (e.g. :dateTime)
    // 3. Optional: ::Format (e.g. ::YYYY-MM-DD or ::UpperCase)
    const regex = /{{([\w\s\-_]+)(?::(\w+))?(?:::(.+?))?}}/g;

    return text.replace(regex, (match, key, type, format) => {
        // 1. Resolve Value
        let value: any = '';

        if (key === 'filename') {
            value = context.filename;
        } else if (context.metadata && context.metadata[key] !== undefined) {
            value = context.metadata[key];
        } else {
            // Key not found, return original match or empty?
            // Usually better to return empty or keep match if debugging.
            // Let's return match to indicate missing var, or empty string?
            // User request implies "work in all places", so let's try to be graceful.
            return match;
        }

        // 2. Handle Types & Formatting
        if (type === 'dateTime') {
            const date = parseExifDate(String(value));
            if (date && format) {
                return formatDate(date, format);
            }
            return String(value); // Fallback if parse fails
        }

        // 3. Handle Simple Formatting (Case)
        // If type is missing but format is present (e.g. {{city::UpperCase}})
        // The regex might capture 'UpperCase' as 'format' if we are careful, or 'type' if we are not.
        // Our regex `(?::(\w+))?` captures type. `(?:::(.+?))?` captures format.
        // {{city::UpperCase}} -> key="city", type=undefined, format="UpperCase" (because of ::)

        if (format) {
            const strVal = String(value);
            switch (format.toLowerCase()) {
                case 'uppercase': return strVal.toUpperCase();
                case 'lowercase': return strVal.toLowerCase();
                case 'titlecase': return strVal.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
                default: return strVal;
            }
        }

        return String(value);
    });
};
