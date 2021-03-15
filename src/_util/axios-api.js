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

function makeRequestOptions(url, method = "GET") {
  return {
    url,
    method,
    headers: { ...authHeader(), "Content-Type": "application/json" },
  };
}

export function updateRequest(district, request) {
  const isUpdating = request.requestId;
  const method = isUpdating ? "PUT" : "POST";
  const basePath = `/requests`
  const path = isUpdating ? basePath + `/${request.requestId}` : basePath
  const requestOptions = makeRequestOptions(path, method)
  requestOptions['data'] = {
    'districtId': district.districtId,
    'content': request.content
  }

  return client(requestOptions)
}

export function getErrorMessage(e) {
  return e.response && e.response.data ? e.response.data.message : e.message
}

export function addTalkingPoint(newTalkingPoint) {
  const requestOptions = makeRequestOptions('/talkingpoints', 'POST')
  requestOptions['data'] = newTalkingPoint
  return client(requestOptions)
}

export function editTalkingPoint(talkingPoint) {
  const requestOptions = makeRequestOptions(`/talkingpoints/${talkingPoint.talkingPointId}`, 'PUT')
  requestOptions['data'] = talkingPoint
  return client(requestOptions)
}

export function getAdmins() {
  const requestOptions = makeRequestOptions('/admins')
  return client(requestOptions)
}

export function getTalkingPoints() {
  const requestOptions = makeRequestOptions('/talkingpoints')
  return client(requestOptions)
}

export function updateScript(district, talkingPointIds) {
  const requestOptions = makeRequestOptions(`/districts/${district.districtId}/script`, "PUT")
  requestOptions['data'] = talkingPointIds
  return client(requestOptions)
}

export function updateUnhydratedDistrict(district) {
  const requestOptions = makeRequestOptions(`/districts/${district.districtId}`, "PUT")
  delete district.lastModified
  delete district.created
  delete district.senatorDistrict
  requestOptions['data'] = district
  return client(requestOptions)
}

export function getThemes() {
  const requestOptions = makeRequestOptions(`/themes`)
  return client(requestOptions)
}

export function getHydratedDistict(district) {  
  const requestOptions = makeRequestOptions(`/districts/${district.districtId}/hydrated`)
  return client(requestOptions)
}

export function getScript(district) {
  const requestOptions = makeRequestOptions(`/districts/${district.districtId}/script`)
  return client(requestOptions)
}

export function getStatistics(district) {
  const requestOptions = makeRequestOptions(`/stats/${district.districtId}`)
  return client(requestOptions)
}

export function getDistrictCallers(district, districtsById, completion) {
  const requestOptions = makeRequestOptions(`/callers?districtId=${district.districtId}`)
  getCallers(requestOptions, districtsById, completion);
}

export function getAllCallers(districtsById, completion) {
  const requestOptions = makeRequestOptions(`/callers`)
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
  const callHistoryRequestOptions = makeRequestOptions(`/calls/${caller["callerId"]}`)
  const reminderHistoryRequestOptions = makeRequestOptions(`/reminders/${caller["callerId"]}`)

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
