import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button } from 'antd';

import { userActions } from '../../_actions';

import './Account.module.css';

class Account extends Component {

    logout = (_) => {
        this.props.dispatch(userActions.logout());
    }

    render() {
        return (
            <>
                <Button type="danger" onClick={this.logout}>Logout</Button>
            </>
            );
    }
}

function mapStateToProps(_) {
    return {};
}

export default connect(mapStateToProps)(Account);
