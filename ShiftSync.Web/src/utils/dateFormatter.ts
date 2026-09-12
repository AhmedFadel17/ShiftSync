/**
 * Formats a given date string into a standard format or a "time ago" format.
 * @param dateInput - The date to format (string, number, or Date object)
 * @param format - 'standard' for absolute date (e.g. Apr 28, 2026), 'ago' for relative time (e.g. 5 hours ago)
 * @returns Formatted date string
 */
export function formatDate(dateInput: string | number | Date | undefined | null, format: 'standard' | 'ago' = 'standard'): string {
    if (!dateInput) return '';

    const date = new Date(dateInput);
    
    // Check if valid date
    if (isNaN(date.getTime())) return String(dateInput);

    if (format === 'ago') {
        return formatTimeAgo(date);
    }

    // Standard format (e.g., Apr 28, 2026)
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date);
}

function formatTimeAgo(date: Date): string {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Future dates
    if (seconds < 0) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(date);
    }

    let interval = Math.floor(seconds / 31536000); // Years
    if (interval >= 1) return interval + (interval === 1 ? ' year ago' : ' years ago');

    interval = Math.floor(seconds / 2592000); // Months
    if (interval >= 1) return interval + (interval === 1 ? ' month ago' : ' months ago');

    interval = Math.floor(seconds / 86400); // Days
    if (interval >= 2) return interval + ' days ago';
    if (interval === 1) return 'yesterday';

    interval = Math.floor(seconds / 3600); // Hours
    if (interval >= 1) return interval + (interval === 1 ? ' hour ago' : ' hours ago');

    interval = Math.floor(seconds / 60); // Minutes
    if (interval >= 1) return interval + (interval === 1 ? ' minute ago' : ' minutes ago');

    return Math.floor(seconds) < 30 ? 'just now' : Math.floor(seconds) + ' seconds ago';
}
