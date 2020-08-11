import * as React from "react";
import mockAxios from "../../_util/axios-api";
import { waitFor, render } from "@testing-library/react";
import "@testing-library/jest-dom";
import Reports from "./Reports";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
const mockStore = configureStore([]);

jest.mock("../../_util/axios-api");

const scenarios = {
  NO_CALLS_NO_CALLERS: "no calls/callers",
  NO_CALLS_MULTIPLE_CALLERS: "no calls/multiple callers",
  MULTIPLE_CALLS_NO_CALLERS: "multiple calls/no callers",
  MULTIPLE_CALLS_MULTIPLE_CALLERS: "multiple calls/multiple callers",
};

const dummyDistricts = [
  {
    state: "MI",
    number: -2,
    districtId: 0,
  },
  {
    state: "MI",
    number: -1,
    districtId: 1,
  },
  {
    state: "MI",
    number: 1,
    districtId: 2,
  },
  {
    state: "MI",
    number: 12,
    districtId: 3,
  },
  {
    //Included to test that districts are selected correctly
    state: "TX",
    number: 1,
    districtId: 4,
  },
  {
    //Included to test that districts are selected correctly
    state: "TX",
    number: -2,
    districtId: 5,
  },
  {
    //Included to test that districts are selected correctly
    state: "TX",
    number: -1,
    districtId: 6,
  },
];

function setAxiosMockOnce(type) {
  mockAxios.get.mockImplementationOnce((url, _) => {
    const districtId = url.slice(-1);
    return {
      data: getDistrictData(type, districtId),
    };
  });
}

function getDistrictData(type, districtId) {
  switch (type) {
    case scenarios.NO_CALLS_NO_CALLERS:
      return {
        data: {
          //calls, callers = 0
          totalCalls: 0,
          totalCallers: 0,
          recentDayCount: 31,
          totalRecentCalls: 0,
          callsByMonth: {
            "2020-02": 0,
            "2020-03": 0,
            "2020-04": 0,
            "2020-05": 0,
            "2020-06": 0,
            "2020-07": 0,
          },
          callersByMonth: {
            "2019-07": 0,
            "2019-08": 0,
            "2019-09": 0,
            "2019-10": 0,
            "2019-11": 0,
            "2019-12": 0,
            "2020-01": 0,
            "2020-02": 0,
            "2020-03": 0,
            "2020-04": 0,
            "2020-05": 0,
            "2020-06": 0,
            "2020-07": 0,
          },
          activeCallersByMonth: {
            "2019-07": 0,
            "2019-08": 0,
            "2019-09": 0,
            "2019-10": 0,
            "2019-11": 0,
            "2019-12": 0,
            "2020-01": 0,
            "2020-02": 0,
            "2020-03": 0,
            "2020-04": 0,
            "2020-05": 0,
            "2020-06": 0,
            "2020-07": 0,
          },
          remindersByMonth: {
            "2019-08": 1,
            "2019-09": 1,
            "2019-10": 2,
            "2019-11": 2,
            "2019-12": 2,
            "2020-01": 4,
            "2020-02": 14,
            "2020-03": 22,
            "2020-04": 24,
            "2020-05": 24,
            "2020-06": 24,
            "2020-07": 21,
          },
          districtId: { districtId },
        },
      };
    case scenarios.NO_CALLS_MULTIPLE_CALLERS:
      return (
        400,
        {
          data: {
            //calls = 0, callers > 0
            totalCalls: 0,
            totalCallers: 27,
            recentDayCount: 30,
            totalRecentCalls: 5,
            callsByMonth: {
              "2020-02": 0,
              "2020-03": 0,
              "2020-04": 0,
              "2020-05": 0,
              "2020-06": 0,
              "2020-07": 0,
            },
            callersByMonth: {
              "2019-07": 1,
              "2019-08": 1,
              "2019-09": 1,
              "2019-10": 2,
              "2019-11": 2,
              "2019-12": 2,
              "2020-01": 4,
              "2020-02": 20,
              "2020-03": 23,
              "2020-04": 24,
              "2020-05": 24,
              "2020-06": 24,
              "2020-07": 27,
            },
            activeCallersByMonth: {
              "2019-07": 0,
              "2019-08": 0,
              "2019-09": 0,
              "2019-10": 0,
              "2019-11": 0,
              "2019-12": 0,
              "2020-01": 0,
              "2020-02": 2,
              "2020-03": 3,
              "2020-04": 2,
              "2020-05": 5,
              "2020-06": 6,
              "2020-07": 3,
            },
            remindersByMonth: {
              "2019-08": 1,
              "2019-09": 1,
              "2019-10": 2,
              "2019-11": 2,
              "2019-12": 2,
              "2020-01": 4,
              "2020-02": 14,
              "2020-03": 22,
              "2020-04": 24,
              "2020-05": 24,
              "2020-06": 24,
              "2020-07": 21,
            },
            districtId: { districtId },
          },
        }
      );
    case scenarios.MULTIPLE_CALLS_NO_CALLERS:
      return {
        data: {
          totalCalls: 25,
          totalCallers: 0,
          recentDayCount: 30,
          totalRecentCalls: 5,
          callsByMonth: {
            "2020-02": 3,
            "2020-03": 2,
            "2020-04": 4,
            "2020-05": 8,
            "2020-06": 6,
            "2020-07": 2,
          },
          callersByMonth: {
            "2019-07": 0,
            "2019-08": 0,
            "2019-09": 0,
            "2019-10": 0,
            "2019-11": 0,
            "2019-12": 0,
            "2020-01": 0,
            "2020-02": 0,
            "2020-03": 0,
            "2020-04": 0,
            "2020-05": 0,
            "2020-06": 0,
            "2020-07": 0,
          },
          activeCallersByMonth: {
            "2019-07": 0,
            "2019-08": 0,
            "2019-09": 0,
            "2019-10": 0,
            "2019-11": 0,
            "2019-12": 0,
            "2020-01": 0,
            "2020-02": 0,
            "2020-03": 0,
            "2020-04": 0,
            "2020-05": 0,
            "2020-06": 0,
            "2020-07": 0,
          },
          remindersByMonth: {
            "2019-08": 1,
            "2019-09": 1,
            "2019-10": 2,
            "2019-11": 2,
            "2019-12": 2,
            "2020-01": 4,
            "2020-02": 14,
            "2020-03": 22,
            "2020-04": 24,
            "2020-05": 24,
            "2020-06": 24,
            "2020-07": 21,
          },
          districtId: { districtId },
        },
      };
    case scenarios.MULTIPLE_CALLS_MULTIPLE_CALLERS:
      return {
        //calls, callers > 0
        totalCalls: 25,
        totalCallers: 29,
        recentDayCount: 31,
        totalRecentCalls: 5,
        callsByMonth: {
          "2020-02": 3,
          "2020-03": 2,
          "2020-04": 4,
          "2020-05": 8,
          "2020-06": 6,
          "2020-07": 2,
        },
        callersByMonth: {
          "2019-07": 4,
          "2019-08": 4,
          "2019-09": 4,
          "2019-10": 4,
          "2019-11": 4,
          "2019-12": 6,
          "2020-01": 9,
          "2020-02": 12,
          "2020-03": 18,
          "2020-04": 24,
          "2020-05": 28,
          "2020-06": 28,
          "2020-07": 29,
        },
        activeCallersByMonth: {
          "2019-07": 0,
          "2019-08": 0,
          "2019-09": 0,
          "2019-10": 0,
          "2019-11": 0,
          "2019-12": 0,
          "2020-01": 0,
          "2020-02": 2,
          "2020-03": 3,
          "2020-04": 2,
          "2020-05": 5,
          "2020-06": 6,
          "2020-07": 3,
        },
        remindersByMonth: {
          "2019-08": 1,
          "2019-09": 1,
          "2019-10": 2,
          "2019-11": 2,
          "2019-12": 2,
          "2020-01": 4,
          "2020-02": 14,
          "2020-03": 22,
          "2020-04": 24,
          "2020-05": 24,
          "2020-06": 24,
          "2020-07": 21,
        },
        districtId: { districtId },
      };
  }
}

function getStore(districtId) {
  const selectedDistrict = dummyDistricts.find((el) => {
    return el.districtId == districtId;
  });
  return mockStore({
    districts: {
      districts: dummyDistricts,
      selected: selectedDistrict,
    },
  });
}

const REP_DISTRICT_ID = 2;
const SEN_JR_DISTRICT_ID = 0;
const SEN_SR_DISTRICT_ID = 1;
const STANDARD_HEADERS = {
  headers: { "Content-Type": "application/json" },
};

describe("Reports.js Unit Test", async () => {
  test("Representative Reports - Shows Reports for Representative and Both Senators", async () => {
    const store = getStore(REP_DISTRICT_ID);
    setAxiosMockOnce(scenarios.MULTIPLE_CALLS_MULTIPLE_CALLERS);
    setAxiosMockOnce(scenarios.MULTIPLE_CALLS_MULTIPLE_CALLERS);
    setAxiosMockOnce(scenarios.MULTIPLE_CALLS_MULTIPLE_CALLERS);
    const { getByTestId, getAllByTestId } = render(
      <Provider store={store}>
        <Reports />
      </Provider>
    );

    const statsLoading = getAllByTestId("Stat Row Spin");
    const graphLoading = getAllByTestId("Stats Graph Spin");
    statsLoading.concat(graphLoading).forEach((el)=>{expect(el).toBeVisible()})

    await waitFor(() => expect(mockAxios.get).toBeCalledTimes(3)).then(
      async () => {
        expect(mockAxios.get).toHaveBeenNthCalledWith(1, `/stats/${REP_DISTRICT_ID}`, STANDARD_HEADERS);
        expect(mockAxios.get).toHaveBeenNthCalledWith(2, `/stats/${SEN_JR_DISTRICT_ID}`, STANDARD_HEADERS);
        expect(mockAxios.get).toHaveBeenNthCalledWith(3, `/stats/${SEN_SR_DISTRICT_ID}`, STANDARD_HEADERS);

        const districtTitle = getAllByTestId("districtTitle");
        expect(districtTitle).toHaveLength(3);
        expect(districtTitle[0]).toHaveTextContent("MI-1 Activity Reports");
        expect(districtTitle[1]).toHaveTextContent("MI-Jun. Senator Activity Reports");
        expect(districtTitle[2]).toHaveTextContent("MI-Sen. Senator Activity Reports");

        const statisticsRow = getAllByTestId("statistics");
        const totalCallersCol = getAllByTestId("totalCallersCol");
        const totalCallsCol = getAllByTestId("totalCallsCol");
        const dayCounterCol = getAllByTestId("dayCounterCol");
        expect(statisticsRow).toHaveLength(3);
        expect(totalCallersCol).toHaveLength(3);
        expect(totalCallsCol).toHaveLength(3);
        expect(dayCounterCol).toHaveLength(3);
        //expect(statisticsRow[0]).toHaveAttribute(totalCallersCol[0]);

        const totalCallersText = getAllByTestId("totalCallersText");
        const totalCallsText = getAllByTestId("totalCallsText");
        const dayCounterText = getAllByTestId("dayCounterText");
        expect(totalCallersText).toHaveLength(3);
        expect(totalCallsText).toHaveLength(3);
        expect(dayCounterText).toHaveLength(3);
        for (let i = 0; i < 3; i++) {
          expect(totalCallersText[i]).toHaveTextContent("Total Callers");
          expect(totalCallsText[i]).toHaveTextContent("Total Calls");
          expect(dayCounterText[i]).toHaveTextContent("Past 31 Days Call Count");
        }
      }
    );
  });

  test("Senate Reports - Shows Reports For Both Senators", async () => {
    const store = getStore(SEN_JR_DISTRICT_ID);
    setAxiosMockOnce(scenarios.MULTIPLE_CALLS_MULTIPLE_CALLERS);
    setAxiosMockOnce(scenarios.MULTIPLE_CALLS_MULTIPLE_CALLERS);
    setAxiosMockOnce(scenarios.MULTIPLE_CALLS_MULTIPLE_CALLERS);
    const { getByTestId, getAllByTestId } = render(
      <Provider store={store}>
        <Reports />
      </Provider>
    );
    const statsLoading = getAllByTestId("Stat Row Spin");
    const graphLoading = getAllByTestId("Stats Graph Spin");
    statsLoading.concat(graphLoading).forEach((el)=>{expect(el).toBeVisible()})
    await waitFor(() => expect(mockAxios.get).toBeCalledTimes(5)).then(
      async () => {
        expect(mockAxios.get).toHaveBeenNthCalledWith(4, `/stats/${SEN_JR_DISTRICT_ID}`, STANDARD_HEADERS);
        expect(mockAxios.get).toHaveBeenNthCalledWith(5, `/stats/${SEN_SR_DISTRICT_ID}`, STANDARD_HEADERS);

        const districtTitle = getAllByTestId("districtTitle");
        expect(districtTitle).toHaveLength(2);
        expect(districtTitle[0]).toHaveTextContent("MI-Jun. Senator Activity Reports");
        expect(districtTitle[1]).toHaveTextContent("MI-Sen. Senator Activity Reports");

        const statisticsRow = getAllByTestId("statistics");
        const totalCallersCol = getAllByTestId("totalCallersCol");
        const totalCallsCol = getAllByTestId("totalCallsCol");
        const dayCounterCol = getAllByTestId("dayCounterCol");
        expect(statisticsRow).toHaveLength(2);
        expect(totalCallersCol).toHaveLength(2);
        expect(totalCallsCol).toHaveLength(2);
        expect(dayCounterCol).toHaveLength(2);
        //expect(statisticsRow[0]).toHaveAttribute(totalCallersCol[0]);

        const totalCallersText = getAllByTestId("totalCallersText");
        const totalCallsText = getAllByTestId("totalCallsText");
        const dayCounterText = getAllByTestId("dayCounterText");
        expect(totalCallersText).toHaveLength(2);
        expect(totalCallsText).toHaveLength(2);
        expect(dayCounterText).toHaveLength(2);
        for (let i = 0; i < 2; ++i) {
          expect(totalCallersText[i]).toHaveTextContent("Total Callers");
          expect(totalCallsText[i]).toHaveTextContent("Total Calls");
          expect(dayCounterText[i]).toHaveTextContent("Past 31 Days Call Count");
        }
      }
    );
  });
});
