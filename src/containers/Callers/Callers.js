import React, { Component } from 'react';
import { Redirect } from 'react-router';
import { Button, Card, Form, message, Modal, Popconfirm, Table, Typography } from 'antd';
import get from "lodash/get"

import axios from '../../_util/axios-api';
import { isSenatorDistrict } from '../../_util/district';

import { authHeader } from '../../_util/auth/auth-header';
import { connect } from 'react-redux';

import './Callers.module.css';
import EditCallerModalForm from './EditCallerModal';

// TODO We need to replace the <a> tag below with a button to drop the below disable, otherwise
//      apparently screen readers will misunderstand it
/* eslint-disable jsx-a11y/anchor-is-valid */

class Callers extends Component {

    state = {
		  callers: null,
		  editingKey: null,
    }

    componentDidMount(){
      this.fetchCallers();
    }

    columns = [{
        title: 'First Name',
		    dataIndex: 'firstName',
        key: 'firstName',
        sorter: (a, b) => { return a.firstName.localeCompare(b.firstName)}
    },{
        title: 'Last Name',
		    dataIndex: 'lastName',
        key: 'lastName',
        sorter: (a, b) => { return a.lastName.localeCompare(b.lastName)}
    },{
        title: 'Contact By SMS',
		    dataIndex: 'contactMethodSMS',
        key: 'contactMethodSMS',
        render: val => (val ? 'Yes' : 'No')
	},{
        title: 'Contact By Email',
		    dataIndex: 'contactMethodEmail',
        key: 'contactMethodEmail',
        render: val => (val ? 'Yes' : 'No')
    },{
        title: 'Email',
        dataIndex: 'email',
		    key: 'email'
    },{
        title: 'Phone',
        dataIndex: 'phone',
		    key: 'phone'
    },{
        title: 'Zip Code',
        dataIndex: 'zipCode',
        key: 'zipCode'
    },{
        title: 'Paused',
        dataIndex: 'paused',
		    key: 'paused',
        render: val => (val ? 'Yes' : 'No')
    },{
        title: 'Edit',
        dataIndex: 'operation1',
        render: (text, record) => {
          const isEditing = this.isEditing(record);
          return (
            <div>
              {isEditing ? (
                <></>
              ) : (
                <a onClick={() => this.edit(record.key)}>Edit</a>
              )}
            </div>
          );
        },
      },{
        title: 'Send Notification',
        dataIndex: 'operation2',
        render: (_, record) => {
          return (
            <Popconfirm
              title={<Card title="Are you sure?" bordered={false}>
              <p>Callers already get automatic call-in notifications once per month.</p>
              <p>Use this button for troubleshooting when a caller missed their automatic notification, etc.</p>
            </Card>}
              placement="left"
              icon={<></>}
              onConfirm={(e)=>{this.sendNotification(record.callerId)}}
              okText="Send"
              cancelText="Cancel"
            >
              <Button>Send</Button>
            </Popconfirm>

          );
        },
      }];

    sendNotification = (callerId) => {
      const requestOptions = {
        url: `/reminders/${callerId}`,
        method: 'PUT',
        headers: { ...authHeader(), 'Content-Type': 'application/json' }
      };
      axios(requestOptions).then((response)=>{
        message.success("Notification sent successfully.")
      }).catch((e) => {
          Modal.error({
              title: "Notification failed to send",
              content: get(e, ['response', 'data', 'message'], "Unrecognized error.")
          });
          this.setState({fetchError: e.message})
      }).then(()=>{
        this.fetchCallers(()=>{this.setState({editingKey: null})});
      })
    }

    isEditing = record => record.key === this.state.editingKey;

    onCancelEditCaller = () => {
      this.setState({editingKey:null})
  }

    onEditCaller = (callerDetails) => {
      const updatedCaller = {
        firstName: callerDetails.firstName,
        lastName: callerDetails.lastName,
        contactMethods: callerDetails.contactMethods,
        phone: callerDetails.phone,
        email: callerDetails.email,
        districtId: callerDetails.districtId,
        zipCode: callerDetails.zipCode,
        paused: callerDetails.paused
      }
      const requestOptions = {
        url: `/callers/${callerDetails.key}`,
        method: 'PUT',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        data: updatedCaller
      };
      axios(requestOptions).then((response)=>{
        // no-op
      }).catch((e) => {
          Modal.error({
              title: "Error Updating Caller",
              content: e.message,
          });
          this.setState({fetchError: e.message})
      }).then(()=>{
        this.fetchCallers(()=>{this.setState({editingKey: null})});
      })
  }

    edit = (key) => {
        console.log(key)
        this.setState({ editingKey: key });
    }

    fetchCallers(cb) {
        const district = this.props.district;
        if (district) {
            const requestOptions = {
                url: `/callers?districtId=${district.districtId}`, // TODO: only get callers for a district
                method: 'GET',
                headers: { ...authHeader(), 'Content-Type': 'application/json' },
            };
            axios(requestOptions).then((response)=>{
              console.log('got it')
                const allCallers = response.data;
                const callers = allCallers.map(el => {
                  const key = el['callerId'];
                  el.key = key;
                  el.contactMethodSMS = el.contactMethods.indexOf('sms') !== -1;
                  el.contactMethodEmail = el.contactMethods.indexOf('email') !== -1;
                  return el;
                });
                this.setState({callers: callers});
            }).catch((e) => {
                Modal.error({
                    title: "Error Loading Page",
                    content: e.message,
                });
                this.setState({fetchError: e.message})
            }).then(()=>{
              cb && cb()
            })
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.district !== this.props.district) {
            this.setState({callers: null});
            this.fetchCallers();
        }
    }

    editModal = () => {
      const callerForEditing = this.state.callers && this.state.callers.find((el)=>{
        return el.key === this.state.editingKey
      })

      return <EditCallerModalForm
        caller={callerForEditing}
        display={this.state.editingKey !== null}
        onEditCaller={(callerDetails) => { this.onEditCaller(callerDetails)}}
        onCancelEditCaller={this.onCancelEditCaller}
      ></EditCallerModalForm>
    }

    render() {

      if (isSenatorDistrict(this.props.district)) {
        return <Redirect to='/script'/>;
      }

		  return (
        <>
          <Typography.Title level={2}>
            Callers for District
          </Typography.Title>
          <Typography.Paragraph>
            Use this page to edit caller info and pause notifications if they want a break.
          </Typography.Paragraph>
          {this.editModal()}
          <Table
            loading={this.state.callers === null}
            bordered
            dataSource={this.state.callers}
            columns={this.columns}
            pagination={{
              onChange: this.onCancelEditCaller,
            }}
          />
        </>
		  );
		}
}


const mapStateToProps = state => {
    return {
        district: state.districts.selected,
    };
};

const CallersTable = Form.create({ name: 'representative_edit' })(Callers);

export default connect(mapStateToProps)(CallersTable);
