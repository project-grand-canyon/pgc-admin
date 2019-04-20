import React, { Component } from 'react';
import { Typography} from 'antd';

import styles from './Schedule.module.css';

class Schedule extends Component {
    render() {
        return <>
            <Typography.Title level = {2}>
                District Call-In Schedule
            </Typography.Title>
            <Typography.Paragraph>
                This will eventually show you the day of the month that each caller is assigned.
            </Typography.Paragraph>
        </>;
    }
}

export default Schedule;
