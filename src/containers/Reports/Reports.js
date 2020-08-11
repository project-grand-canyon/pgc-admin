import React, { Component } from "react";
import { connect } from "react-redux";

import { Row, Col, Typography } from "antd";
import { getReportData } from "../../_util/axios-api";
import ReportGraph from "./ReportGraph";
import StatRow from "./StatRow";
import { displayName, getAssociatedSenators } from "../../_util/district";

class Reports extends Component {
  state = {
    statistics: null,
    error: null,
  };

  componentDidMount() {
    if (this.state.statistics === null && this.props.selected) {
      this.fetchStatistics();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.selected !== this.props.selected) {
      this.setState({ statistics: null }, () => {
        this.fetchStatistics();
      });
    }
  }

  fetchStatistics() {
    console.log('fetchStatistics')
    console.log(this.props)
    getReportData(this.props.districts, (error, statistics) => {
      if (error || !statistics) {
        this.setState({ error: <h1> Some Statistics Not Found </h1> });
      } else {
        this.setState({ statistics: statistics });
      }
    });
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
  const { selected, districts: all } = state.districts;
  console.log('mapStateToProps2')
  console.log(state)
  console.log(selected)
  console.log(all)

  const districts = [
    selected,
    ...getAssociatedSenators(selected, all),
  ];

  return {
    selected: selected,
    districts: districts,
  };
};

export default connect(mapStateToProps)(Reports);
