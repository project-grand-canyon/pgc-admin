import React, { Component } from 'react';
import { Button, Col, message, Row, Skeleton, Typography } from 'antd';
import EditCallerForm from './EditCallerForm';

class CallerDetailPanel extends Component {

    state={
        editing: false
    } 

    render() {
        return (
            <>
                <Skeleton active loading={!this.props.caller}>
                    {!this.props.caller ? <></> : this.state.editing ? this.editCallerPanel() : this.callerDetailPanel()}
                </Skeleton>
                {!this.state.editing &&
                    <Button style={{marginTop: "10px"}} key="submit" disabled={this.state.editing} icon="edit" onClick={this.enterEditMode}>
                        Edit
                    </Button>
                }
            </>
        )
    }

    enterEditMode = () => {
        this.setState({
            editing: true
        });
    }

    editCallerPanel = () => {
        return <EditCallerForm caller={this.props.caller} onSave={this.handleSave} onCancel={this.handleCancel}/>
    }

    handleCancel = () => {
        this.setState({
            editing: false
        })
    }

    handleSave = () => {
        this.setState({
            editing: false
        }, () => {
            message.success('Caller Updated');
            this.props.onSave();
        });
    }


    callerDetailPanel = () => {
        const caller = this.props.caller;
        return (
                <>
                    <Row>
                        <Col sm={24} md={8}>
                            <Typography.Text strong>Name</Typography.Text>
                        </Col>
                        <Col>
                            <Typography.Text>{caller.firstName} {caller.lastName}</Typography.Text>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={24} md={8}>
                            <Typography.Text strong>Preferred Contact Method(s)</Typography.Text>
                        </Col>
                        <Col>
                            <Typography.Text>{caller.contactMethods.join(", ")}</Typography.Text>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={24} md={8}>
                            <Typography.Text strong>Phone Number</Typography.Text>
                        </Col>
                        <Col>
                            <Typography.Text disabled={!caller.phone} >{caller.phone ? caller.phone : "none"}</Typography.Text>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={24} md={8}>
                            <Typography.Text strong>Email</Typography.Text>
                        </Col>
                        <Col>
                            <Typography.Text  disabled={!caller.email}>{caller.email ? caller.email : "none"}</Typography.Text>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={24} md={8}>
                            <Typography.Text strong>Zip Code</Typography.Text>
                        </Col>
                        <Col>
                            <Typography.Text  disabled={!caller.zipCode}>{caller.zipCode ? caller.zipCode : "none"}</Typography.Text>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={24} md={8}>
                            <Typography.Text strong>Active/Paused</Typography.Text>
                        </Col>
                        <Col>
                            <Typography.Text>{caller.paused ? "paused" : "active"}</Typography.Text>
                        </Col>
                    </Row>
                </>
            )
        
    }

}

export default CallerDetailPanel;
