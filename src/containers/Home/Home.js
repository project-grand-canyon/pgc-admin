import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { Button } from 'antd';

import styles from './Home.module.css';

class Home extends Component {

    state = {
        redirectDestination: null
    }

    render() {
        if (this.state.redirectDestination) {
            return <Redirect to={this.state.redirectDestination} />
        }

        const guestExperience = (<>
                <Button onClick={(_)=>{
                    this.setState({redirectDestination: "/login"})
                }}>Login</Button>
                <Button onClick={(_)=>{
                    this.setState({redirectDestination: "/register"})
                }}>Register</Button>
            </>
        );

        const adminExperience = (
            <Button onClick={(_)=>{
                this.setState({redirectDestination: "/dashboard"})
            }}>Go to Dashboard</Button>
        );

        const links = this.props.loggedIn ? adminExperience : guestExperience;

        return (
            <>
                <h1>Project Grand Canyon Admin</h1>
                {links}
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

export default connect(mapStateToProps)(Home);