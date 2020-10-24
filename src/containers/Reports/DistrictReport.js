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
import { Row, Col, Icon, Popover, Statistic, Typography } from "antd";
import Explainer from "./Explainer";
import { displayName } from "../../_util/district";
import CustomToolTip from "./CustomToolTip.js";

const TopLineStat = ({ title, value }) => {
  const antIconBig = <Icon type="loading" style={{ fontSize: 28 }} spin />;
  return (
    <Col span={4}>
      {value ? (
        <Statistic
          title={<Typography.Text>{title}</Typography.Text>}
          value={value}
        />
      ) : (
        antIconBig
      )}
    </Col>
  );
};

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
    const { district, stats: statistics } = this.props;
    console.log(JSON.stringify(this.props))
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

    return (
      <>
        <Typography.Title level={2}>
          {districtTitle}Activity Reports
        </Typography.Title>
        <Row>
          <Col>
            <Popover
              title="What do these mean?"
              content={<Explainer isSenator={district.senatorDistrict} />}
            ><Typography.Title level={4}>What do these mean?</Typography.Title></Popover>
          </Col>
        </Row>
        <Row type="flex" justify="space-around">
          <TopLineStat title="Total Callers" value={statistics && statistics.totalCallers} />
          <TopLineStat title="Total Calls" value={statistics && statistics.totalCalls} />
          <TopLineStat title={`Past ${statistics && statistics.recentDayCount} Days Call Count`} value={statistics && statistics.totalRecentCalls} />
          <TopLineStat title={`Past ${statistics && statistics.recentDayCount} Days Active Caller Count`} value={ statistics && statistics.totalRecentActiveCallers } />
          { district.senatorDistrict ? null : <TopLineStat title="Completion Rate" value={ statistics && completionRate + "%"} /> }
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
