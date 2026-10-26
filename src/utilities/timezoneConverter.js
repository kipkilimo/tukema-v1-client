export const timezoneConverter = function (unixTimestamp) {
    // Create a Date object from the Unix timestamp
    const date = new Date(unixTimestamp);

    // Convert to EAT (offset is +3 hours)
    date.setHours(date.getHours() + 3);

    // Format the date (e.g., "Tue Apr 30 2024 17:47:50 GMT+0300 (East Africa Time)")
    const formattedDate = date.toLocaleString('en-GB', {
        timeZone: 'Africa/Nairobi',
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    return formattedDate;
};

// Default export the timezoneConverter function directly
export default timezoneConverter;

