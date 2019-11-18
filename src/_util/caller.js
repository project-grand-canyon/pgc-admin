const WAIT_FOR_CALL_AFTER_NOTIFICATION_DAYS = 5; 

const callerStatus = (caller) => {
    if (caller.paused) {
        return "PAUSED";
    }
    if (caller.lastReminderTimestamp == null) {
        return "BRAND_NEW";
    }
    if (caller.lastCallTimestamp > caller.lastReminderTimestamp) {
        return "CURRENT";
    }

    const now = new Date();
    const daysSinceLastNotification = dayDiff(refDate(caller), now)

    if (daysSinceLastNotification <= WAIT_FOR_CALL_AFTER_NOTIFICATION_DAYS) {
        return "WAITING"
    }

    return "LAPSED"
}

function refDate(caller) {
    const created = caller.created;
    const createdDate = created.getUTCDate();
    if (createdDate > caller.reminderDayOfMonth) {
        created.setUTCMonth(created.getUTCMonth()+1)
    }
    created.setUTCDate(caller.reminderDayOfMonth)
    return caller.lastCallTimestamp == null ? created : caller.lastCallTimestamp;
}

const monthsMissedCount = (caller) => {
    const status = callerStatus(caller);
    if (status !== "LAPSED") {
        return 0;
    }

    const endRange = caller.lastReminderTimestamp ? caller.lastReminderTimestamp : new Date();
    const numberOfMonthsLapsed = monthDiff(refDate(caller), endRange);
    // we'll count < 1 month as a missed Month
    return numberOfMonthsLapsed === 0 ? 1 : numberOfMonthsLapsed;
}

function monthDiff(dateFrom, dateTo) {
    return dateTo.getUTCMonth() - dateFrom.getUTCMonth() + 
      (12 * (dateTo.getUTCFullYear() - dateFrom.getUTCFullYear()))
}

function dayDiff(dateFrom, dateTo) {
    const diff = dateTo.getTime() - dateFrom.getTime()
    const days = diff/(1000 * 60 * 60 * 24)
    return days
}

export {
    callerStatus,
    monthsMissedCount
};
