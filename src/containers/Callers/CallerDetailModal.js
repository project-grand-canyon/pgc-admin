import React, { Component } from 'react';
import { Modal, Skeleton, Tabs } from 'antd';
import CallerDetailPanel from './CallerDetailPanel';
import HistoryPanel from './HistoryPanel';

class CallerDetailModal extends Component {

    render() {
        const caller = this.props.caller && this.props.caller.caller;
        return (
            <Modal
                width="50%"
                maskClosable={false}
                visible = {this.props.display}
                title = {caller ? `${caller.firstName} ${caller.lastName}` : "Caller Detail"}
                footer={[]}
                onCancel={this.handleDone}
            >
                <Tabs defaultActiveKey="1">
                    <Tabs.TabPane tab="Activity History" key="1">
                        {this.historyTimeline()}
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Caller Details" key="2">
                        {this.callerDetailPanel()}
                    </Tabs.TabPane>
                </Tabs>
            </Modal>
        );
    }

    historyTimeline = () => {
        const reminderHistory = this.props.caller && this.props.caller.reminders;
        const callHistory = this.props.caller && this.props.caller.calls;
        const caller = this.props.caller && this.props.caller.caller;
        return (
            <Skeleton active loading={!reminderHistory || !callHistory || !caller}>
                  {callHistory && reminderHistory && caller ? <HistoryPanel callHistory={callHistory} reminderHistory={reminderHistory} caller={caller} /> : <></> }
            </Skeleton>
        )
    }

    callerDetailPanel = () => {
        const caller = this.props.caller && this.props.caller.caller;
        return (
            <Skeleton active loading={!caller}>
                {!caller ? <></> : <CallerDetailPanel caller={caller} onSave={this.handleSave}/>}
            </Skeleton>
        )
    }

    handleSave = () => {
        this.props.onSave();
    }

    handleDone = () => {
        this.props.onUnfocusCaller();
    }

}

export default CallerDetailModal;
