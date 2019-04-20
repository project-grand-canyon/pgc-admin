import React, { Component } from 'react';
import { Card, Checkbox, List, Modal, Skeleton, Form, Input, Button, Table, Typography } from 'antd';

import axios from '../../_util/axios-api';


import { authHeader } from '../../_util/auth/auth-header';
import { connect } from 'react-redux';

import styles from './Callers.module.css';
import EditCallerModalForm from './EditCallerModal';

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
        dataIndex: 'operation',
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
      }];

    isEditing = record => record.key === this.state.editingKey;

    onCancelEditCaller = () => {
      this.setState({editingKey:null})
  }

    onEditCaller = (callerDetails) => {
      const key = callerDetails.key;
      const callersCopy = [...this.state.callers];
      const callers = callersCopy.map((el) => { return (el.key == key) ? callerDetails : el })
      this.setState({callers, editingKey: null});
    }
    
    edit = (key) => {
        console.log(key)
        this.setState({ editingKey: key });
    }

    fetchCallers() {
        const district = this.props.district;
        if (district) {
            const requestOptions = {
                url: `/callers/`, // TODO: only get callers for a district
                method: 'GET',
                headers: { ...authHeader(), 'Content-Type': 'application/json' },
            };
            axios(requestOptions).then((response)=>{
              console.log('got it')
                const allCallers = response.data;
                const callers = allCallers.filter( caller => {
                  return caller.districtId === district.districtId;
                }).map(el => {
                  const key = el['callerId'];
                  el.key = key;
                  el.contactMethodSMS = el.contactMethods.indexOf('sms') != -1;
                  el.contactMethodEmail = el.contactMethods.indexOf('email') != -1;
                  return el;
                });
                this.setState({callers: callers});
            }).catch((e) => {
                Modal.error({
                    title: "Error Loading Page",
                    content: e.message,
                });
                this.setState({fetchError: e.message})
            })
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.district != this.props.district) {
            this.setState({callers: null});
            this.fetchCallers();
        }
    }

    editModal = () => {
      const callerForEditing = this.state.callers && this.state.callers.find((el)=>{
        return el.key == this.state.editingKey
      })

      return <EditCallerModalForm
        caller={callerForEditing} 
        display={this.state.editingKey != null} 
        onEditCaller={(callerDetails) => { this.onEditCaller(callerDetails)}} 
        onCancelEditCaller={this.onCancelEditCaller}
      ></EditCallerModalForm>
    }

    render() {
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
            loading={this.state.callers == null}
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
