import React, { Component } from 'react';
import { Link, Redirect, withRouter } from 'react-router-dom';
import { Select, Spin, Icon, Layout, Menu, Typography } from 'antd';
import { connect } from 'react-redux';

import { districtsActions, adminActions } from '../../_actions';

import {isSenatorDistrict, displayName, comparator as districtComparator } from '../../_util/district';

class LoggedInWrapper extends Component {

    state = {
        editableDistricts: []
    }

	componentDidMount() {
        this.props.dispatch(districtsActions.refresh());
        let username = localStorage.getItem('username');
        this.props.dispatch(adminActions.refresh(username));
    }

    componentDidUpdate(prevProps, prevState) {
        let sameDistricts = true;
        if (prevProps.districts && this.props.districts) {
            sameDistricts = prevProps.districts.reduce((acc, el, idx) => {
                return acc && el.districtId === this.props.districts[idx].districtId;
            }, prevProps.districts.length === this.props.districts.length)
        }
        if (!sameDistricts || prevProps.admin !== this.props.admin) {
            var newEditibleDistricts = []
            if (!this.props.districts || this.props.districts.length === 0 || !this.props.admin){
                // no-op
                console.log('no-op')
            } else if (this.props.admin.root) {
                console.log('root')
                newEditibleDistricts = this.props.districts.sort(districtComparator);
            } else {
                const sortedAndFiltered = this.props.districts.filter(el => {
                    return this.props.admin.districts.includes(el.districtId)
                }).sort(districtComparator);
                newEditibleDistricts = sortedAndFiltered
            }
            this.setState({
                editableDistricts: newEditibleDistricts
            }, () => {
                this.selectFirstEditableDistrict();
            });
        } else if (!this.props.selectedDistrict && this.state.editableDistricts.length > 0) {
            this.selectFirstEditableDistrict();
        }
    }

    selectFirstEditableDistrict = () => {
        if (this.state.editableDistricts && this.state.editableDistricts.length > 0) {
            const id = this.state.editableDistricts[0].districtId
            this.handleChangeDistrict(id)
        }
    }

    handleChangeDistrict = (selectedIndex) => {
        const district = this.state.editableDistricts.find((district => {
            return district.districtId === selectedIndex;
        }));
        if (district){
            this.props.dispatch(districtsActions.select({...district}));
        } else {
            console.log('failed to select district')
        }
    }

    getSelectDistrict = () => {
        const hasDistricts = this.state.editableDistricts.length > 0 && this.props.selectedDistrict;
        const selectDistrict = hasDistricts ? (
                <Select
                    defaultValue={displayName(this.props.selectedDistrict)}
                    onChange={this.handleChangeDistrict}
                    style={{minWidth: "8em"}}
                >
					{this.state.editableDistricts.map((district, index) => {
						return (
							<Select.Option key={index} value={district.districtId}>{displayName(district)}
							</Select.Option>
						)
					})}
				</Select>
          ) : <Spin />;
          return selectDistrict;
    }

    render() {
        const selectDistrict = this.getSelectDistrict()
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
                                <span>Call-In Script</span>
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
                            {isSenatorDistrict(this.props.selectedDistrict) ?  null :
                                <Menu.Item key="distribution">
                                    <Icon type="phone" />
                                    <span>Call Distribution</span>
                                    <Link to="/distribution" />
                                </Menu.Item>
                            }
                            {isSenatorDistrict(this.props.selectedDistrict) ?  null :
                                <Menu.Item key="callers">
                                    <Icon type="team" />
                                    <span>Callers</span>
                                    <Link to="/callers" />
                                </Menu.Item>
                            }
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
                            <Menu.Item key="admins">
                                <Icon type="global" />
                                <span>Admins</span>
                                <Link to="/admins" />
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
                    <Typography.Text>Questions or feedback? <a href="https://forms.gle/R8xavqpe4zKM2VmK9" target="_blank" rel="noopener noreferrer">Contact Us</a></Typography.Text>
                    <div style={{text: 'white'}}></div>
                </Layout.Footer>
            </Layout>
        );
    }
}

const mapStateToProps = state => {
    const { authentication } = state;
    const { loggedIn } = authentication;
    return {
        districts: state.districts.districts,
        admin: state.admin.admin,
        selectedDistrict: state.districts.selected,
        loggedIn
    };
};

export default withRouter(connect(mapStateToProps)(LoggedInWrapper));
