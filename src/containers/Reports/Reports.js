import React, { Component } from "react";
import { connect } from "react-redux";
import { Divider, Modal } from "antd";
import { isSenatorDistrict } from "../../_util/district";
import DistrictReport from "./DistrictReport";
import {getStatistics} from "../../_util/axios-api";
import groupBy from "../../_util/groupBy"

class Reports extends Component {

  state = {
    statistics: null
  }

  componentDidMount() {
    if (this.state.statistics === null) {
      this.fetchStatistics();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.district !== this.props.district) {
      this.setState({ statistics: null });
      this.fetchStatistics();
    }
  }

  reportedDistricts() {
    const reportedDistricts = new Set();
    if (this.props.district){
      reportedDistricts.add(this.props.district)
    }
    this.senatorDistricts().forEach((el) => {
      reportedDistricts.add(el)
    })
    return Array.from(reportedDistricts)
  }

  districtsInState() {
    const { district, districts } = this.props;
    if (!district || !districts) {
      return []
    }
    return districts.filter((el) => el.state === district.state)
  }

  senatorDistricts() {
    return this.districtsInState().filter(isSenatorDistrict)
  }

  fetchStatistics() {    
    Promise.all(this.districtsInState().map( getStatistics )).then((allStats)=>{   
      const responses = allStats.map(el=>el.data)
      const statistics = groupBy(responses, "districtId")
      Object.keys(statistics).forEach(el => {
        statistics[el] = statistics[el][0] // groupBy values are arrays. Convert to first obj
      })
      const stateStats = responses.reduce((prev, curr) => {
        prev['totalCallers'] = prev['totalCallers'] + curr['totalCallers']
        prev['totalRecentCalls'] = prev['totalRecentCalls'] + curr['totalRecentCalls']
        Object.keys(curr['callersByMonth']).forEach(month => {
          const existing = prev['callersByMonth'][month] || 0
          prev['callersByMonth'][month] = curr['callersByMonth'][month] + existing
        })
        Object.keys(curr['remindersByMonth']).forEach(month => {
          const existing = prev['remindersByMonth'][month] || 0
          prev['remindersByMonth'][month] = curr['remindersByMonth'][month] + existing
        })
        return prev
      }, {
        totalCallers: 0,
        totalRecentCalls: 0,
        callersByMonth: {},
        remindersByMonth: {}
      })
      this.senatorDistricts().map((el)=>{
        return el.districtId
      }).forEach(districtId => {
        statistics[districtId]['totalCallers'] = stateStats['totalCallers']
        statistics[districtId]['remindersByMonth'] = stateStats['remindersByMonth']
        statistics[districtId]['callersByMonth'] = stateStats['callersByMonth']
      });
      this.setState({statistics})
    }).catch(e=>{
      Modal.error({
        title: "Error Loading Page",
        content: e.message,
      });
      this.setState({ fetchError: e.message });
    })
  }

  render() {
    return this.reportedDistricts().map((el, index) => {
      const stats = this.state.statistics == null ? null : this.state.statistics[el.districtId]
      return(
        <div key={el.districtId.toString()}>
          {index > 0 && <Divider />}
          <DistrictReport district={el} stats={stats}/>
        </div>
      )
      });
  }
}

const mapStateToProps = state => {
  return {
    districts: state.districts.districts
  };
};

export default connect(mapStateToProps)(Reports);
