import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Row, Col, Modal, Icon, Statistic, Typography } from 'antd';
import axios from '../../_util/axios-api';
import { authHeader } from '../../_util/auth/auth-header';
import { displayName } from '../../_util/district';


class Reports extends Component {

    state = {
        statistics: null
    }

    componentDidMount() {
        if (this.state.statistics === null) {
            this.fetchStatistics();
        }
    }

    fetchStatistics(cb) {
        if (this.props.district) {
            const requestOptions = {
                url: `/stats/${this.props.district.districtId}`,
                method: 'GET',
                headers: { ...authHeader(), 'Content-Type': 'application/json' },
            };
            axios(requestOptions).then((response)=>{
                const statistics = response.data;
                this.setState({statistics: statistics});
            }).catch((e) => {
                Modal.error({
                    title: "Error Loading Page",
                    content: e.message,
                });
                this.setState({fetchError: e.message})
            })
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.district !== this.props.district) {
            this.setState({statistics: null});
            this.fetchStatistics();
        }
    }

    getChartData = (data) => {
        const formatted = Object.keys(data['callersByMonth']).map((el)=>{
            const numCallers = data['callersByMonth'][el]
            const numCalls = data['callsByMonth'][el] || 0
            return {date: el, Callers: numCallers, Calls: numCalls};
        });
        return formatted.slice(0, 11);
    }

    render() {
        const statistics = this.state.statistics;
        const antIconBig = <Icon type="loading" style={{ fontSize: 28 }} spin />
        const antIconHuge = <Icon type="loading" style={{ fontSize: 72 }} spin />
        const districtTitle = this.props.district ? `${displayName(this.props.district)} ` : "";

        return <>
            <Typography.Title level={2}>{districtTitle}Activity Reports</Typography.Title>
            <Row>
                <Col span={8}>
                {
                    statistics ?
                    <Statistic title={<Typography.Text>Total Callers </Typography.Text>} value={ statistics.totalCallers } /> :
                    antIconBig
                }
                </Col>
                <Col span={8}>
                {
                    statistics ?
                    <Statistic title={<Typography.Text>Total Calls </Typography.Text>} value={ statistics.totalCalls } /> :
                    antIconBig
                }
                </Col>
                <Col span={8}>
                {
                    statistics ?
                    <Statistic title={<Typography.Text>Past {statistics.recentDayCount} Days Call Count</Typography.Text>} value={ statistics.totalRecentCalls } /> :
                    antIconBig
                }
                </Col>
            </Row>
            <Row style={{marginTop: "40px"}}>
                <Col>
                    <ResponsiveContainer className="container" height={400} width='100%'>
                        { statistics ?
                            <LineChart
                                width={500}
                                height={300}
                                data={this.getChartData(statistics)}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="Callers" stroke="#8884d8"  />
                                <Line type="monotone" dataKey="Calls" stroke="#901111"  />
                            </LineChart> :
                            antIconHuge
                        }
                    </ResponsiveContainer>
                    <Typography.Text>Note: Chart call count for most recent month will increase throughout the month.</Typography.Text>
                </Col>
            </Row>
        </>;
    }
}


const mapStateToProps = state => {
    return {
        district: state.districts.selected,
    };
};

export default connect(mapStateToProps)(Reports);
