import React from "react"
import { render } from "@testing-library/react"
import "@testing-library/jest-dom"
import Callers from "./Callers"
import HistoryPanel from "./HistoryPanel"
import {
    getAllCallers,
    getDistrictCallers,
    getCallerHistories,
} from "../../_util/axios-api";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";
import { Status } from "../../_util/caller";
import { Redirect } from "react-router";

const mockStore = configureStore([]);

jest.mock("../../_util/axios-api");
jest.mock("react-router");

afterEach(() => {
    getAllCallers.mockReset();
    getDistrictCallers.mockReset();
    getCallerHistories.mockReset();
});

const JR_SEN_DISTRICT = {
    state: "MI",
    number: -2,
    districtId: 0,
    repFirstName: 'Paul',
    repLastName: 'Mingus'
};

const SR_SEN_DISTRICT = {
    state: "MI",
    number: -1,
    districtId: 1,
    repFirstName: 'Xerbi',
    repLastName: 'Qaraq'
};

const REP_DISTRICT = {
    state: "MI",
    number: 1,
    districtId: 2,
    repFirstName: 'Neysa',
    repLastName: 'Sheen'
};

const districtsFixtures = [JR_SEN_DISTRICT, SR_SEN_DISTRICT, REP_DISTRICT];

function getStore(isAdmin) {
    return mockStore({
        districts: {
            districts: [districtsFixtures]
        },
        admin: {
            admin: {
                root: isAdmin
            }
        }
    });
}

const CALLER_BRAND_NEW_REP = {
    callerId: 1,
    firstName: "Caller1First",
    lastName: "Caller1Last",
    districtId: 2,
    districtName: "MI-1",
    email: "caller1@callTest.net",
    key: 3,
    paused: false,
    phone: "000-000-0001",
    reminderDayOfMonth: 1,
    status: {
        monthsMissedCount: 0,
        status: Status.BRAND_NEW
    }
}

const CALLER_LAPSED_REP = {
    callerId: 2,
    firstName: "Caller2First",
    lastName: "Caller2Last",
    districtId: 2,
    districtName: "MI-1",
    email: "caller2@callTest.net",
    key: 1,
    paused: false,
    phone: "000-000-0002",
    reminderDayOfMonth: 2,
    status: {
        monthsMissedCount: 10,
        status: Status.LAPSED
    }
}

const CALLER_CURRENT_REP = {
    callerId: 3,
    firstName: "Caller3First",
    lastName: "Caller3Last",
    districtId: 2,
    districtName: "MI-1",
    email: "caller3@callTest.net",
    key: 2,
    paused: false,
    phone: "000-000-0003",
    reminderDayOfMonth: 3,
    status: {
        monthsMissedCount: 0,
        status: Status.CURRENT
    }
}

const CALLER_PAUSED_JR = {
    callerId: 4,
    firstName: "Caller4First",
    lastName: "Caller4Last",
    districtId: 0,
    districtName: "MI-Jun. Senator",
    email: "caller4@callTest.net",
    key: 1,
    paused: true,
    phone: "000-000-0004",
    reminderDayOfMonth: 4,
    status: {
        monthsMissedCount: 4,
        status: Status.PAUSED
    }
}

const CALLER_WAITING_JR = {
    callerId: 5,
    firstName: "Caller5First",
    lastName: "Caller5Last",
    districtId: 2,
    districtName: "MI-Jun. Senator",
    email: "caller5@callTest.net",
    key: 1,
    paused: false,
    phone: "000-000-0005",
    reminderDayOfMonth: 5,
    status: {
        monthsMissedCount: 0,
        status: Status.WAITING
    }
}

const callersFixtures = [CALLER_BRAND_NEW_REP, CALLER_LAPSED_REP, CALLER_CURRENT_REP, CALLER_PAUSED_JR, CALLER_WAITING_JR];

const returnsAllCallers = () => {
    return {
        callers: callersFixtures
    }
};

const returnsErr = () => {
    return {
        err: "Failed to fetch data",
        callers: []
    }
}

const returnsDistrictCallers = (district) => {
    return {
        callers: callersFixtures.filter((el) => {
            return el.districtId === district.districtId;
        })
    }
}

const CALLER_HISTORY = [
    {
        timestamp: 15,
        timestampDisplay: '1/15/2020',
        type: 'Call',
    },
    {
        timestamp: 10,
        timestampDisplay: '1/10/2020',
        type: 'Call',
        recipient: 'Xerbi Qaraq (MI-Sen. Senator)'
    },
    {
        timestamp: 5,
        timestampDisplay: '1/5/2020',
        type: 'Notification',
        url: 'http://www.cclcalls.org?t=qwer'
    },
    {
        timestamp: 1,
        timestampDisplay: '1/1/2020',
        type: 'Sign Up'
    }
]

describe("Callers.js Unit Test", () => {
    test("Tests Super Admin", () => {
        getAllCallers.mockImplementation(returnsAllCallers);
        getDistrictCallers.mockImplementation(returnsDistrictCallers);
        const { getByText, getAllByText, getByTestId } = render(
            <Provider store={getStore(true)}>
                <Callers district={REP_DISTRICT} />
            </Provider>
        );
        const callersForDistrictTitle = getByText("Callers for District");
        const downloadAsCSV = getByText("Download as CSV");
        const callersForDistrictTable = getByTestId("districtCallersTable")
        const allCallersTitle = getByText("All Callers");
        const allCallersSearch = getByTestId("allCallersSearch");
        const allCallersTable = getByTestId("allCallersTable");
        const outerStructure = [callersForDistrictTitle, downloadAsCSV, callersForDistrictTable, allCallersTitle, allCallersSearch, allCallersTable];
        outerStructure.forEach((el) => {
            expect(el).toBeVisible();
        })
        let onceRenderedEntries = ["District"];
        let twiceRenderedEntries = ["First Name", "Last Name", "Call Day", "Call Status"];
        callersFixtures.forEach((el) => {
            el.districtId === 2 ? () => {
                twiceRenderedEntries.concat([el.firstName, el.lastName, el.reminderDayOfMonth]);
                onceRenderedEntries.concat([el.districtName]);
            } : onceRenderedEntries.concat([el.firstName, el.lastName, el.districtName, el.reminderDayOfMonth]);
        })
        onceRenderedEntries.forEach((el) => {
            expect(getAllByText(el)).toHaveLength(1);
        })
        twiceRenderedEntries.forEach((el) => {
            expect(getAllByText(el)).toHaveLength(2);
        })
    })
    test("Tests Regular Admin", () => {
        getAllCallers.mockImplementation(returnsAllCallers);
        getDistrictCallers.mockImplementation(returnsDistrictCallers);
        const { getByText, getAllByText, getByTestId, queryByTestId, queryByText } = render(
            <Provider store={getStore(false)}>
                <Callers district={REP_DISTRICT} />
            </Provider>
        );
        const callersForDistrictTitle = getByText("Callers for District");
        const downloadAsCSV = getByText("Download as CSV");
        const callersForDistrictTable = getByTestId("districtCallersTable")
        const allCallersTitle = queryByText("All Callers");
        const allCallersSearch = queryByTestId("allCallersSearch");
        const allCallersTable = queryByTestId("allCallersTable");
        const outerStructure = [callersForDistrictTitle, downloadAsCSV, callersForDistrictTable]
        const notPresent = [allCallersTitle, allCallersSearch, allCallersTable];
        outerStructure.forEach((el) => {
            expect(el).toBeVisible();
        })
        notPresent.forEach((el) => {
            expect(el).toBeNull();
        })
        let notRenderedEntries = ["District"];
        let renderedEntries = ["First Name", "Last Name", "Call Day", "Call Status"];
        callersFixtures.forEach((el) => {
            el.districtId === 2 ? () => {
                renderedEntries.concat([el.firstName, el.lastName, el.reminderDayOfMonth]);
                notRenderedEntries.concat([el.districtName]);
            } : notRenderedEntries.concat([el.firstName, el.lastName, el.districtName, el.reminderDayOfMonth]);
        })
        notRenderedEntries.forEach((el) => {
            expect(queryByText(el)).toBeNull();
        })
        renderedEntries.forEach((el) => {
            expect(getAllByText(el)).toHaveLength(1);
        })
    })

    test("Redirects iff Senate Selected", () => {
        getAllCallers.mockImplementation(returnsAllCallers);
        getDistrictCallers.mockImplementation(returnsDistrictCallers);
        render(
            <div>
                <Provider store={getStore(true)}>
                    <Callers district={SR_SEN_DISTRICT} />
                </Provider>
                <Provider store={getStore(true)}>
                    <Callers district={JR_SEN_DISTRICT} />
                </Provider>
            </div>
        );
        expect(Redirect).toHaveBeenCalledTimes(2);
        render(
            <Provider store={getStore(true)}>
                <Callers district={REP_DISTRICT} />
            </Provider>
        );
        expect(Redirect).toHaveBeenCalledTimes(2);
    })

    test("Displays caller history", () => {
        const { getAllByText, getAllByDisplayValue } = render(
            <HistoryPanel history={CALLER_HISTORY} caller={CALLER_CURRENT_REP} />
        )
        const texts = [
            'Sign Up on 1/1/2020',
            'Notification on 1/5/2020',
            'Call to Xerbi Qaraq (MI-Sen. Senator) on 1/10/2020',
            'Call on 1/15/2020'
        ]
        texts.forEach((el) => {
            expect(getAllByText(el)).toHaveLength(1)
        })
        expect(getAllByDisplayValue('http://www.cclcalls.org?t=qwer')).toHaveLength(1)
    })
})
