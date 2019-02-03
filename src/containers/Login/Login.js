import React, { Component } from 'react';
import { Button, Col, Form, Icon, Input, Row } from 'antd';
import { Link } from 'react-router-dom';
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
                console.log(`values: ${JSON.stringify(values)}`);
                this.props.dispatch(userActions.login(values.userName, values.password));
            }
          });
    }

    componentDidMount() {
        console.log("component did mount");
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        return (<>
            <div>
                <Row>
                    <Col span={12} offset={6}>
                        <h2>Login</h2>
                    </Col>
                    <Col span={12} offset={6}>
                    <Form onSubmit={this.handleSubmit} className="login-form">
                        <Form.Item>
                            {getFieldDecorator('userName', {
                                rules: [{ required: true, message: 'Please input your username!' }],
                            })(
                                <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Username/Email" />
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
                            Or <a href="/register">register</a>
                        </Form.Item>
                    </Form>
                    </Col>
                </Row>
            </div>
            </>
        );
    }
}

function mapStateToProps(state) {
    const { loggingIn } = state.authentication;
    return {
        loggingIn
    };
}

const login = Form.create({})(Login);

export default connect(mapStateToProps)(login)