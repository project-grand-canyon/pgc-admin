import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button, Card, Icon, InputNumber, List, Modal, message, Skeleton, Form, Popconfirm, Typography, Spin} from 'antd';

import axios from '../../_util/axios-api';
import { authHeader } from '../../_util/auth/auth-header';

import { isSenatorDistrict, getAssociatedSenators, displayName } from '../../_util/district';

class CallDistribution extends Component {

    state = {
        hydratedDistrict: null,
        associatedSenators: null,
        savingEdits: false,
        updatedRequest: null,
    }

    componentDidMount() {
        if (this.state.hydratedDistrict == null) {
            this.fetchData();
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.district != this.props.district) {
            this.setState({hydratedDistrict: null});
            this.fetchData();
        }
    }

    // "callTargets": [
    //     {
    //         "targetDistrictId": 8,
    //         "percentage": 10
    //     },
    //     {
    //         "targetDistrictId": 5,
    //         "percentage": 90
    //     }
    // ],

    fetchData(cb) {
        if (cb && this.state.hydratedDistrict) {
            const dis = {...this.state.hydratedDistrict}
            dis.callTarget = [] // why am i doing this?
            this.setState({hydratedDistrict: dis},()=>{
                this.doFetchData(cb)
            })
        } else {
            this.doFetchData(cb)
        }
    }

    doFetchData(cb){

        // TODO: Promise.all

        if (this.props.district) {
            const requestOptions = {
                url: `/districts/${this.props.district.districtId}/hydrated`,
                method: 'GET',
                headers: { ...authHeader(), 'Content-Type': 'application/json' },
            };
            axios(requestOptions).then((response)=>{
                const district = response.data;
                if (district.districtId == this.props.district.districtId) {
                    this.setState({hydratedDistrict: district});
                }
            }).catch((e) => {
                Modal.error({
                    title: "Error Loading Page",
                    content: e.message,
                });
                this.setState({fetchError: e.message})
            }).then(()=>{
                cb && cb()
            })

            const allDistrictsRequestOptions = {
                url: `/districts`,
                method: 'GET',
                headers: { ...authHeader(), 'Content-Type': 'application/json' },
            };
            axios(allDistrictsRequestOptions).then((response)=>{
                console.log(response.data);
                const associatedSenators = getAssociatedSenators(this.props.district, response.data);
                this.setState({associatedSenators: associatedSenators});
            }).catch((e) => {
                // TODO: Better error messaging to user
                console.log(e)
            });
        }
    }

    header = () => {
        return (
        <Skeleton loading={this.state.hydratedDistrict == null}>
            {this.state.hydratedDistrict &&
                <div style={{padding: "10px"}}>
                    <Typography.Title level={2}>
                        {displayName(this.state.hydratedDistrict)} ({this.state.hydratedDistrict.repLastName}) Call Distribution
                    </Typography.Title>
                    <Typography.Paragraph>
                        Use this page to direct calls to the elected officials that represent your district. 
                    </Typography.Paragraph>
                </div>
            }
        </Skeleton>);
    }

    handleSubmit = () => {

    }

    distribution = () => {

        if (this.state.hydratedDistrict == null || this.state.associatedSenators == null || this.state.savingEdits) {
            return <></>
        }

        const { getFieldDecorator } = this.props.form;
        const isLoading = this.state.hydratedDistrict === null;

        const distributableDistricts = this.state.associatedSenators.concat(this.state.hydratedDistrict);

        const rows = distributableDistricts.map((district) => {
            console.log(displayName(district))
            const currentDistribution = this.state.hydratedDistrict.callTargets.find((target) => {
                return target.targetDistrictId == district.districtId
            });
            console.log(currentDistribution && currentDistribution.percentage);
            return (
                <Form.Item key={district.districtId} label={`${displayName(district)} (${district.repLastName}):`}>
                    {getFieldDecorator(`d${district.districtId}`, {
                        rules: [
                            {required: true, message: 'Set a percentage 0-100'},
                            {type: 'integer', message: 'Set a percentage 0-100'},
                            {min: 0},
                            {max: 100}
                        ],
                        initialValue: currentDistribution && currentDistribution.percentage || 0
                    })(<InputNumber />)}
                </Form.Item>
            )
        });

        return <Form layout="vertical" onSubmit={this.handleSubmit}>
                <Skeleton loading={isLoading}>
                        { this.state.hydratedDistrict &&
                            <>
                                <h4>Distros</h4>
                                {rows}
                            </>
                        }
                </Skeleton>
                <Skeleton loading={isLoading}>
                    <Form.Item wrapperCol={{ span: 12, offset: 5 }} >
                        <Button type="primary" htmlType="submit">
                            Save
                        </Button>
                    </Form.Item>
                </Skeleton>
            </Form>

        return <></>;
    }

    render() {
        if (isSenatorDistrict(this.props.district)) {
            return <Redirect to='/script'/>;
          }
          return <>
          {this.header()}
          {this.distribution()}
          {/* {this.talkingPointsSection()} */}
          {/* {this.actions()} */}
      </>;
    }
}

const mapStateToProps = state => {
    return { 
        district: state.districts.selected
    };
};

const CallDistributionPage = Form.create({ name: 'call_targets_page' })(CallDistribution);

export default connect(mapStateToProps)(CallDistributionPage);
