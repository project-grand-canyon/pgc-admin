import axios from "axios";
import { DateTime } from "luxon";
import asyncPool from "tiny-async-pool";
import _ from "lodash";
import { HistoryType } from "../containers/Callers/constants";
import { authHeader } from "../_util/auth/auth-header";
import {
    callerStatus,
  } from "../_util/caller";


const client = axios.create({
  baseURL:
    process.env.REACT_APP_API_ENDPOINT ||
    "https://project-grand-canyon.appspot.com/api/",
});

export function getDistrictCallers(district, completion) {
  const requestOptions = {
    url: `/callers?districtId=${district.districtId}`,
    method: "GET",
    headers: { ...authHeader(), "Content-Type": "application/json" },
  };
  getCallers(requestOptions, completion);
}

export function getAllCallers(completion) {
  const requestOptions = {
    url: `/callers`,
    method: "GET",
    headers: { ...authHeader(), "Content-Type": "application/json" },
  };
  getCallers(requestOptions, completion);
}

export function getCallerHistories(callers, completion) {
    const poolLimit = 3
    return asyncPool(poolLimit, callers, getCallerHistory)
    .then((results) => {
        completion(null, results)
    })
    .catch((e) => {
      completion(e);
    });
  }

function getCallers(requestOptions, completion) {
  client(requestOptions)
    .then(({ data }) => {
      const callers = (data || []).map(transformCaller);
      completion(null, callers);
    })
    .catch((e) => {
      completion(e);
    });
}

function transformCaller(caller) {
  return {
    ...caller,
    key: caller.callerId,
    contactMethodSMS: caller.contactMethods.indexOf("sms") !== -1,
    contactMethodEmail: caller.contactMethods.indexOf("email") !== -1,
    status: callerStatus(caller),
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
