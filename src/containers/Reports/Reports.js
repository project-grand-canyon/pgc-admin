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
    relevantDistricts: [],
    error: null,
  };

  componentDidMount() {
    console.log('comp did mount')
    if (this.state.statistics === null) {
      console.log('call fetch')
      this.fetchStatistics();
    }
  }

  componentDidUpdate(prevProps) {
    console.log('comp did update')
    console.log(prevProps)
    console.log(this.props)
    const allDistrictsUpdated = (prevProps.districts !== this.props.districts) && this.props.districts.length > 0
    const selectedDistrictUpdated = prevProps.district !== this.props.district
    if (allDistrictsUpdated || selectedDistrictUpdated) {
      console.log('comp did update - fetch')
      this.fetchStatistics();
    } else {
      console.log('comp did update - no fetch')
    }
  }

  fetchStatistics() {
    console.log('fetchStastistics')
    console.log(this.props.districts)
    console.log(this.props.district)

    if (!this.props.district || !this.props.districts || this.props.districts.length === 0) {
      console.log('early return')
      return
    }
    
    const relevantDistricts = [this.props.district].concat(getAssociatedSenators(this.props.district, this.props.districts))
    console.log(relevantDistricts)

    this.setState({
      relevantDistricts,
      statistics: null
    }, () => {

      getReportData(relevantDistricts, (error, statistics) => {
        if (error || !statistics) {
          console.log(`error: ${error}`)
          this.setState({ error: <h1> Some Statistics Not Found </h1> });
        } else {
          this.setState({ statistics: statistics });
        }
      });
    })
  }

  render() {
    console.log('render')
    const { error, statistics } = this.state;
    if (error) {
      return <>{error}</>;
    }

    const distRenders = this.state.relevantDistricts.map((district, index) => {
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
  return {
    districts: state.districts.districts,
  };
};

export default connect(mapStateToProps)(Reports);

