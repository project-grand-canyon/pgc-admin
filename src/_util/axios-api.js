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

export function getStatistics(district) {
  const requestOptions = {
    url: `/stats/${district.districtId}`,
    method: "GET",
    headers: { ...authHeader(), "Content-Type": "application/json" },
  };
  return client(requestOptions)
}

export function getDistrictCallers(district, districtsById, completion) {
  const requestOptions = {
    url: `/callers?districtId=${district.districtId}`,
    method: "GET",
    headers: { ...authHeader(), "Content-Type": "application/json" },
  };
  getCallers(requestOptions, districtsById, completion);
}

export function getAllCallers(districtsById, completion) {
  const requestOptions = {
    url: `/callers`,
    method: "GET",
    headers: { ...authHeader(), "Content-Type": "application/json" },
  };
  getCallers(requestOptions, districtsById, completion);
}

export function getCallerHistories(callers, districtsById, completion) {
    const poolLimit = 3
    const getHistory = (caller) => getCallerHistory(caller, districtsById);
    return asyncPool(poolLimit, callers, getHistory)
    .then((results) => {
        completion(null, results)
    })
    .catch((e) => {
      completion(e);
    });
  }

function getCallers(requestOptions, districtsById, completion) {
  client(requestOptions)
    .then(({ data }) => {
      const callers = (data || []).map(el => {
        return transformCaller(el, districtsById)
      });
      completion(null, callers);
    })
    .catch((e) => {
      completion(e);
    });
}

function transformCaller(caller, districtsById) {
  const district = districtsById.get(caller.districtId);
  return {
    ...caller,
    key: caller.callerId,
    contactMethodSMS: caller.contactMethods.indexOf("sms") !== -1,
    contactMethodEmail: caller.contactMethods.indexOf("email") !== -1,
    status: callerStatus(caller),
    districtName: displayName(district),
    state: district.state,
    districtNumber: district.number,
  };
}

function getCallerHistory(caller, districtsById) {
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
    const createHistoryItem = ({timestamp, ...rest}) => {
      const dateTime = DateTime.fromSQL(timestamp);
      return {
        timestamp: dateTime.valueOf(),
        timestampDisplay: dateTime.toLocaleString(),
        ...rest,
      };
    };

    const signUpHistory = [
      createHistoryItem({timestamp: caller.created, type: HistoryType.SIGN_UP}),
    ];
    const callHistory = _.map(calls.data, ({ created, districtId }) => {
      let recipient;
      const district = districtsById.get(districtId);
      if (district) {
        recipient = `${district.repFirstName} ${district.repLastName} (${displayName(district)})`;
      }
      return createHistoryItem({timestamp: created, type: HistoryType.CALL, recipient})
    });
    const reminderHistory = _.map(reminders.data, ({ timeSent, targetDistrictId, trackingId }) => {
      const district = districtsById.get(targetDistrictId);
      const urlPath = `http://www.cclcalls.org/call/${district.state.toLowerCase()}/${district.number}`;
      const urlSearch = `?t=${trackingId}&c=${caller.callerId}&d=${caller.districtNumber}`;
      // Note: the URL provides district numbers for the call target and the caller's home.
      // But it provides only one state to resolve these district numbers.
      // It is assumed that the two districts always belong to the same state.
      const url = urlPath + urlSearch;
      return createHistoryItem({timestamp: timeSent, type: HistoryType.NOTIFICATION, url});
    });
    const history = {
      signUpHistory,
      callHistory,
      reminderHistory,
    };
    return history;
  });
}

export default client;
