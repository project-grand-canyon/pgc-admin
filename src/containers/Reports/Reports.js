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
  };

  componentDidMount() {
    if (this.state.statistics === null) {
      this.fetchStatistics();
    }
  }

  fetchStatistics() {
    if (this.props.districts) {
      const districts = this.props.districts;
      let promises = [];
      let responses = [];
      for (let index = 0; index < districts.length; ++index) {
        if (districts[index]) {
          const requestOptions = {
            url: `/stats/${districts[index].districtId}`,
            method: "GET",
            headers: { ...authHeader(), "Content-Type": "application/json" },
          };
          promises.push(
            axios(requestOptions).then((response) => {
              responses.push(response.data);
            })
          );
        }
      }
      Promise.all(promises).then(() => {
        this.setState({ statistics: responses });
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.district !== this.props.district) {
      this.setState({ statistics: null });
      this.fetchStatistics();
    }
  }

  getChartData = (data) => {
    const formatted = Object.keys(data["callersByMonth"]).map((el) => {
      const numCallers = data["callersByMonth"][el];
      const numCalls = data["callsByMonth"][el] || 0;
      return { date: el, Callers: numCallers, Calls: numCalls };
    });
    return formatted.slice(0, 11);
  };
  render() {
    const statistics = this.state.statistics;
    const districts = this.props.districts;
    let distRenders = [];
    if (statistics) {
      for (let index = 0; index < districts.length; ++index) {
        const antIconBig = (
          <Icon type="loading" style={{ fontSize: 28 }} spin />
        );
        const antIconHuge = (
          <Icon type="loading" style={{ fontSize: 72 }} spin />
        );
        const districtTitle = districts[index]
          ? `${displayName(districts[index])} `
          : "";
        distRenders.push(
          <ul key={index}>
            <Typography.Title level={2}>
              {districtTitle}Activity Reports
            </Typography.Title>
            <Row>
              <Col span={8}>
                {statistics[index] ? (
                  <Statistic
                    title={<Typography.Text>Total Callers </Typography.Text>}
                    value={statistics[index].totalCallers}
                  />
                ) : (
                  antIconBig
                )}
              </Col>
              <Col span={8}>
                {statistics[index] ? (
                  <Statistic
                    title={<Typography.Text>Total Calls </Typography.Text>}
                    value={statistics[index].totalCalls}
                  />
                ) : (
                  antIconBig
                )}
              </Col>
              <Col span={8}>
                {statistics[index] ? (
                  <Statistic
                    title={
                      <Typography.Text>
                        Past {statistics[index].recentDayCount} Days Call Count
                      </Typography.Text>
                    }
                    value={statistics[index].totalRecentCalls}
                  />
                ) : (
                  antIconBig
                )}
              </Col>
            </Row>
            <Row style={{ marginTop: "40px" }}>
              <Col>
                <ResponsiveContainer
                  className="container"
                  height={300}
                  width="100%"
                >
                  {statistics[index] ? (
                    <LineChart
                      width={400}
                      height={240}
                      data={this.getChartData(statistics[index])}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="Callers"
                        stroke="#8884d8"
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
        {statistics ? (
          <>
            {distRenders}
            <Typography.Text>
              Note: Chart call count for most recent month will increase
              throughout the month.
            </Typography.Text>{" "}
          </>
        ) : (
          <h1>loading...</h1>
        )}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    district: state.districts.selected,
    districts: [
      state.districts.selected,
      ...getAssociatedSenators(
        state.districts.selected,
        state.districts.districts
      ),
    ],
  };
};

export default connect(mapStateToProps)(Reports);
