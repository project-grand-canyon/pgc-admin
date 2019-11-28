import React, { Component } from 'react';
import { Button, message, Col, Form, Icon, Input, Row, Spin, Typography } from 'antd';
import { withRouter, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';

import { userActions } from '../../_actions';

// import styles from './Login.module.css';

class Login extends Component {

    constructor(props) {
        super(props);
        // reset login status
        this.props.dispatch(userActions.logout());
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.props.dispatch(userActions.login(values.userName, values.password));
            }
          });
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.login_error !== this.props.login_error) {
            if (this.props.login_error){
                console.log(this.props.login_error.message)
                message.error(`Login failed with error: ${this.props.login_error.message}`);
            }
        }
    }

    render() {

        if (this.props.loggedIn) {
            return <Redirect to="/dashboard" />
        }

        const { getFieldDecorator } = this.props.form;

        const loginForm = (
            <>
            <Form onSubmit={this.handleSubmit} className="login-form">
                <Form.Item>
                    {getFieldDecorator('userName', {
                        rules: [{ required: true, message: 'Please input your username!' }],
                    })(
                        <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Username" />
                    )}
                </Form.Item>
                <Form.Item>
                    {getFieldDecorator('password', {
                        rules: [{ required: true, message: 'Please input your Password!' }],
                    })(
                        <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password" />
                    )}
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Log in
                    </Button>
                    &nbsp;or <a href="/signup">Sign Up</a>
                </Form.Item>
            </Form>
            <a href="/request_password_reset">Forgot Password?</a>
            </>
        );

        const loginPresentation = (this.props.loggingIn) ? <Spin /> : loginForm;

        return (<>
            <div>
                <Row>
                    <Col span={12} offset={6}>
                    <Typography.Title level={2}>Login</Typography.Title>
                    </Col>
                    <Col span={12} offset={6}>
                        {loginPresentation}
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
    const { loggedIn, loggingIn, error } = state.authentication;
    return {
        loggingIn,
        loggedIn,
        login_error: error
    };
}

const login = Form.create({})(Login);

export default withRouter(connect(mapStateToProps)(login));
