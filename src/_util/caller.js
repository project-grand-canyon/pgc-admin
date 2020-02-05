import { DateTime } from 'luxon'

const WAIT_FOR_CALL_AFTER_NOTIFICATION_DAYS = 5; 

const isPaused = ({ paused }) => paused

const isBrandNew = ({ lastReminderTimestamp }) => !lastReminderTimestamp

const isCurrent = ({ lastCallTimestamp, lastReminderTimestamp }) => {
    const lastCallDateTime = DateTime.fromSQL(lastCallTimestamp)
    const lastReminderDateTime = DateTime.fromSQL(lastReminderTimestamp)

    // If there was a call after the lastest reminder, then the caller is current
    return lastCallDateTime.diff(lastReminderDateTime) >= 0
}

const isWaiting = ({ lastCallTimestamp, created }) => {
    const lastCallDateTime = DateTime.fromSQL(lastCallTimestamp || created)
    const now = DateTime.local()
    const daysSinceLastNotification = now.diff(lastCallDateTime).as('days')

    return daysSinceLastNotification <= WAIT_FOR_CALL_AFTER_NOTIFICATION_DAYS
}


const callerMonthsLapsed = ({ lastCallTimestamp, lastReminderTimestamp }) => {
    const lastCallDate = DateTime.fromSQL(lastCallTimestamp)
    const lastReminderDate = DateTime.fromSQL(lastReminderTimestamp) 
    const lapseDuration = lastReminderDate.diff(lastCallDate)

    return Math.floor(lapseDuration.as('months'))
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
