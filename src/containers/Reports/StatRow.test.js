import React from "react"
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import StatRow from "./StatRow";
import { Row, Col, Statistic, Typography } from "antd"

jest.mock("antd", () => {
	return {
		Row: jest.fn(({ children }) => {
			return children;
		}),
		Col: jest.fn(({ children }) => {
			return children;
		}),
		Typography: {
			Text: jest.fn()
		},
		Statistic: jest.fn((...props) => {
			return <div data-testid={props[0]['data-testid']}>{props[0]['value']}</div>
		})
	}
});

afterEach(() => {
	Col.mockReset();
	Row.mockReset();
	Statistic.mockReset();
	Col.mockImplementation(jest.fn(({ children }) => {
		return children;
	}));
	Row.mockImplementation(jest.fn(({ children }) => {
		return children;
	}));
	Statistic.mockImplementation(jest.fn((...props) => {
		return <div data-testid={props[0]['data-testid']}>{props[0]['value']}</div>
	}));
})

test("0 calls and 0 callers", () => {
	const response = {
		totalCalls: 0,
		totalCallers: 0,
		recentDayCount: 31,
		totalRecentCalls: 0,
		callsByMonth: {
			"2020-02": 0,
			"2020-03": 0,
			"2020-04": 0,
		},
		callersByMonth: {
			"2020-02": 0,
			"2020-03": 0,
			"2020-04": 0,
		},
		activeCallersByMonth: {
			"2020-02": 0,
			"2020-03": 0,
			"2020-04": 0,
		},
		remindersByMonth: {
			"2020-02": 0,
			"2020-03": 0,
			"2020-04": 0,
		},
		months: ["2020-02", "2020-03", "2020-04"],
		completionRate: null,
	};
	const { getByTestId } = render(<StatRow statistics={response} />);
	expect(Row).toBeCalledTimes(1);
	expect(Col).toBeCalledTimes(4);
	expect(Statistic).toBeCalledTimes(4);
	const totalCallersStatistic = getByTestId("totalCallersStatistic");
	expect(totalCallersStatistic).toHaveTextContent(0);
	const totalCallsStatistic = getByTestId("totalCallsStatistic");
	expect(totalCallsStatistic).toHaveTextContent(0);
	const dayCounterStatistic = getByTestId("dayCounterStatistic");
	expect(dayCounterStatistic).toHaveTextContent(0);
	const completionRateStatistic = getByTestId("completionRateStatistic");
	expect(completionRateStatistic).toHaveTextContent("Und.");
});

test("More than 0 calls and 0 callers", () => {
	const response = {
		totalCalls: 25,
		totalCallers: 0,
		recentDayCount: 31,
		totalRecentCalls: 5,
		callsByMonth: {
			"2020-02": 3,
			"2020-03": 2,
			"2020-04": 4,
		},
		callersByMonth: {
			"2020-02": 0,
			"2020-03": 0,
			"2020-04": 0,
		},
		activeCallersByMonth: {
			"2020-02": 0,
			"2020-03": 0,
			"2020-04": 0,
		},
		remindersByMonth: {
			"2020-02": 0,
			"2020-03": 0,
			"2020-04": 0,
		},
		months: ["2020-02", "2020-03", "2020-04"],
		completionRate: 100,
	};
	const { getByTestId } = render(<StatRow statistics={response} />);
	expect(Row).toBeCalledTimes(1);
	expect(Col).toBeCalledTimes(4);
	expect(Statistic).toBeCalledTimes(4);
	const totalCallersStatistic = getByTestId("totalCallersStatistic");
	expect(totalCallersStatistic).toHaveTextContent(0);
	const totalCallsStatistic = getByTestId("totalCallsStatistic");
	expect(totalCallsStatistic).toHaveTextContent(25);
	const dayCounterStatistic = getByTestId("dayCounterStatistic");
	expect(dayCounterStatistic).toHaveTextContent(5);
	const completionRateStatistic = getByTestId("completionRateStatistic");
	expect(completionRateStatistic).toHaveTextContent(100);
});

test("0 calls and more than 0 callers", () => {
	const response = {
		totalCalls: 0,
		totalCallers: 29,
		recentDayCount: 31,
		totalRecentCalls: 0,
		callsByMonth: {
			"2020-02": 0,
			"2020-03": 0,
			"2020-04": 0,
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
		completionRate: 0,
	};
	const { getByTestId } = render(<StatRow statistics={response} />);
	expect(Row).toBeCalledTimes(1);
	expect(Col).toBeCalledTimes(4);
	expect(Statistic).toBeCalledTimes(4);
	const totalCallersStatistic = getByTestId("totalCallersStatistic");
	expect(totalCallersStatistic).toHaveTextContent(29);
	const totalCallsStatistic = getByTestId("totalCallsStatistic");
	expect(totalCallsStatistic).toHaveTextContent(0);
	const dayCounterStatistic = getByTestId("dayCounterStatistic");
	expect(dayCounterStatistic).toHaveTextContent(0);
	const completionRateStatistic = getByTestId("completionRateStatistic");
	expect(completionRateStatistic).toHaveTextContent(0);
});

test("More than 0 calls and callers", () => {
	const response = {
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
	const { getByTestId } = render(<StatRow statistics={response} />);
	expect(Row).toBeCalledTimes(1);
	expect(Col).toBeCalledTimes(4);
	expect(Statistic).toBeCalledTimes(4);
	const totalCallersStatistic = getByTestId("totalCallersStatistic");
	expect(totalCallersStatistic).toHaveTextContent(29);
	const totalCallsStatistic = getByTestId("totalCallsStatistic");
	expect(totalCallsStatistic).toHaveTextContent(25);
	const dayCounterStatistic = getByTestId("dayCounterStatistic");
	expect(dayCounterStatistic).toHaveTextContent(5);
	const completionRateStatistic = getByTestId("completionRateStatistic");
	expect(completionRateStatistic).toHaveTextContent(100);
});
