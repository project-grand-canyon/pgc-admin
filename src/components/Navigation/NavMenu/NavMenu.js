import React from 'react';
import {Link} from 'react-router-dom';
import {Menu} from 'antd';

const navMenu = (props) => {
    return (<Menu
            mode="horizontal"
            theme="light"
            style={{ borderBottom: 'none' }}
            selectedKeys={[`${props.activeLinkKey}`]}
        >
            <Menu.Item key='/'>
                <Link to='/'>Home</Link>
            </Menu.Item>
            <Menu.Item key='/signup'>
                <Link to='/signup'>Sign Up</Link>
            </Menu.Item>
        </Menu>);
};

export default navMenu;