import React, { Component } from 'react';
import { connect } from 'react-redux';
import {Typography, Skeleton} from 'antd';
import './Dashboard.module.css';

class Dashboard extends Component {
    render() {
        return (
            <>
                <Typography.Title level={2}>Welcome to the Monthly Calling Campaign Admin Dashboard</Typography.Title>
                <Skeleton loading={this.props.district == null}>
                    {this.props.district &&
                        <Typography.Paragraph>
                            You are currently editing district <Typography.Text strong>{`${this.props.district.state}-${this.props.district.number}`}</Typography.Text>. You can change your selected district using the dropdown on the left menu.
                        </Typography.Paragraph>
                    }
                </Skeleton>
                <Typography.Paragraph>If you have any questions, contact us as admin-support@cclcalls.org.</Typography.Paragraph>
            </>
            );
    }


}

function mapStateToProps(state) {
    const { authentication } = state;
    const { user } = authentication;
    return {
        user,
    };
}

export default connect(mapStateToProps)(Dashboard);
