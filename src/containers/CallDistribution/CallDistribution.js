import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Button, Col, InputNumber, Modal, Skeleton, Form, Row, Typography} from 'antd';

import axios, { getErrorMessage } from '../../_util/axios-api';
import { authHeader } from '../../_util/auth/auth-header';

import styles from './CallDistribution.module.css';

import {
    isSenatorDistrict,
    getAssociatedSenators,
    displayName,
    comparator as districtComparator,
    slug as districtSlug
} from '../../_util/district';

class CallDistribution extends Component {

    state = {
        hydratedDistrict: null,
        associatedSenators: null,
        editing: false,
        total: null,
    }

    componentDidMount() {
        if (this.state.hydratedDistrict === null) {
            this.fetchData();
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.district !== this.props.district) {
            this.setState({hydratedDistrict: null});
            this.fetchData();
        } else if (this.props.form) {
            if (this.state.total !== this.getCurrentTotal()) {
                this.updateTotal(this.getCurrentTotal());
            }
        }
    }

    getCurrentTotal = () => {
        const currentValues = this.props.form.getFieldsValue();
        const total = Object.keys(currentValues).filter((el)=>{
            return el !== 'hidden'
        }).map((el)=>{
            return currentValues[el];
        }).reduce((el, acc) => {
            return el + acc;
        }, 0);
        return total;
    }

    getCallTargetRequestBodyComponent = () => {
        const currentValues = this.props.form.getFieldsValue();
        return Object.keys(currentValues).filter((el)=>{
            return el !== 'hidden'
        }).map((el)=>{
            return {
                "targetDistrictId": el,
                "percentage": currentValues[el]
            }
        })
    }

    updateTotal = (newTotal) => {
        this.setState({total: newTotal});
    }

    fetchData = (cb) => {
        // if (cb && this.state.hydratedDistrict) {
            // const dis = {...this.state.hydratedDistrict}
            // dis.callTarget = [] // why am i doing this?
            // this.setState({hydratedDistrict: dis},()=>{
            //     this.doFetchData(cb)
            // })
        // } else {
            this.doFetchData(cb)
        // }
    }

    doFetchData(cb) {

        // TODO: Promise.all

        if (this.props.district) {
            const requestOptions = {
                url: `/districts/${this.props.district.districtId}`,
                method: 'GET',
                headers: { ...authHeader(), 'Content-Type': 'application/json' },
            };
            axios(requestOptions).then((response)=>{
                const district = response.data;
                if (district.districtId === this.props.district.districtId) {
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
        <Skeleton loading={this.state.hydratedDistrict === null}>
            {this.state.hydratedDistrict &&
                <div style={{padding: "10px"}}>
                    <Typography.Title level={2}>
                        {displayName(this.state.hydratedDistrict)} ({this.state.hydratedDistrict.repLastName}) Call Distribution
                    </Typography.Title>
                    <Typography.Paragraph>
                        Direct calls to your various elected officials by setting the percentage of your district's overall call volume to the proportion that you'd like each of them to receive.
                    </Typography.Paragraph>
                    <Typography.Paragraph>

                    </Typography.Paragraph>
                </div>
            }
        </Skeleton>);
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const self = this;
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const {districtId, state, number, repFirstName, repLastName, repImageUrl, status} = this.state.hydratedDistrict
                const body = {
                    districtId,
                    state,
                    number,
                    repFirstName,
                    repLastName,
                    repImageUrl,
                    status
                }
                body["callTargets"] = this.getCallTargetRequestBodyComponent()
                this.setState({editing: true},()=>{
                    const requestOptions = {
                        url: `/districts/${this.props.district.districtId}/`,
                        method: 'PUT',
                        headers: { ...authHeader(), 'Content-Type': 'application/json' },
                        data: body
                    };
                    axios(requestOptions).then((response)=>{
                    }).catch((e) => {
                        Modal.error({
                            title: "Error updating call distribution",
                            content: getErrorMessage(e),
                        });
                    }).then(()=>{
                        this.fetchData(()=>{self.setState({editing: false})})
                    })
                })
            }
        });
    }

    distribution = () => {

        if (this.state.hydratedDistrict === null || this.state.associatedSenators === null || this.state.editing) {
            return <></>
        }

        const { getFieldDecorator } = this.props.form;

        const distributableDistricts = this.state.associatedSenators.concat(this.state.hydratedDistrict).sort(districtComparator);

        const formItemLayout = {
            labelCol: { span: 12},
            wrapperCol: { span: 4 }
          };

        const rows = distributableDistricts.map((district) => {
            const currentDistribution = this.state.hydratedDistrict.callTargets.find((target) => {
                return target.targetDistrictId === district.districtId
            });
            return (
                <Form.Item
                    key={district.districtId}
                    label={(<Typography.Text>{displayName(district)} {district.repLastName} (<a href={`http://www.cclcalls.org/call/${district.state}/${district.number}`} target="_blank" rel="noopener noreferrer">Call-In Guide</a>)</Typography.Text>)}
                    >
                    {getFieldDecorator(`${district.districtId}`, {
                        rules: [
                            {required: true, message: 'Set a percentage 0-100'}
                        ],
                        initialValue: parseInt(currentDistribution && currentDistribution.percentage) || 0
                    })(<InputNumber max={100} min={0} />)}
                </Form.Item>
            )
        });

        const totalColor = this.state.total === 100 ? "green" : "red";

        return (
            <Row>
                <Col span={22} offset={1}>
                    <Form className={styles.DistributionForm} {...formItemLayout} hideRequiredMark layout='horizontal' onSubmit={this.handleSubmit}>
                        {rows}
                        <Form.Item key="submit" wrapperCol={{ span: 14, offset: 5 }}>
                            <Button type="primary" htmlType="submit" disabled={this.state.total !== 100}>
                                Save
                            </Button>
                        </Form.Item>
                        <Typography.Text style={{color: totalColor}}>Total: {this.state.total}% </Typography.Text>
                        {this.state.total !== 100 ? <><br /> <Typography.Text style={{color: totalColor}}>Distribution must add to 100%.</Typography.Text></> : null}
                    </Form>
                </Col>
            </Row>
        );
    }

    render = () => {
        if (isSenatorDistrict(this.props.district)) {
            return <Redirect to={`/script/${districtSlug(this.props.district)}`} />;
        }
        return <>
            {this.header()}
            {this.distribution()}
        </>;
    }
}

const CallDistributionPage = Form.create(
    {
        name: 'call_targets_page',

    })(CallDistribution);

export default CallDistributionPage;
