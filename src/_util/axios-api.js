import axios from "axios";
import { DateTime } from "luxon";
import asyncPool from "tiny-async-pool";
import _ from "lodash";
import { HistoryType } from "../containers/Callers/constants";
import { authHeader } from "../_util/auth/auth-header";
import { callerStatus } from "../_util/caller";
import { displayName } from "../_util/district";

const client = axios.create({
  baseURL:
    process.env.REACT_APP_API_ENDPOINT ||
    "https://project-grand-canyon.appspot.com/api/",
});

export function getReportData(districts, completion) {
  const promises = districts.map((el) => {
    console.log('auth header')
    console.log(authHeader())
    return client.get(`/stats/${el.districtId}`, {
      headers: { ...authHeader(), "Content-Type": "application/json" },
    });
  });
  Promise.all(promises)
    .then((responses) => {
      console.log('responsses')
      console.log(responses)
      const rawStatistics = responses.map((response) => {
        const districtStatistic = response.data;
        const totalActiveCallers = Object.values(
          districtStatistic["activeCallersByMonth"]
        ).reduce((acc, curr) => {
          return acc + curr;
        }, 0);
        const totalReminders = Object.values(
          districtStatistic["remindersByMonth"]
        ).reduce((acc, curr) => {
          return acc + curr;
        }, 0);
        const completionRate = totalReminders
          ? ((totalActiveCallers / totalReminders) * 100).toFixed(1)
          : 0;
        districtStatistic["completionRate"] = completionRate;
        return districtStatistic;
      });
      console.log(rawStatistics)
      const districtWithMostHistory = rawStatistics.reduce(
        (acc, districtStatistic, index) => {
          if (
            Object.keys(districtStatistic.activeCallersByMonth).length >
            Object.keys(rawStatistics[acc].activeCallersByMonth).length
          ) {
            acc = index;
          }
          return acc;
        },
        0
      );
      const monthsToUse = Object.keys(
        rawStatistics[districtWithMostHistory].activeCallersByMonth
      );
      console.log(monthsToUse)
      const statistics = rawStatistics.map((districtStatistic) => {
        districtStatistic["months"] = monthsToUse;
        return districtStatistic;
      });
      console.log(statistics)
      completion(null, statistics);
    })
    .catch((error) => {
      completion(error);
    });
}

export function getDistrictCallers(district, allDistrictNames, completion) {
  const requestOptions = {
    url: `/callers?districtId=${district.districtId}`,
    method: "GET",
    headers: { ...authHeader(), "Content-Type": "application/json" },
  };
  getCallers(requestOptions, allDistrictNames, completion);
}

export function getAllCallers(allDistrictNames, completion) {
  const requestOptions = {
    url: `/callers`,
    method: "GET",
    headers: { ...authHeader(), "Content-Type": "application/json" },
  };
  getCallers(requestOptions, allDistrictNames, completion);
}

export function getCallerHistories(callers, completion) {
  const poolLimit = 3;
  return asyncPool(poolLimit, callers, getCallerHistory)
    .then((results) => {
      completion(null, results);
    })
    .catch((e) => {
      completion(e);
    });
}

function getCallers(requestOptions, allDistrictNames, completion) {
  client(requestOptions)
    .then(({ data }) => {
      const callers = (data || []).map((el) => {
        return transformCaller(el, allDistrictNames);
      });
      completion(null, callers);
    })
    .catch((e) => {
      completion(e);
    });
}

function transformCaller(caller, allDistrictNames) {
  return {
    ...caller,
    key: caller.callerId,
    contactMethodSMS: caller.contactMethods.indexOf("sms") !== -1,
    contactMethodEmail: caller.contactMethods.indexOf("email") !== -1,
    status: callerStatus(caller),
    districtName: displayName(allDistrictNames.get(caller.districtId)),
  };
}

function getCallerHistory(caller) {
  const callHistoryRequestOptions = {
    url: `/calls/${caller["callerId"]}`,
    method: "GET",
    headers: { ...authHeader(), "Content-Type": "application/json" },
  };
  const reminderHistoryRequestOptions = {
    url: `/reminders/${caller["callerId"]}`,
    method: "GET",
    headers: { ...authHeader(), "Content-Type": "application/json" },
  };
  return Promise.all([
    client(callHistoryRequestOptions),
    client(reminderHistoryRequestOptions),
  ]).then(([calls, reminders]) => {
    const createHistoryItem = (timestamp, type) => {
      const dateTime = DateTime.fromSQL(timestamp);
      return {
        timestamp: dateTime.valueOf(),
        timestampDisplay: dateTime.toLocaleString(),
        type,
      };
    };

    const signUpHistory = [
      createHistoryItem(caller.created, HistoryType.SIGN_UP),
    ];
    const callHistory = _.map(calls.data, ({ created }) =>
      createHistoryItem(created, HistoryType.CALL)
    );
    const reminderHistory = _.map(reminders.data, ({ timeSent }) =>
      createHistoryItem(timeSent, HistoryType.NOTIFICATION)
    );
    const history = {
      signUpHistory,
      callHistory,
      reminderHistory,
    };
    return history;
  });
}

export default client;
