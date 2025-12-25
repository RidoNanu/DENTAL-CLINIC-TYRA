// Test the formatTime12 function with boundary cases
const formatTime12 = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const d = new Date();
    d.setHours(parseInt(hours), parseInt(minutes));
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

// Test cases
console.log("Testing formatTime12 boundary cases:");
console.log("─────────────────────────────────────────");
console.log("00:00:00 →", formatTime12("00:00:00"), "(Expected: 12:00 AM)");
console.log("00:30:00 →", formatTime12("00:30:00"), "(Expected: 12:30 AM)");
console.log("11:59:00 →", formatTime12("11:59:00"), "(Expected: 11:59 AM)");
console.log("12:00:00 →", formatTime12("12:00:00"), "(Expected: 12:00 PM)");
console.log("12:30:00 →", formatTime12("12:30:00"), "(Expected: 12:30 PM)");
console.log("13:00:00 →", formatTime12("13:00:00"), "(Expected: 1:00 PM)");
console.log("23:59:00 →", formatTime12("23:59:00"), "(Expected: 11:59 PM)");
