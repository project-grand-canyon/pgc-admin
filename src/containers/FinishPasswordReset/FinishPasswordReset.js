import React, { Component } from 'react';
import { Alert, Button, Col, Form, Input, Row, Spin, Typography } from 'antd';
import axios from '../../_util/axios-api';
import getUrlParameter from '../../_util/urlparams';

class FinishPasswordReset extends Component {

    state = {
        requestStage: "verifying",
        email: null,
        token: null
    }

    componentDidMount() {
        const params = this.props.location.search;
        const token = getUrlParameter(params, 'token');
        this.setState({
            token: token},( () => {
                this.doVerify(token);
            }))
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const that = this;
                this.setState({
                    requestStage: "resetting"
                }, that.doReset(values));
            }
          });
    }

    doVerify(token) {
        const requestOptions = {
            url: `/admins/verify_reset_token`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            data: `"${token}"`
        };
        axios(requestOptions).then((response)=>{
            if (response.status !== 200 || (!response.data || !response.data.email)) {
                throw Error("Non-200 response");
            }
            const email = response.data.email;
            this.setState({
                requestStage: "verified",
                email: email
            })
        }).catch((error) => {
            this.setState({
                requestStage: "bad-token",
                resetRequestError: error
            });
        })
    }

    doReset(formValues) {
        if (this.state.token === null || this.state.email === null) {
            this.setState({
                requestStage: "bad-token"
            });
        }
        const newPassword = formValues['password'];
        const requestOptions = {
            url: `/admins/reset_password`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            data: {
                password: newPassword,
                token: this.state.token
            }
        };
        axios(requestOptions).then((response)=>{
            if (response.status !== 200) {
                throw Error("Non-200 response");
            }
            this.setState({
                requestStage: "success"
            })
        }).catch((error) => {
            this.setState({
                requestStage: "failed-reset",
                resetRequestError: error
            });
        });
    }

    getSuccess() {
        return <Alert message="Password Was Successfully Reset"
        description={<Typography.Text>You can now <a href="/login">login</a>.</Typography.Text>}
        type="success"></Alert>
    }

    getError() {
        return <Alert message="Error Resetting Password"
        description="Sorry about that. Please use the Questions or Feedback link below to report the error."
        type="error"></Alert>
    }

    getBadTokenAlert() {
        return <Alert message="Expired Reset Link"
        description={<Typography.Text>This reset password link is expired. Please <a href="/request_password_reset">request a new one</a>.</Typography.Text>}
        type="error"></Alert>
    }

    getResetForm() {
        const { getFieldDecorator } = this.props.form;
        return (
            <>
                <Typography.Text>Resetting for: {this.state.email}</Typography.Text>
                <Form onSubmit={this.handleSubmit} className="login-form">
                    <Form.Item label="Enter a New Password">
                        {getFieldDecorator('password', {
                            rules: [
                                { required: true, message: 'Please input a password!' },
                                { min: 8, message: "Password must be 8 characters or longer"}
                            ],
                        })(
                            <Input type="password" />
                        )}
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Reset Password
                        </Button>
                    </Form.Item>
                </Form>
            </>
        );
    }

    render() {
        const resetForm = this.getResetForm();
        const spinner = <Spin />;
        const badToken = this.getBadTokenAlert();
        const success = this.getSuccess();
        const error = this.getError();

        let currentView;
        if (this.state.requestStage === "verifying" || this.state.requestStage === "resetting") {
            currentView = spinner;
        } else if (this.state.requestStage === "bad-token") {
            currentView = badToken;
        } else if (this.state.requestStage === "verified") {
            currentView = resetForm;
        } else if (this.state.requestStage === "failed-reset") {
            currentView = error;
        } else if (this.state.requestStage === "success") {
            currentView = success;
        }

        return (<>
            <div>
                <Row>
                    <Col span={12} offset={6}>
                    <Typography.Title level={2}>Finish Password Reset</Typography.Title>
                    </Col>
                    <Col span={12} offset={6}>
                        {currentView}
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

export default Form.create({ name: 'finish_password_reset' })(FinishPasswordReset);