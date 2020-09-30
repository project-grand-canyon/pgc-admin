import React, { Component } from "react";
import { connect } from "react-redux";
import { Divider } from "antd";
import { isSenatorDistrict, comparator } from "../../_util/district";
import DistrictReport from "./DistrictReport";

class Reports extends Component {
  render() {
    const district = this.props.district;
    const reportedDistricts = [];
    if (district) {
      reportedDistricts.push(district);
    }
    if (district && !isSenatorDistrict(district)) {
      const senators = this.props.districts
        .filter((el) => el.state === district.state && isSenatorDistrict(el))
        .sort(comparator);
      reportedDistricts.push(...senators);
    }
    return reportedDistricts.map((el, index) =>
      <div key={el.districtId.toString()}>
        {index > 0 && <Divider />}
        <DistrictReport district={el} />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    districts: state.districts.districts
  };
};

export default connect(mapStateToProps)(Reports);
