import React, { Component } from 'react';
import { Button, Cascader, Col, Empty, Form, Input, Modal, Row, Spin, Tag, Typography } from 'antd';
import { withRouter, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import axios, { getErrorMessage } from '../../_util/axios-api';
import groupBy from '../../_util/groupBy';
import { authHeader } from '../../_util/auth/auth-header';
import { displayName } from '../../_util/district';
import { userActions } from '../../_actions';

// import styles from './SignUp.module.css';

class SignUp extends Component {

    constructor(props) {
        super(props);
        this.props.dispatch(userActions.logout());
    }

    empty = []

    state = {
        submissionStage: "unsubmitted",
        cascaderDistricts: null,
        congressionalDistrictsError: null,
        selectedDistricts: new Set(),
        districtsById: null
    };

    componentDidMount = () => {
        axios.get('districts').then((response)=>{
            const districts = response.data;
            const districtsByState = groupBy(districts, 'state');
            const cascaderDistricts = Object.keys(districtsByState).sort().map((state)=>{
                return {
                    value: state,
                    label: state,
                    children: districtsByState[state].sort((a, b)=> {
                        return parseInt(a.number) - parseInt(b.number)
                    }).map((district) =>{
                        return {
                            value: district.districtId,
                            label: `${displayName(district)} (${district.repLastName})`,
                        }
                    })
                }
            })

            const districtsById = groupBy(districts, 'districtId');
            this.setState({
                cascaderDistricts: cascaderDistricts,
                districtsById
            });
        })
        .catch((error) =>{
            this.setState({
                congressionalDistrictsError: error
            });
            Modal.error({
                title: 'There was an error loading the form',
                content: `${error.message}`,
              });
        });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        
        if (this.state.selectedDistricts.values().next().value === undefined) {
            Modal.error({
                title: "District Reqired",
                "content": "You must selected at least one district to administer"
            })
            return
        }

        this.props.form.validateFields((err, values) => {
            if (!err) {
                const fieldValues = {...values};
                fieldValues["districts"] = [...this.state.selectedDistricts];
                fieldValues["root"] = false;
                this.props.form.resetFields();
                this.setState({
                    submissionStage: "submitting"
                }, () => {
                    const requestOptions = {
                        url: `/admins/`,
                        method: 'POST',
                        headers: { ...authHeader(), 'Content-Type': 'application/json' },
                        data: fieldValues
                    };
                    axios(requestOptions).then((response)=>{
                        this.setState({submissionStage: "successfullySubmitted"})
                    }).catch((e) => {
                        Modal.error({
                            title: "Error Signing Up",
                            content: `${getErrorMessage(e)}`
                        });
                        this.setState({submissionStage: "unsubmitted"})
                    })
                });
            }
        });
    }

    onChangeDistrict = (value) => {
        const districtId = value.pop()
        const updatedDistricts = new Set(this.state.selectedDistricts)
        updatedDistricts.add(districtId)
        this.setState({
            selectedDistricts: updatedDistricts
        });
    }

    onRemoveDistrict = (districtId) => {
        console.log(districtId)

        if (this.state.selectedDistricts.has(districtId)) {

        const updatedDistricts = new Set(this.state.selectedDistricts)
        updatedDistricts.delete(districtId)
        this.setState({
            selectedDistricts: updatedDistricts
        });
    } else {
        console.log('not present')
    }
    }

    tagsJsx = () => {
        return [...this.state.selectedDistricts].map( (dist) => {
            const district = this.state.districtsById[dist][0]
            return district ? <Tag key={dist} closable onClose={e => { this.onRemoveDistrict(dist)} }> {`${displayName(district)}`}</Tag> : null;
        })
    }

    render() {

        if (this.props.loggedIn) {
            return <Redirect to="/dashboard" />
        }

        if (this.state.congressionalDistrictsError !== null) {
            return <Empty description="There was an error loading this form. Please try again later." />
        }

        if (this.state.cascaderDistricts === null || this.state.submissionStage === "submitting") {
            return <Spin size="large" />;
        }

        if (this.state.submissionStage === "successfullySubmitted") {
            Modal.warning({
                title: "Application Submitted",
                content: "Your application must be reviewed by Monthly Calling Campaign admins prior to activation. You will receive an email when your account has been activated.",
                onOk: (e) => {return new Promise((resolve, reject) => {
                    this.setState({submissionStage: "unsubmitted"})
                    return resolve();
                })}
            });
        }

        const { getFieldDecorator } = this.props.form;

        return (<>
            <div>
                <Row>
                    <Col span={12} offset={6}>
                        <Typography.Title level={2}>Apply to be a Monthly Calling Campaign Admin</Typography.Title>
                        <Typography.Paragraph>As an MCC Admin, you will be able to, (1) freshen the script for your callers, (2) view the names of your district's callers and their calling history, (3) motivate your new callers to get in the habit of calling, and (4) encourage veteran callers in the habit of calling. If you notice that someone hasn't called in a few months, call and ask if they can recommend how to make the system work better for them or if they'd like to be removed from the caller list.</Typography.Paragraph>
                    </Col>
                    <Col span={12} offset={6}>
                        <Form onSubmit={this.handleSubmit} className="SignUp-form">
                            <Form.Item label="User Name">
                                {getFieldDecorator('userName', {
                                    rules: [{ required: true, message: 'Please input your username!' }],
                                })(
                                    <Input />
                                )}
                            </Form.Item>
                            <Form.Item label="Email">
                                {getFieldDecorator('email', {
                                    validateTrigger: 'onBlur',
                                    rules: [
                                        {type: 'email', message: 'The input is not a valid email.'},
                                        {required: true, message: 'Please input your email.'}]
                                })(
                                    <Input />
                                )}
                            </Form.Item>
                            <Form.Item label="Password">
                                {getFieldDecorator('password', {
                                    rules: [{ required: true, message: 'Please input your Password!' }],
                                })(
                                    <Input type="password" />
                                )}
                            </Form.Item>
                            <Form.Item label="Congressional Districts">
                                {getFieldDecorator("districts", {initialValue: this.empty, rules:[{required: true, message: "Select at least one district"}]})(
                                    <Cascader options={this.state.cascaderDistricts} onChange={this.onChangeDistrict} placeholder="Choose one or more" />,
                                )}
                            </Form.Item>
                            {this.tagsJsx()}
                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    Apply
                                </Button>
                            </Form.Item>
                        </Form>
                    </Col>
                </Row>
                <Row>
                    <Col offset={6}>
                        <Typography.Text>Questions or feedback? <a href="https://forms.gle/R8xavqpe4zKM2VmK9" target="_blank" rel="noopener noreferrer">Contact Us</a></Typography.Text>
                    </Col>
                </Row>
            </div>
            </>
        );
    }
}

function mapStateToProps(state) {
    const { loggedIn } = state.authentication;
    return {
        loggedIn
    };
}

const SignUpForm = Form.create({})(SignUp);

export default withRouter(connect(mapStateToProps)(SignUpForm));
