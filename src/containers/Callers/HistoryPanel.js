import React, { Component } from 'react';
import { Button, Card, Divider, message, Popconfirm, Timeline, Typography } from 'antd';
import { authHeader } from '../../_util/auth/auth-header';
import axios from '../../_util/axios-api';

class HistoryPanel extends Component { 

    render() {
        const standardizedReminders = this.props.reminderHistory ? 
            this.props.reminderHistory.map((el)=>{
                return {
                    timestamp: new Date(el.timeSent),
                    timestampStr: new Date(el.timeSent + " UTC").toDateString(),
                    type: "Notification"
                }
            }) : [];
        const standardizedCalls = this.props.callHistory ? 
            this.props.callHistory.map((el)=>{
                return {
                    timestamp: new Date(el.created),
                    timestampStr: new Date(el.created + " UTC").toDateString(),
                    type: "Call"
                }
            }) : [];
        const concatenated = standardizedReminders.concat(standardizedCalls).concat({
            timestamp: new Date(this.props.caller.created),
            timestampStr: new Date(this.props.caller.created + " UTC").toDateString(),
            type: "Sign Up"
        });
        
        const events = concatenated.sort((a, b) => {
            return b.timestamp - a.timestamp
        }).map((el, idx)=> {
            const color = el.type === "Call" ? "green" : "blue";
            return  <Timeline.Item color={color} key={idx}>{el.type} on {el.timestampStr}</Timeline.Item>
        });
        return (
            <>
                <Typography.Title level={3}>Notifications and Calls</Typography.Title>
                <Typography.Text strong>Notification day of month: {this.props.caller.reminderDayOfMonth}</Typography.Text><br />
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
                    icon={<></>}
                    onConfirm={(e)=>{this.sendNotification(this.props.caller.callerId)}}
                    okText="Send"
                    cancelText="Cancel"
                >
                    <Button>Send Notification</Button>
                </Popconfirm>
            </>
        )
    }

    sendNotification = (callerId) => {
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
}

export default HistoryPanel;
