import React, { Component } from 'react';
import { connect } from 'react-redux';
import styles from './Dashboard.module.css';

class Dashboard extends Component {
    render() {
        return (
            <p>{ this.props.user }</p>
            );
    }


}

function mapStateToProps(state) {
    const { authentication } = state;
    const { user } = authentication;
    return {
        user
    };
}

export default connect(mapStateToProps)(Dashboard);
