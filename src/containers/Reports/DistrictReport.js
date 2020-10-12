import React, { Component } from "react";
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
import { Row, Col, Popover, Icon, Statistic, Typography } from "antd";
import { displayName } from "../../_util/district";
import CustomToolTip from "./CustomToolTip.js";

const TopLineStat = ({ title, value }) => {
  const antIconBig = <Icon type="loading" style={{ fontSize: 28 }} spin />;
  return (
    <Col span={4}>
      {value ? (
        <Statistic
          title={
              <Typography.Text>
                {title}
              </Typography.Text>
          }
          value={value}
        />
      ) : (
        antIconBig
      )}
    </Col>
  )
}

class DistrictReport extends Component {
  getChartData = (data) => {
    const formatted = Object.keys(data["callersByMonth"])
      .sort()
      .map((el) => {
        const numCallers = data["callersByMonth"][el];
        const numCalls = data["callsByMonth"][el] || 0;
        const numRemindersSent = data["remindersByMonth"][el] || 0;
        return {
          date: el,
          Callers: numCallers,
          Calls: numCalls,
          Reminders: numRemindersSent,
        };
      });
    const previousTwelveMonths = formatted.slice(-12);
    return previousTwelveMonths;
  };

  render() {
    const statistics = this.props.stats;
    const antIconHuge = <Icon type="loading" style={{ fontSize: 72 }} spin />;
    const districtTitle = this.props.district
      ? `${displayName(this.props.district)} `
      : "";

    let completionRate = 0;
    if (statistics) {
      const totalActiveCallers = Object.values(
        statistics["activeCallersByMonth"]
      ).reduce((acc, curr) => {
        return acc + curr;
      }, 0);
      const totalReminders = Object.values(
        statistics["remindersByMonth"]
      ).reduce((acc, curr) => {
        return acc + curr;
      }, 0);
      completionRate = totalReminders
        ? ((totalActiveCallers / totalReminders) * 100).toFixed(1)
        : 0;
    }

    const explainer = statistics ? (
      <Row>
        <Col>
          <Popover title="What do these mean?" content={
            <>
            <Typography.Paragraph>
            Total Callers is the count of total callers in this district who are not paused.
            </Typography.Paragraph>
            <Typography.Paragraph>
            Total Calls is the count of calls made to this Member of Congress.
            </Typography.Paragraph>
            <Typography.Paragraph>
            Active Callers is the count of callers in this district who made at least 1 call to either their Senators or Representative.
            </Typography.Paragraph>
            <Typography.Paragraph>
            Completion Rate is the percentage of the total callers who are active
            </Typography.Paragraph>
          </>
          }>
            <Typography.Title level={4}>What do these mean?</Typography.Title>
          </Popover>
        </Col>
      </Row>
    ) : null;

    return (
      <>
        <Typography.Title level={2}>
          {districtTitle}Activity Reports
        </Typography.Title>
        { explainer }
        <Row type="flex" justify="space-around">
          <TopLineStat title="Total Callers" value={statistics && statistics.totalCallers} />
          <TopLineStat title="Total Calls" value={statistics && statistics.totalCalls} />
          <TopLineStat title={`Past ${statistics && statistics.recentDayCount} Days Call Count`} value={statistics && statistics.totalRecentCalls} />
          <TopLineStat title={`Past ${statistics && statistics.recentDayCount} Days Active Caller Count`} value={ statistics && statistics.totalRecentActiveCallers } />
          <TopLineStat title="Completion Rate" value={ statistics && completionRate + "%"} />
        </Row>
        <Row style={{ marginTop: "40px" }}>
          <Col>
            <ResponsiveContainer
              className="container"
              height={400}
              width="100%"
            >
              {statistics ? (
                <LineChart
                  width={500}
                  height={300}
                  data={this.getChartData(statistics)}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomToolTip />} />
                  <Legend />
                  <Line type="monotone" dataKey="Callers" stroke="#8884d8" />
                  <Line type="monotone" dataKey="Calls" stroke="#901111" />
                  <Line type="monotone" dataKey="Reminders" stroke="#3256a8" />
                </LineChart>
              ) : (
                antIconHuge
              )}
            </ResponsiveContainer>
            <Typography.Text>
              Note: Chart call count for most recent month will increase
              throughout the month.
            </Typography.Text>
          </Col>
        </Row>
      </>
    );
  }
}

export default DistrictReport;
