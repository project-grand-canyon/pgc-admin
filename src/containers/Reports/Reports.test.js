import * as React from "react";
import * as ReactDOM from "react-dom";
import mockAxios from "../../_util/axios-api";
import { wait, render, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import Reports from "./Reports";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { Row, Col, Icon, Statistic, Typography } from "antd";
const mockStore = configureStore([]);

jest.mock("../../_util/axios-api");

let testNumber = 0;

const districts = [
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
  mockAxios.get.mockImplementationOnce((url, rest) => {
    return {
      data: getDistrictData(type, mapUrlToId(url))
    }
  })
}

function getDistrictData(type, districtId) {
  switch (type) {
    case ("no calls/callers"):
      return {
        data: {
          //calls, callers = 0
          "totalCalls": 0,
          "totalCallers": 0,
          "recentDayCount": 31,
          "totalRecentCalls": 0,
          "callsByMonth": {
            "2020-02": 0,
            "2020-03": 0,
            "2020-04": 0,
            "2020-05": 0,
            "2020-06": 0,
            "2020-07": 0
          }
        },
        "callersByMonth": {
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
          "2020-07": 0
        },
        "activeCallersByMonth": {
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
          "2020-07": 0
        },
        "remindersByMonth": {
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
          "2020-07": 21
        },
        "districtId": { districtId }
      };
    case ("no calls"):
      return (400, {
        data: {
          //calls = 0, callers > 0
          "totalCalls": 0,
          "totalCallers": 27,
          "recentDayCount": 30,
          "totalRecentCalls": 5,
          "callsByMonth": {
            "2020-02": 0,
            "2020-03": 0,
            "2020-04": 0,
            "2020-05": 0,
            "2020-06": 0,
            "2020-07": 0
          },
          "callersByMonth": {
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
            "2020-07": 27
          },
          "activeCallersByMonth": {
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
            "2020-07": 3
          },
          "remindersByMonth": {
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
            "2020-07": 21
          },
          "districtId": { districtId }
        }
      });
    case ("no callers"):
      return {
        data: {
          "totalCalls": 25,
          "totalCallers": 0,
          "recentDayCount": 30,
          "totalRecentCalls": 5,
          "callsByMonth": {
            "2020-02": 3,
            "2020-03": 2,
            "2020-04": 4,
            "2020-05": 8,
            "2020-06": 6,
            "2020-07": 2
          },
          "callersByMonth": {
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
            "2020-07": 0
          },
          "activeCallersByMonth": {
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
            "2020-07": 0
          },
          "remindersByMonth": {
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
            "2020-07": 21
          },
          "districtId": { districtId }
        }
      };
    case ("basic"):
      return {
        //calls, callers > 0
        "totalCalls": 25,
        "totalCallers": 29,
        "recentDayCount": 31,
        "totalRecentCalls": 5,
        "callsByMonth": {
          "2020-02": 3,
          "2020-03": 2,
          "2020-04": 4,
          "2020-05": 8,
          "2020-06": 6,
          "2020-07": 2
        },
        "callersByMonth": {
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
          "2020-07": 29
        },
        "activeCallersByMonth": {
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
          "2020-07": 3
        },
        "remindersByMonth": {
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
          "2020-07": 21
        },
        "districtId": { districtId }
      }
  };
}

function mapUrlToId(url) {
  switch (url) {
    case `/stats/0`:
      return 0;
    case `/stats/1`:
      return 1;
    case `/stats/2`:
      return 2;
    case `/stats/3`:
      return 3;
  }
}

function getStore(districtId) {
  return mockStore({
    districts: {
      districts: districts,
      selected: districts[districtId]
    },
  })
}

async function testRunner(type) {

}

const root = document.createElement("div");

describe("Reports.js Unit Test", async () => {
  /*test("Basic", async () => {
    ReactDOM.render(
      <Provider store={store}>
        <Reports />
      </Provider>,
      root
    );
    expect(root).toBeDefined();
    expect(root.querySelector("h1").textContent).toEqual("loading...");
    await wait(expect(mockAxios.get).toBeCalledTimes(3)).then(() => {
      expect(root.querySelector("h1")).toBeNull();
    });
  });*/

  /*test("Check final version", async () => {
     const { getByTestId, getAllByTestId } = render(<Provider store={store}><Reports /></Provider>, root);
     const loadingH1 = getByTestId("loading");
     expect(loadingH1).toHaveTextContent("loading...");
     await wait(expect(mockAxios.get).toBeCalledTimes(6)).then(async () => {
       const districtTitle = getAllByTestId("districtTitle");
       const statisticsRow = getAllByTestId("statistics");
       const totalCallers = getAllByTestId("totalCallers");
       //const totalCallersStatistic = getAllByTestId("totalCallersStatistic");
       const totalCallersText = getAllByTestId("totalCallersText");
       const totalCalls = getAllByTestId("totalCalls");
       //const totalCallsStatistic = getAllByTestId("totalCallsStatistic");
       const totalCallsText = getAllByTestId("totalCallsText");
       const dayCounter = getAllByTestId("dayCounter");
       //const dayCounterStatistic = getAllByTestId("dayCounterStatistic");
       const dayCounterText = getAllByTestId("dayCounterText");
       const graphRow = getAllByTestId("graph");
       const graphColumn = getAllByTestId("graphColumn");
       //const responsiveContainer = getAllByTestId("responsiveContainer");
       //const cartesianGrid = getAllByTestId("cartesianGrid")
       //const xAxis = getAllByTestId("xAxis");
       //const yAxis = getAllByTestId("yAxis");
       //const toolTip = getAllByTestId("toolTip");
       //const legend = getAllByTestId("legend");
       //const line = getAllByTestId("line");
       expect(totalCallers).toHaveLength(3);
       expect(statistics).toHaveLength(3);
       expect(totalCallersStatistic).toHaveLength(3);
       expect(totalCallers[0]).toContainElement(totalCallersStatistic[0]);
       expect(title[0]).toHaveTextContent("MI-1 Activity Reports");
       expect(title[1]).toHaveTextContent("MI-Jun. Senator Activity Reports");
       expect(title[2]).toHaveTextContent("MI-Sen. Senator Activity Reports");
       expect(callersText).toHaveLength(3);
       expect(callersStatistic).toHaveLength(3);
       for (let i = 0; i < 3; ++i) {
         expect(callersText[i]).toHaveTextContent("Total Callers")
       }
     });
  })*/
  test("All Basic - Representative", async () => {
    const store = getStore(2);
    const type = "basic";
    setAxiosMockOnce(type);
    setAxiosMockOnce(type);
    setAxiosMockOnce(type);
    const { getByTestId, getAllByTestId } = render(<Provider store={store}><Reports /></Provider>, root);
    const loadingH1 = getByTestId("loading");
    expect(loadingH1).toHaveTextContent("loading...");
    await wait(() => expect(mockAxios.get).toBeCalledTimes(3)).then(async () => {
      expect(mockAxios.get).toHaveBeenNthCalledWith(1, `/stats/2`, { "headers": { "Content-Type": "application/json" } });
      expect(mockAxios.get).toHaveBeenNthCalledWith(2, `/stats/0`, { "headers": { "Content-Type": "application/json" } });
      expect(mockAxios.get).toHaveBeenNthCalledWith(3, `/stats/1`, { "headers": { "Content-Type": "application/json" } });

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
      for (let i = 0; i < 3; ++i) {
        expect(totalCallersText[i]).toHaveTextContent("Total Callers");
        expect(totalCallsText[i]).toHaveTextContent("Total Calls");
        expect(dayCounterText[i]).toHaveTextContent("Past 31 Days Call Count");
      }
    });
  })

  test("All Basic - Senate selected", async () => {
    const store = getStore(0);
    const type = "basic";
    setAxiosMockOnce(type);
    setAxiosMockOnce(type);
    setAxiosMockOnce(type);
    const { getByTestId, getAllByTestId } = render(<Provider store={store}><Reports /></Provider>, root);
    const loadingH1 = getByTestId("loading");
    expect(loadingH1).toHaveTextContent("loading...");
    await wait(() => expect(mockAxios.get).toBeCalledTimes(5)).then(async () => {
      expect(mockAxios.get).toHaveBeenNthCalledWith(4, `/stats/0`, { "headers": { "Content-Type": "application/json" } })
      expect(mockAxios.get).toHaveBeenNthCalledWith(5, `/stats/1`, { "headers": { "Content-Type": "application/json" } });

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
    });
  })
});