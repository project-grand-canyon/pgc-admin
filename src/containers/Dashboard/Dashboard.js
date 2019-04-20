import React, { Component } from 'react';
import { connect } from 'react-redux';
import {Typography, Skeleton} from 'antd';
import styles from './Dashboard.module.css';

class Dashboard extends Component {
    render() {
        return (
            <>
                <Typography.Title level={2}>Welcome to the Project Grand Canyon Admin Dashboard</Typography.Title>
                <Skeleton loading={this.props.selectedDistrict == null}>
                    {this.props.selectedDistrict &&
                        <Typography.Paragraph>
                            You are currently editing district <Typography.Text strong>{`${this.props.selectedDistrict.state}-${this.props.selectedDistrict.number}`}</Typography.Text>. You can change your selected district using the dropdown on the left menu.
                        </Typography.Paragraph>    
                    }
                </Skeleton>
                <Typography.Paragraph>If you have any questions, contact the developer, Ben Boral, at 512-565-8543 or boralben@gmail.com.</Typography.Paragraph>
            </>
            );
    }


}

function mapStateToProps(state) {
    const { authentication } = state;
    const { user } = authentication;
    return {
        user,
        selectedDistrict: state.districts.selected,
    };
}

export default connect(mapStateToProps)(Dashboard);
