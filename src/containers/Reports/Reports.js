import React, { Component } from "react";
import DistrictReport from "./DistrictReport.js";

class Reports extends Component {
  render() {
    return <DistrictReport district={this.props.district} />;
  }
}

export default Reports;
