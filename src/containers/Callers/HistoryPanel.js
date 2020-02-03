import React from 'react';
import { 
    Button, 
    Card, 
    Divider, 
    message, 
    Popconfirm, 
    Timeline, 
    Typography,
} from 'antd';
import { authHeader } from '../../_util/auth/auth-header';
import { HistoryType } from './constants'
import axios from '../../_util/axios-api';

const sendNotification = (callerId) => {
    const requestOptions = {
      url: `/reminders/${callerId}`,
      method: 'PUT',
      headers: { ...authHeader(), 'Content-Type': 'application/json' }
    };
    axios(requestOptions).then((response)=>{
      message.success("Notification sent successfully.")
    }).catch((e) => {
        message.error(`Notification failed to send: ${e.message}`);
    })
}

const HistoryPanel = ({
    history,
    caller,
}) => { 
    const events = history.map((item, idx)=> {
        // TODO: Possibly use an icon here, or expand on the colors
        let color

        if (item.type === HistoryType.CALL) { 
            color = 'green' 
        } else if (item.type === HistoryType.NOTIFICATION) { 
            color = 'gray'
        } else if (item.type === HistoryType.SIGN_UP) {
            color = 'blue'
        }

        return  (
            <Timeline.Item key={idx} color={color}>
                {item.type} on {item.timestampDisplay}
            </Timeline.Item>
        )
    });

    return (
        <>
            <Typography.Title level={3}>Notifications and Calls</Typography.Title>
            <Typography.Text strong>Notification day of month: {caller.reminderDayOfMonth}</Typography.Text><br />
            <Typography.Text>NOTE: This timeline may be incomplete for some callers because notification history only goes back through August, 2019. We did not store notification history prior to then.</Typography.Text>
            <Divider />
            <Timeline>{events}</Timeline>
            <Popconfirm
                title={
                    <Card title="Are you sure?" bordered={false}>
                        <p>Callers already get automatic call-in notifications once per month.</p>
                        <p>Use this button for troubleshooting when a caller missed their automatic notification, etc.</p>
                    </Card>
                }
                placement="top"
                onConfirm={(e)=>{sendNotification(caller.callerId)}}
                okText="Send"
                cancelText="Cancel"
            >
                <Button>Send Notification</Button>
            </Popconfirm>
        </>
    )
}

export default HistoryPanel;
