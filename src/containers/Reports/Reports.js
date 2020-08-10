import React, { Component } from "react";
import { connect } from "react-redux";

import { Row, Col, Typography } from "antd";
import axios from "../../_util/axios-api";
import { authHeader } from "../../_util/auth/auth-header";
import ReportGraph from "./ReportGraph";
import StatRow from "./StatRow";
import { displayName, getAssociatedSenators } from "../../_util/district";

class Reports extends Component {
  state = {
    statistics: null,
    error: null,
  };

  componentDidMount() {
    if (this.state.statistics === null) {
      this.fetchStatistics();
    }
  }

  fetchStatistics() {
    if (this.props.selected) {
      const promises = this.props.districts.map((el) => {
        return axios.get(`/stats/${el.districtId}`, {
          headers: { ...authHeader(), "Content-Type": "application/json" },
        });
      });
      Promise.all(promises)
        .then((responses) => {
          const rawStatistics = responses.map((response) => {
            const districtStatistic = response.data;
            const totalActiveCallers = Object.values(
              districtStatistic["activeCallersByMonth"]
            ).reduce((acc, curr) => {
              return acc + curr;
            }, 0);
            const totalReminders = Object.values(
              districtStatistic["remindersByMonth"]
            ).reduce((acc, curr) => {
              return acc + curr;
            }, 0);
            const completionRate = totalReminders
              ? ((totalActiveCallers / totalReminders) * 100).toFixed(1)
              : 0;
            districtStatistic["completionRate"] = completionRate;
            return districtStatistic;
          });
          const districtWithMostHistory = rawStatistics.reduce(
            (acc, districtStatistic, index) => {
              if (
                Object.keys(districtStatistic.activeCallersByMonth).length >
                Object.keys(rawStatistics[acc].activeCallersByMonth).length
              ) {
                acc = index;
              }
              return acc;
            },
            0
          );
          const monthsToUse = Object.keys(
            rawStatistics[districtWithMostHistory].activeCallersByMonth
          );
          const statistics = rawStatistics.map((districtStatistic) => {
            districtStatistic["months"] = monthsToUse;
            return districtStatistic;
          });
          this.setState({ statistics: statistics });
        })
        .catch(() => {
          this.setState({ error: <h1> Some Statistics Not Found </h1> });
        });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.selected !== this.props.selected) {
      this.setState({ statistics: null });
      this.fetchStatistics();
    }
  }

  render() {
    const { error, statistics } = this.state;
    if (error) {
      return <>{error}</>;
    }

    const distRenders = this.props.districts.map((district, index) => {
      const districtStatistics = statistics && statistics[index];
      return (
        <Row key={index}>
          <Col>
            <Typography.Title level={2} data-testid="districtTitle">
              {displayName(district)} Activity Reports
            </Typography.Title>
            <StatRow statistics={districtStatistics} />
            <Row style={{ marginTop: "40px" }} data-testid="graph">
              <Col data-testid="graphColumn">
                <ReportGraph statistics={districtStatistics} />
              </Col>
            </Row>
          </Col>
        </Row>
      );
    });
    return <>{distRenders}</>;
  }
}

const mapStateToProps = (state) => {
  const selected = state.districts.selected;

  const districts = [
    selected,
    ...getAssociatedSenators(selected, state.districts.districts),
  ];

  return {
    selected: selected,
    districts: districts,
  };
};

export default connect(mapStateToProps)(Reports);
