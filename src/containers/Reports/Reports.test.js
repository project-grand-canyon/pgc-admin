import * as React from "react";
import { waitFor, render, getByText } from "@testing-library/react";
import "@testing-library/jest-dom";
import Reports from "./Reports";
import { getReportData } from "../../_util/axios-api";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
const mockStore = configureStore([]);

jest.mock("../../_util/axios-api");

afterEach(() => {
  getReportData.mockReset();
});

const JR_SEN_DISTRICT = {
  state: "MI",
  number: -2,
  districtId: 0,
};

const SR_SEN_DISTRICT = {
  state: "MI",
  number: -1,
  districtId: 1,
};

const REP_DISTRICT = {
  state: "MI",
  number: 1,
  districtId: 2,
};

const districtsFixtures = [JR_SEN_DISTRICT, SR_SEN_DISTRICT, REP_DISTRICT];

function getStore() {
  return mockStore({
    districts: {
      districts: districtsFixtures,
    },
  });
}

const dummyStats = {
  totalCalls: 25,
  totalCallers: 29,
  recentDayCount: 31,
  totalRecentCalls: 5,
  callsByMonth: {
    "2020-02": 3,
    "2020-03": 2,
    "2020-04": 4,
  },
  callersByMonth: {
    "2020-02": 3,
    "2020-03": 2,
    "2020-04": 4,
  },
  activeCallersByMonth: {
    "2020-02": 3,
    "2020-03": 2,
    "2020-04": 4,
  },
  remindersByMonth: {
    "2020-02": 3,
    "2020-03": 2,
    "2020-04": 4,
  },
  months: ["2020-02", "2020-03", "2020-04"],
  completionRate: 100,
};

const delayedStatistics = (_, completion) => {
  setTimeout(() => {
    completion();
  }, 1000);
};

const immediateStatistics = (_, completion) => {
  completion(null, [dummyStats, dummyStats, dummyStats]);
};

describe("Reports.js Unit Test", () => {
  test("Shows Loading State While Fetching Data", () => {
    getReportData.mockImplementation(delayedStatistics);
    const { getAllByTestId } = render(
      <Provider store={getStore()}>
        <Reports district={REP_DISTRICT} />
      </Provider>
    );
    const statsLoading = getAllByTestId("Stat Row Spin");
    const graphLoading = getAllByTestId("Stats Graph Spin");
    statsLoading.concat(graphLoading).forEach((el) => {
      expect(el).toBeVisible();
    });
  });

  test("Shows Two Sets of Data for Senators", () => {
    getReportData.mockImplementation(delayedStatistics);
    const { getByText } = render(
      <Provider store={getStore()}>
        <Reports district={SR_SEN_DISTRICT} />
      </Provider>
    );

    const juniorSenatorSectionTitle = getByText(
      "MI-Jun. Senator Activity Reports"
    );
    const seniorSenatorSectionTitle = getByText(
      "MI-Sen. Senator Activity Reports"
    );
    expect(juniorSenatorSectionTitle).toBeVisible();
    expect(seniorSenatorSectionTitle).toBeVisible();
  });

  test("Shows Three Sets of Data for Representatives", () => {
    getReportData.mockImplementation(delayedStatistics);
    const { getByText } = render(
      <Provider store={getStore()}>
        <Reports district={REP_DISTRICT} />
      </Provider>
    );

    const juniorSenatorSectionTitle = getByText(
      "MI-Jun. Senator Activity Reports"
    );
    const seniorSenatorSectionTitle = getByText(
      "MI-Sen. Senator Activity Reports"
    );
    const repSectionTitle = getByText("MI-1 Activity Reports");
    expect(juniorSenatorSectionTitle).toBeVisible();
    expect(seniorSenatorSectionTitle).toBeVisible();
    expect(repSectionTitle).toBeVisible();
  });

  it("Populates Statistics", async () => {
    getReportData.mockImplementation(immediateStatistics);
    const { getAllByText } = render(
      <Provider store={getStore()}>
        <Reports district={SR_SEN_DISTRICT} />
      </Provider>
    );

    const totalCallers = await waitFor(() => getAllByText("Total Callers"), {
      timeout: 1000,
    });
    const totalCalls = getAllByText("Total Calls");
    const pastDaysCallCount = getAllByText("Past 31 Days Call Count");
    const completionRate = getAllByText("Completion Rate");
    totalCallers
      .concat(totalCalls)
      .concat(pastDaysCallCount)
      .concat(completionRate)
      .forEach((element) => {
        expect(element).toBeVisible();
      });
  });
});
