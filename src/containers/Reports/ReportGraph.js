import React from "react";
import { Icon } from "antd";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import CustomToolTip from "./CustomToolTip";

const getChartData = (data) => {
  const months = data.months;
  const previousTwelveMonths = months.slice(-12);
  const formatted = previousTwelveMonths.map((el) => {
    const numCallers = data["callersByMonth"][el] || 0;
    const numActiveCallers = data["activeCallersByMonth"][el] || 0;
    const numRemindersSent = data["remindersByMonth"][el] || 0;
    return {
      date: el,
      Callers: numCallers,
      Calls: numActiveCallers,
      Reminders: numRemindersSent,
    };
  });
  return formatted;
};

const reportGraph = ({ statistics }) => {
  return (
    <ResponsiveContainer
      className="container"
      height={300}
      width="100%"
      data-testid="responsiveContainer"
    >
      {statistics ? (
        <LineChart
          width={400}
          height={240}
          data={getChartData(statistics)}
          data-testid="lineChart"
        >
          <CartesianGrid strokeDasharray="3 3" data-testid="cartesianGrid" />
          <XAxis dataKey="date" data-testid="xAxis" />
          <YAxis data-testid="yAxis" />
          <Tooltip data-testid="toolTip" content={<CustomToolTip />} />
          <Legend data-testid="legend" />
          <Line
            type="monotone"
            dataKey="Callers"
            stroke="#8884d8"
            data-testid="callersLine"
          />
          <Line
            type="monotone"
            dataKey="Calls"
            stroke="#901111"
            data-testid="callsLine"
          />
          <Line
            type="monotone"
            dataKey="Reminders"
            stroke="#3256a8"
            data-testid="remindersLine"
          />
        </LineChart>
      ) : (
        <Icon
          type="loading"
          style={{ fontSize: 72 }}
          data-testid="Huge Spin"
          spin
        />
      )}
    </ResponsiveContainer>
  );
};

export default reportGraph;
