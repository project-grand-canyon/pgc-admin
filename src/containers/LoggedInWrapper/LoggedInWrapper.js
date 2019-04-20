import React, { Component } from 'react';
import { Link, Redirect, withRouter } from 'react-router-dom';
import { Select, Spin, Icon, Layout, Menu, Typography } from 'antd';
import { connect } from 'react-redux';

import { districtsActions } from '../../_actions';

import styles from './LoggedInWrapper.module.css';

class LoggedInWrapper extends Component {

	componentDidMount() {
		console.log('loggedin wrapper componentdidmount')
		this.props.dispatch(districtsActions.refresh())
	}

	handleChangeDistrict = (selectedIndex) => {
		const district = this.props.districts.find((district => {
            return district.districtId === selectedIndex;
        }));
		console.log(`handleChangeDistrict ${selectedIndex}`);
		console.log(district)
        this.props.dispatch(districtsActions.select(district));
    }

    render() {

		const hasDistricts = this.props.districts && this.props.districts.length > 0;
        const selectDistrict = hasDistricts ? (
				<Select defaultValue={`${this.props.selectedDistrict.state}-${this.props.selectedDistrict.number}`} onChange={this.handleChangeDistrict}>
					{this.props.districts.map((district, index) => {
						return (
							<Select.Option key={index} value={district.districtId}>{district.state}-{district.number}
							</Select.Option>
						)
					})}
				</Select>
          ) : <Spin />;
        if (!this.props.loggedIn) {
            return <Redirect to="/" />
        }
        return(
            <Layout>
                <Layout.Header style={{background: 'white'}}>
                    <div style={{text: 'white'}}><Typography.Title level={1}>Project Grand Canyon - Admin</Typography.Title></div>
                </Layout.Header>
                <Layout>
                    <Layout.Sider 
                        breakpoint="lg"
                        collapsedWidth="0"
                        width={250} 
                        style={{ background: '#fff' }}>
				        <span>Editing district: </span>
                        {selectDistrict}
                        <Menu
                        mode="inline"
                        defaultSelectedKeys={['1']}
                        defaultOpenKeys={['sub1']}
                        style={{ height: '100%', borderRight: 0 }}>
                            <Menu.Item key="dashboard">
                                <Icon type="home" />
                                <span>Dashboard</span>
                                <Link to="/dashboard" />
                            </Menu.Item>
                            <Menu.Item key="script">
                                <Icon type="file-text" />
                                <span>Current Call-In Script</span>
                                <Link to="/script" />
                            </Menu.Item>
                            <Menu.Item key="talking-points-library">
                                <Icon type="file-search" />
                                <span>Talking Points Library</span>
                                <Link to="/talking-points" />
                            </Menu.Item>
                            {/* <Menu.Item key="schedule">
                                <Icon type="schedule" />
                                <span>Schedule</span>
                                <Link to="/schedule" />
                            </Menu.Item> */}
                            <Menu.Item key="callers">
                                <Icon type="team" />
                                <span>Callers</span>
                                <Link to="/callers" />
                            </Menu.Item>
                            <Menu.Item key="reports">
                                <Icon type="bar-chart" />
                                <span>Reports</span>
                                <Link to="/reports" />
                            </Menu.Item>
                            <Menu.Item key="representative">
                                <Icon type="idcard" />
                                <span>Representative</span>
                                <Link to="/representative" />
                            </Menu.Item>
                        </Menu>
                        <Menu>
                            <Menu.Item key="account">
                                <Icon type="setting" />
                                <span>Account</span>
                                <Link to="/account" />
                            </Menu.Item>
                        </Menu>
                    </Layout.Sider>                    
                    <Layout.Content style={{ padding: 24, minHeight: 280}}>
                    {this.props.children}
                    </Layout.Content>
                </Layout>
                <Layout.Footer >
                    <div style={{text: 'white'}}></div>
                </Layout.Footer>
            </Layout>
        );
    }
}

const mapStateToProps = state => {
    console.log('mapStateToProps');
    const { authentication } = state;
	const { loggedIn } = authentication;
	console.log(state);
    return { 
        districts: state.districts.districts,
        selectedDistrict: state.districts.selected,
        loggedIn
    };
};

export default withRouter(connect(mapStateToProps)(LoggedInWrapper));