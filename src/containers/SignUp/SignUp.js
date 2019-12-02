import React, { Component } from 'react';
import { Button, Col, Empty, Form, Icon, Input, Modal, Row, Spin, Typography, TreeSelect } from 'antd';
import { withRouter, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import axios from '../../_util/axios-api';
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
        congressionalDistrictsError: null
    };

    componentDidMount = () => {
        axios.get('districts').then((response)=>{
            const districts = response.data;
            const districtsByState = groupBy(districts, 'state');
            const cascaderDistricts = Object.keys(districtsByState).sort().map((state)=>{
                return {
                    value: state,
                    title: state,
                    selectable: false,
                    children: districtsByState[state].sort((a, b)=> {
                        return parseInt(a.number) - parseInt(b.number)
                    }).map((district) =>{
                        return {
                            value: district.districtId,
                            title: `${displayName(district)} (${district.repLastName})`,
                            selectable: true
                        }
                    })
                }
            })

            this.setState({
                cascaderDistricts: cascaderDistricts
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
        // const that = this;
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const fieldValues = {...values};
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
                            content: `${e.response.data.message}`
                        });
                        this.setState({submissionStage: "unsubmitted"})
                    })
                });
            }
        });
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
            Modal.success({
                title: "Sign Up Successful",
                content: "Your registration must be reviewed by Project Grand Canyon admins prior to activation. You will receive an email when your account has been activated.",
                onOk: (e) => {return new Promise((resolve, reject) => {
                    this.setState({submissionStage: "unsubmitted"})
                    return resolve();
                })}
            });
        }

        const { getFieldDecorator } = this.props.form;

        const treeData = this.state.cascaderDistricts
        const districtSelectionProps = {
            treeData,
            allowClear: true,
            multiple: true,
            treeCheckable: false,
            treeDefaultExpandAll: true,
            showCheckedStrategy: TreeSelect.SHOW_ALL,
            prefix: (<Icon type="environment" placeholder="Districts"/>)
        };
        return (<>
            <div>
                <Row>
                    <Col span={20} offset={2}>
                        <Typography.Title level={2}>Register to be a Talking Points Manager</Typography.Title>
                        <Typography.Paragraph>As a Talking Points Manager, you will be responsible for updating the talking points and the Member of Congress details for your congressional district(s).</Typography.Paragraph>
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
                                    <TreeSelect {...districtSelectionProps} />,
                                )}
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    Register
                                </Button>
                            </Form.Item>
                        </Form>
                    </Col>
                </Row>
                <Row>
                    <Col>
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
