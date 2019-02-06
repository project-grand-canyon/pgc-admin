import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Icon, Layout, Menu } from 'antd';
import { connect } from 'react-redux';

import styles from './LoggedInWrapper.module.css';

class LoggedInWrapper extends Component {

    render() {
        return(
            <Layout>
                <Layout.Header style={{background: 'purple'}}>
                    <div style={{text: 'white'}}>Logo</div>
                </Layout.Header>
                <Layout>
                    <Layout.Sider 
                        breakpoint="lg"
                        collapsedWidth="0"
                        width={250} 
                        style={{ background: '#fff' }}>
                        <span>List of Districts</span>
                        <ul>
                        { this.props.districts.map((district)=>{
                            return <li key={district.districtId}>{district.state}-{district.number}</li>
                        })}
                        </ul>
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
                            <Menu.Item key="schedule">
                                <Icon type="schedule" />
                                <span>Schedule</span>
                                <Link to="/schedule" />
                            </Menu.Item>
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
                            <Menu.Item key="districts">
                                <Icon type="idcard" />
                                <span>All Districts</span>
                                <Link to="/districts" />
                            </Menu.Item>
                            <Menu.Item key="talking-points-library">
                                <Icon type="file-search" />
                                <span>Talking Points Library</span>
                                <Link to="/talking-points" />
                            </Menu.Item>
                            <Menu.Item key="account">
                                <Icon type="setting" />
                                <span>Account</span>
                                <Link to="/account" />
                            </Menu.Item>
                        </Menu>
                    </Layout.Sider>                    
                    <Layout.Content style={{ background: 'yellow', padding: 24, minHeight: 280}}>
                    {this.props.children}
                    </Layout.Content>
                </Layout>
                <Layout.Footer style={{background: 'purple'}}>
                    <div style={{text: 'white'}}>Hello</div>
                </Layout.Footer>
            </Layout>
        );
    }
}

const mapStateToProps = state => {
    return { districts: state.districts.districts };
  };

export default connect(mapStateToProps)(LoggedInWrapper);