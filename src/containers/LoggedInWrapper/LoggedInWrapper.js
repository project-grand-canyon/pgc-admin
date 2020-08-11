import React, { Component } from 'react';
import { generatePath } from 'react-router';
import { Link, Redirect, withRouter } from 'react-router-dom';
import { Select, Spin, Icon, Layout, Menu, Typography, Modal, Row, Col } from 'antd';
import { connect } from 'react-redux';
import styled from '@emotion/styled';

import { districtsActions, adminActions } from '../../_actions';

import {isSenatorDistrict, displayName, slug as districtSlug, comparator as districtComparator } from '../../_util/district';

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
        editableDistricts: [],
        editableDistrictsById: new Map(),
    }

	componentDidMount() {
        console.log('component did mount logged in wrapper')
        this.props.dispatch(districtsActions.refresh());
        console.log('after district refresh')
        let username = localStorage.getItem('username');
        console.log('username ' + username)
        this.props.dispatch(adminActions.refresh(username));
        console.log('after admin refresh')
    }

    componentDidUpdate(prevProps) {
        console.log('componesnt did update')
        console.log(prevProps)
        console.log(this.props)
        console.log(`now username ${localStorage.getItem('username')}`);
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
                editableDistricts: newEditibleDistricts,
                editableDistrictsById: new Map(newEditibleDistricts.map(
                    (dist) => [dist.districtId, dist]
                ))
            });
        }

        if (this.props.districtFetchError !== null && this.props.districtFetchError !== prevProps.districtFetchError) {
            let message = JSON.stringify(this.props.districtFetchError);
            Modal.error({title: "Loading Error", content: (<><Typography.Paragraph>Logging out and back in will probably fix it.</Typography.Paragraph><Typography.Paragraph>{message}</Typography.Paragraph></>)})
        }

    }

    districtURL(district) {
        const slug = district ? districtSlug(district) : undefined
        return generatePath(this.props.match.path, {districtSlug: slug})
    }

    urlPath(tabName, district) {
        return '/' + tabName + (district ? '/' + districtSlug(district) : '')
    }

    handleChangeDistrict = (districtId) => {
        const district = this.state.editableDistrictsById.get(districtId);
        this.props.history.push(this.districtURL(district));
    }

    getDistrictSelectionDropdown = (selectedDistrict) => {
        const hasDistricts = this.state.editableDistricts.length > 0;
        
        let selectDistrict;
        
        if (hasDistricts) {
            selectDistrict = (
                <Select
                    value={selectedDistrict.districtId}
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
        if (!this.props.loggedIn) {
            return <Redirect to="/" />
        }
        let selectedDistrict
        const slug = this.props.match.params.districtSlug
        console.log('a')
        if (slug) {
            console.log('aa')
            if (this.state.editableDistricts.length > 0) {
                selectedDistrict = this.props.districtsBySlug && this.props.districtsBySlug.get(slug)
                if (!selectedDistrict || !this.state.editableDistrictsById.has(selectedDistrict.districtId)) {
                    console.log('b')
                    return <Redirect to={this.districtURL(null)} />
                }
            }
        } else {
            console.log('aaa')
            if (this.state.editableDistricts.length > 0) {
                console.log('c')
                return <Redirect to={this.districtURL(this.state.editableDistricts[0])} />
            }
        }
        const menuSelection = this.districtURL().slice(1)
        const Component = this.props.component
        const componentProps = {...this.props.componentProps, district: selectedDistrict}
        const districtSelectionDropdown = this.getDistrictSelectionDropdown(selectedDistrict)
        console.log('d')
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
                            {districtSelectionDropdown}
                        </div>
                        <CovidAlert district={selectedDistrict} />
                        <Menu
                        mode="inline"
                        selectedKeys={[menuSelection]}
                        style={{ height: '100%', borderRight: 0 }}>
                            <Menu.Item key="dashboard">
                                <Icon type="home" />
                                <span>Dashboard</span>
                                <Link to={this.urlPath('dashboard', selectedDistrict)} />
                            </Menu.Item>
                            <Menu.Item key="script">
                                <Icon type="file-text" />
                                <span>Call-In Script</span>
                                <Link to={this.urlPath('script', selectedDistrict)} />
                            </Menu.Item>
                            <Menu.Item key="talking-points">
                                <Icon type="file-search" />
                                <span>Talking Points Library</span>
                                <Link to={this.urlPath('talking-points', selectedDistrict)} />
                            </Menu.Item>
                            {/* <Menu.Item key="schedule">
                                <Icon type="schedule" />
                                <span>Schedule</span>
                                <Link to={this.urlPath('schedule', selectedDistrict)} />
                            </Menu.Item> */}
                            {isSenatorDistrict(selectedDistrict) ?  null :
                                <Menu.Item key="distribution">
                                    <Icon type="phone" />
                                    <span>Call Distribution</span>
                                    <Link to={this.urlPath('distribution', selectedDistrict)} />
                                </Menu.Item>
                            }
                            {isSenatorDistrict(selectedDistrict) ?  null :
                                <Menu.Item key="callers">
                                    <Icon type="team" />
                                    <span>Callers</span>
                                    <Link to={this.urlPath('callers', selectedDistrict)} />
                                </Menu.Item>
                            }
                            <Menu.Item key="reports">
                                <Icon type="bar-chart" />
                                <span>Reports</span>
                                <Link to={this.urlPath('reports', selectedDistrict)} />
                            </Menu.Item>
                            <Menu.Item key="representative">
                                <Icon type="idcard" />
                                <span>Representative</span>
                                <Link to={this.urlPath('representative', selectedDistrict)} />
                            </Menu.Item>
                            <Menu.Item key="admins">
                                <Icon type="global" />
                                <span>Admins</span>
                                <Link to={this.urlPath('admins', selectedDistrict)} />
                            </Menu.Item>
                        </Menu>
                        <Menu selectedKeys={[menuSelection]}>
                            <Menu.Item key="account">
                                <Icon type="setting" />
                                <span>Account</span>
                                <Link to={this.urlPath('account', selectedDistrict)} />
                            </Menu.Item>
                        </Menu>
                    </Layout.Sider>
                    <Layout.Content style={{ padding: "24px 48px", minHeight: 280}}>
                        <Component {...componentProps} />
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
        districtsBySlug: state.districts.districtsBySlug,
        districtFetchError: state.districts.error,
        admin: state.admin.admin,
        loggedIn
    };
};

export default withRouter(connect(mapStateToProps)(LoggedInWrapper));
