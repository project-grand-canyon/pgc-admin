import React, { Component } from "react";
import { connect } from "react-redux";
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
import { Row, Col, Icon, Statistic, Typography } from "antd";
import axios from "../../_util/axios-api";
import { authHeader } from "../../_util/auth/auth-header";
import { displayName, getAssociatedSenators } from "../../_util/district";

class Reports extends Component {
  state = {
    statistics: null,
    error: null
  };

  componentDidMount() {
    if (this.state.statistics === null) {
      this.fetchStatistics();
    }
  }

  fetchStatistics() {
    if (this.props.selected) {
      const promises = this.props.districts.map(el => {
        return axios.get(`/stats/${el.districtId}`, {
          headers: { ...authHeader(), "Content-Type": "application/json" },
        });
      });
      Promise.all(promises)
        .then((responses) => {
          const statistics = responses.map(function (response) {
            return response.data;
          });
          this.setState({ statistics: statistics });
        })
        .catch(() => {
          this.setState({ error: <h1> Some Statistics Not Found </h1> })
        });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.selected !== this.props.selected) {
      this.setState({ statistics: null });
      this.fetchStatistics();
    }
  }

  getChartData = (data) => {
    const formatted = Object.keys(data["callersByMonth"]).map(function (el) {
      const numCallers = data["callersByMonth"][el];
      const numCalls = data["callsByMonth"][el] || 0;
      return { date: el, Callers: numCallers, Calls: numCalls };
    });
    return formatted.slice(0, 11);
  };
  render() {
    const statistics = this.state.statistics;
    const error = this.state.error;
    const districts = this.props.districts;
    let distRenders = [];
    if (statistics) {
      for (let index = 0; index < districts.length; ++index) {
        const antIconBig = (
          <Icon type="loading" style={{ fontSize: 28 }} data-testid="Big Spin" spin />
        );
        const antIconHuge = (
          <Icon type="loading" style={{ fontSize: 72 }} data-testid="Huge Spin" spin />
        );
        const districtTitle = districts[index]
          ? `${displayName(districts[index])} `
          : "";
        distRenders.push(
          <ul key={index}>
            <Typography.Title level={2} data-testid="districtTitle">
              {districtTitle}Activity Reports
            </Typography.Title>
            <Row data-testid="statistics">
              <Col span={8} data-testid="totalCallersCol">
                {statistics[index] ? (
                  <Statistic
                    title={<Typography.Text data-testid="totalCallersText">Total Callers </Typography.Text>}
                    value={statistics[index].totalCallers}
                    data-testid="totalCallersStatistic"
                  />
                ) : (
                    antIconBig
                  )}
              </Col>
              <Col span={8} data-testid="totalCallsCol">
                {statistics[index] ? (
                  <Statistic data-testid="totalCallsStatistic"
                    title={<Typography.Text data-testid="totalCallsText">Total Calls </Typography.Text>}
                    value={statistics[index].totalCalls}
                  />
                ) : (
                    antIconBig
                  )}
              </Col>
              <Col span={8} data-testid="dayCounterCol">
                {statistics[index] ? (
                  <Statistic
                    title={
                      <Typography.Text data-testid="dayCounterText">
                        Past {statistics[index].recentDayCount} Days Call Count
                      </Typography.Text>
                    }
                    value={statistics[index].totalRecentCalls}
                    data-testid="dayCounterStatistic"
                  />
                ) : (
                    antIconBig
                  )}
              </Col>
            </Row>
            <Row style={{ marginTop: "40px" }} data-testid="graph">
              <Col data-testid="graphColumn">
                <ResponsiveContainer
                  className="container"
                  height={300}
                  width="100%"
                  data-testid="responsiveContainer"
                >
                  {statistics[index] ? (
                    <LineChart
                      width={400}
                      height={240}
                      data={this.getChartData(statistics[index])}
                      data-testid="lineChart"
                    >
                      <CartesianGrid strokeDasharray="3 3" data-testid="cartesianGrid" />
                      <XAxis dataKey="date" data-testid="xAxis" />
                      <YAxis data-testid="yAxis" />
                      <Tooltip data-testid="toolTip" />
                      <Legend data-testid="legend" />
                      <Line
                        type="monotone"
                        dataKey="Callers"
                        stroke="#8884d8"
                        data-testid="line"
                      />
                      <Line type="monotone" dataKey="Calls" stroke="#901111" />
                    </LineChart>
                  ) : (
                      antIconHuge
                    )}
                </ResponsiveContainer>
              </Col>
            </Row>
          </ul>
        );
      }
    }
    return (
      <>
        {error} ? (
        <>
          {error}
        </>
        ) : (
        {statistics ? (
          <>
            {distRenders}
            <Typography.Text>
              Note: Chart call count for most recent month will increase
              throughout the month.
            </Typography.Text>{" "}
          </>
        ) : (
            <h1 data-testid="loading">loading...</h1>
          )}
        )
      </>
    );
  }
}

const mapStateToProps = (state) => {

  const selected = state.districts.selected;

  const districts = [
    selected,
    ...getAssociatedSenators(
      selected,
      state.districts.districts
    ),
  ]

  return {
    selected: selected,
    districts: districts,
  };
};

export default connect(mapStateToProps)(Reports);
