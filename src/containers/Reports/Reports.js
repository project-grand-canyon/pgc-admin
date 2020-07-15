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
import { Row, Col, Modal, Icon, Statistic, Typography } from "antd";
import axios from "../../_util/axios-api";
import { authHeader } from "../../_util/auth/auth-header";
import {
  displayName,
  isSenatorDistrict,
  getAssociatedSenators,
} from "../../_util/district";

class Reports extends Component {
  state = {
    districts: null,
    statistics: null,
  };

  componentDidMount() {
    if (this.state.districts === null) {
      this.fetchDistricts();
    }
    if (this.state.statistics === null) {
      this.fetchStatistics();
    }
  }

  fetchStatistics() {
    if (this.state.districts) {
      const districts = this.state.districts;
      let statistics = [];
      for (let index = 0; index < districts.length; ++index) {
        if (districts[index]) {
          const requestOptions = {
            url: `/stats/${districts[index].districtId}`,
            method: "GET",
            headers: { ...authHeader(), "Content-Type": "application/json" },
          };
          axios(requestOptions)
            .then((response) => {
              statistics.push(response.data);
              this.setState({ statistics: statistics });
            })
            .catch((e) => {
              Modal.error({
                title: "Error Loading Page",
                content: e.message,
              });
              this.setState({ fetchError: e.message });
            });
        }
      }
    }
  }
  fetchDistricts() {
    if (this.props.district) {
      if (isSenatorDistrict(this.props.district)) {
        this.setState({
          districts: this.props.state,
        });
      }
      const requestOptions = {
        url: `/districts`,
        method: "GET",
        headers: { ...authHeader(), "Content-Type": "application/json" },
      };
      axios(requestOptions)
        .then((response) => {
          const associatedSenators = getAssociatedSenators(
            this.props.district,
            response.data
          );
          this.setState({
            districts: [this.props.district, ...associatedSenators],
          });
        })
        .catch((e) => {
          Modal.error({
            title: "Error Loading Page",
            content: e.message,
          });
          this.setState({ fetchError: e.message });
        });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.district !== this.props.district) {
      this.setState({ districts: null, statistics: null });
      this.fetchDistricts();
    } else if (prevState.districts !== this.state.districts) {
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
    const districts = this.state.districts;
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
  };
};

export default connect(mapStateToProps)(Reports);
