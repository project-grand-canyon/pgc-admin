import { DateTime } from 'luxon'
import { createObjectCsvStringifier } from 'csv-writer'

const WAIT_FOR_CALL_AFTER_NOTIFICATION_DAYS = 5; 

const isPaused = ({ paused }) => paused

const isBrandNew = ({ lastReminderTimestamp }) => !lastReminderTimestamp

const isCurrent = ({ lastCallTimestamp, lastReminderTimestamp }) => {
    const lastCallDateTime = DateTime.fromSQL(lastCallTimestamp)
    const lastReminderDateTime = DateTime.fromSQL(lastReminderTimestamp)

    // If there was a call after the lastest reminder, then the caller is current
    return lastCallDateTime.diff(lastReminderDateTime) >= 0
}

const isWaiting = ({ lastReminderTimestamp, created }) => {
    const lastReminderDateTime = DateTime.fromSQL(lastReminderTimestamp || created)
    const now = DateTime.local()
    const daysSinceLastNotification = now.diff(lastReminderDateTime).as('days')

    return daysSinceLastNotification <= WAIT_FOR_CALL_AFTER_NOTIFICATION_DAYS
}


const callerMonthsLapsed = ({ lastCallTimestamp, lastReminderTimestamp, created }) => {
    const lastCallDate = DateTime.fromSQL(lastCallTimestamp || created)
    const lastReminderDate = DateTime.fromSQL(lastReminderTimestamp) 
    const lapseDuration = lastReminderDate.diff(lastCallDate)
    const numMonths = Math.floor(lapseDuration.as('months'))
    return numMonths
}

export const sortedByStatus = (a, b) => {
    const orderedList = [Status.CURRENT, Status.WAITING, Status.BRAND_NEW, Status.PAUSED, Status.LAPSED];   
    const aIndex = orderedList.indexOf(a.status.status);
    const bIndex = orderedList.indexOf(b.status.status);       
    const aScore = aIndex === -1 ? orderedList.length : aIndex;
    const bScore = bIndex === -1 ? orderedList.length : bIndex;
    const diff = aScore - bScore;
    if (diff !== 0 || a.status.status !== Status.LAPSED) {
        return diff;
    }
    return a.status.monthsMissedCount - b.status.monthsMissedCount;
}

export const Status = {
    LAPSED: "LAPSED",
    PAUSED: "PAUSED",
    BRAND_NEW: "BRAND_NEW",
    CURRENT: "CURRENT",
    WAITING: "WAITING",
}

export const callerStatus = caller => {
    let status = Status.LAPSED
    let monthsMissedCount = 0

    if (isPaused(caller)) {
        status = Status.PAUSED
    } else if (isBrandNew(caller)) {
        status = Status.BRAND_NEW
    } else if (isCurrent(caller)) {
        status = Status.CURRENT
    } else if (isWaiting(caller)) {
        status = Status.WAITING
    }

    if (status === Status.LAPSED) {
        monthsMissedCount = callerMonthsLapsed(caller)
    }

    return {
        status,
        monthsMissedCount,
    }
}

export const asCsv = (callers) => {

    const header = [
        {id: "firstName", title: "First Name"},
        {id: "lastName", title: "Last Name"},
        {id: "contactMethods", title: "Contact Methods"},
        {id: "phone", title: "Phone"},
        {id: "email", title: "Email"},
        {id: "zipCode", title: "ZIP"},
        {id: "paused", title: "Active/Paused"},
        {id: "totalCalls", title: "Total Calls Made"},
        {id: "lastCallTimestamp" , title: "Last Call Date"},
        {id: "lastReminderTimestamp", title: "Last Reminder Date"},
        {id: "reminderDayOfMonth", title: "Reminder Day of Month"},
        {id: "history", title: "History"} //json log of sign up, reminder, and call-in timestamps
    ];

    const csvStringifier = createObjectCsvStringifier({
        header
    });
    const headerStr = csvStringifier.getHeaderString()
    const body =  csvStringifier.stringifyRecords(callers)
    return `${headerStr}${body}`
}