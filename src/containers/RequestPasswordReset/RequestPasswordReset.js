import React, { Component } from 'react';
import { Alert, Button, Col, Form, Input, Row, Spin, Typography } from 'antd';
import axios from '../../_util/axios-api';

class RequestPasswordReset extends Component {

    state = {
        requestStage: "unrequested",
        resetRequestError: null
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const that = this;
                this.setState({
                    requestStage: "requesting"
                }, that.requestReset(values));
            }
          });
    }

    requestReset(formValues) {
        const emailAddress = formValues['email'];
        const requestOptions = {
            url: `/admins/password_reset_request`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            data: `"${emailAddress}"`
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
                requestStage: "error",
                resetRequestError: error
            });
        })
    }

    getSuccess() {
        return <Alert message="Password Reset Request Sent"
        description="If the email you submitted is associated with an admin account, a password reset link will be sent to that email address."
        type="success"></Alert>
    }

    getError() {
        return <Alert message="Error Requesting Reset"
        description="Sorry about that. Please use the Questions or Feedback link below to report the error."
        type="error"></Alert>
    }

    getResetForm() {
        const { getFieldDecorator } = this.props.form;
        return (
            <Form onSubmit={this.handleSubmit} className="login-form">
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
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Reset
                    </Button>
                </Form.Item>
            </Form>
        );
    }

    render() {
        const resetForm = this.getResetForm();
        const spinner = <Spin />;
        const success = this.getSuccess();
        const error = this.getError();

        let currentView;
        if (this.state.requestStage === "unrequested") {
            currentView = resetForm;
        } else if (this.state.requestStage === "requesting") {
            currentView = spinner;
        } else if (this.state.requestStage === "success") {
            currentView = success;
        } else if (this.state.requestStage === "error") {
            currentView = error;
        }

        return (<>
            <div>
                <Row>
                    <Col span={12} offset={6}>
                    <Typography.Title level={2}>Request Password Reset</Typography.Title>
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

export default Form.create({ name: 'request_password_reset' })(RequestPasswordReset);