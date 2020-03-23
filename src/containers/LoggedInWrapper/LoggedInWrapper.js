import React, { Component } from 'react';
import { Link, Redirect, withRouter } from 'react-router-dom';
import { Select, Spin, Icon, Layout, Menu, Typography, Modal, Row, Col } from 'antd';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import { districtsActions, adminActions } from '../../_actions';

import {isSenatorDistrict, displayName, comparator as districtComparator } from '../../_util/district';

const AlertText = styled(Typography.Text)`
    color: red;
    font-weight: bold;
`

const CovidAlert = ({ district }) => {
    if (district && district.status === "covid_paused") {
        return (
            <div style={{padding: "10px"}}>
                <AlertText>Call notifications are paused for this district due to COVID-19. Update this setting in the Representatives tab.</AlertText>
            </div>
        )
    }
    return null
};

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
            } else if (this.props.admin.root) {
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

        if (this.props.districtFetchError !== null && this.props.districtFetchError !== prevProps.districtFetchError) {
            let message = JSON.stringify(this.props.districtFetchError);
            Modal.error({title: "Loading Error", content: (<><Typography.Paragraph>Logging out and back in will probably fix it.</Typography.Paragraph><Typography.Paragraph>{message}</Typography.Paragraph></>)})
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
        
        let selectDistrict;
        
        if (hasDistricts) {
            selectDistrict = (
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
            )
                } else if (this.props.districtFetchError) {
                    selectDistrict = <Typography.Text>Error</Typography.Text>;
                } else {
                    selectDistrict = <Spin />;
                }
            return selectDistrict;
    }

    render() {
        const selectDistrict = this.getSelectDistrict()
        if (!this.props.loggedIn) {
            return <Redirect to="/" />
        }
        return(
            <Layout>
                <Layout.Header style={{background: 'white', lineHeight: '64px' }}>
                    <Row type="flex" justify="space-around" align="middle" style={{height: "100%"}}>
                        <Col>
                            <Typography.Title level={1} style={{margin: "0"}}>Monthly Calling Campaign - Admin</Typography.Title>
                        </Col>
                    </Row>
                </Layout.Header>
                <Layout>
                    <Layout.Sider
                        breakpoint="lg"
                        collapsedWidth="0"
                        width={250}
                        style={{ background: '#fff' }}>
				        <div style={{textAlign: "center"}}>
                            <span>Editing district: </span>
                            {selectDistrict}
                        </div>
                        <CovidAlert district={this.props.selectedDistrict} />
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
                    <Layout.Content style={{ padding: "24px 48px", minHeight: 280}}>
                    {this.props.children}
                    </Layout.Content>
                </Layout>
                <Layout.Footer style={{textAlign: "center"}}>
                    <Row type="flex" justify="center">
                    <Col >
                        <Typography.Text>Questions or feedback? <a href="https://forms.gle/R8xavqpe4zKM2VmK9" target="_blank" rel="noopener noreferrer">Contact Us</a></Typography.Text>
                    </Col>
                    </Row>
                    
                    
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
        districtFetchError: state.districts.error,
        admin: state.admin.admin,
        selectedDistrict: state.districts.selected,
        loggedIn
    };
};

export default withRouter(connect(mapStateToProps)(LoggedInWrapper));
