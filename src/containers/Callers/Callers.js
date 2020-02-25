import React, { Component } from 'react';
import { Redirect } from 'react-router';
import { Button, Icon, Input, Form, Modal, Popover, Table, Typography } from 'antd';

import _ from 'lodash'
import { DateTime } from 'luxon'
import axios from '../../_util/axios-api';
import { isSenatorDistrict } from '../../_util/district';
import { callerStatus, Status, sortedByStatus } from '../../_util/caller';
import { HistoryType } from './constants'

import { authHeader } from '../../_util/auth/auth-header';
import { connect } from 'react-redux';

import './Callers.module.css';
import CallerDetailModal from './CallerDetailModal';

class Callers extends Component {

    state = {
      districtCallers: null,
      allCallers: null,
      callerDetail: {},
      searchTerm:  null
    }

    isCallerInFocus = (key) => {
      return this.state.callerDetail && this.state.callerDetail['caller'] && this.state.callerDetail['caller']['callerId'] === key
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
      title: 'Call Day',
      dataIndex: 'reminderDayOfMonth',
      key: 'reminderDayOfMonth',
      sorter: (a, b) => { return a.reminderDayOfMonth - b.reminderDayOfMonth}
    },{
      title: 'Call Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        return this.callStatusIcon(status);
      },
      sorter: sortedByStatus
    },{
        title: 'Details',
        dataIndex: 'operation1',
        fixed: 'right',
        width: 50,
        render: (text, record) => {
          return (
            <div>
              { this.isCallerInFocus(record.key) ? (
                <Typography.Text>Details</Typography.Text>
              ) : (
                <Button onClick={() => this.showDetailModal(record.key)}>Details</Button>
              )}
            </div>
          );
        },
      }
    ];

    callStatusIcon = ({ monthsMissedCount, status }) => {
      switch (status) {
        case(Status.CURRENT): 
          return (
            <Popover content="This is an active caller." title="Current" trigger="hover">
              <Icon type="smile" theme="twoTone" twoToneColor="#52c41a" />
            </Popover>
          )
        case(Status.BRAND_NEW): 
          return (
            <Popover content="This person hasn't been asked to call yet." title="Brand New" trigger="hover">
              <Icon type="smile" theme="twoTone" />
            </Popover>
          )
        case(Status.PAUSED): 
          return (
            <Popover content="This person has paused call notifications. They are not participating in Project Grand Canyon." 
              title="Paused" 
              trigger="hover"
            > 
              <Icon type="pause-circle" theme="twoTone" twoToneColor="tan" />
            </Popover>
          )
        case(Status.WAITING): 
          return (
            <Popover content="This person just recently got their notification, and they haven't made their call yet." 
              title="Waiting For Call" 
              trigger="hover"
            > 
              <Icon type="message" theme="twoTone" twoToneColor="tan" />
            </Popover>
          )
        case(Status.LAPSED): 
          return (
            <Popover title="Lapsed" 
              content={`This person has not called for ${monthsMissedCount} ${monthsMissedCount === 1 ? "month" : "months"}`} 
              trigger="hover"
            >
              <Icon type="phone" theme="twoTone" twoToneColor="red" />
              {monthsMissedCount > 1 && (
                <Typography.Text type="danger">&nbsp;&times;&nbsp;{monthsMissedCount}</Typography.Text>
              )}
            </Popover>
          )
        default:
          return (
            <>
              <Icon type="stop" theme="twoTone" twoToneColor="red" />
              <Typography.Text type="danger"> Error</Typography.Text>
            </>
          );
      }
    }

    onUnfocusCaller = (cb) => {
      this.setState({callerDetail:null}, () => {
        cb && cb()
      })
    }

    showDetailModal = (key) => {
      const caller = (this.state.districtCallers && this.state.districtCallers.find((el)=>{
        return el.key === key
      })) || (this.state.allCallers && this.state.allCallers.find((el)=>{
        return el.key === key
      }));
      
      if(caller) {
        this.setState({ 
          callerDetail: {
            caller: caller
          } 
        }, () => {
          this.fetchCallerHistory();
        });
      }
    }

    fetchCallers() {
        const district = this.props.district;
        if (district) {
            const requestOptions = {
                url: `/callers?districtId=${district.districtId}`,
                method: 'GET',
                headers: { ...authHeader(), 'Content-Type': 'application/json' },
            };
            axios(requestOptions).then(({ data }) => {
                // TODO: Possibly move this into reducer logic if Redux is implemented
                const districtCallers = (data || []).map(caller => {
                  return {
                    ...caller,
                    key: caller.callerId,
                    contactMethodSMS: caller.contactMethods.indexOf('sms') !== -1,
                    contactMethodEmail: caller.contactMethods.indexOf('email') !== -1,
                    status: callerStatus(caller),
                  }
                });
                this.setState({districtCallers, callerDetail: null});
            }).catch((e) => {
                Modal.error({
                    title: "Error Loading Page",
                    content: e.message,
                });
                this.setState({callerDetail: null})
            });
        }

      if (this.props.user && this.props.user.root) {
        const allRequestOptions = {
          url: `/callers`,
          method: 'GET',
          headers: { ...authHeader(), 'Content-Type': 'application/json' },
        };
        axios(allRequestOptions).then(({ data }) => {
          const allCallers = (data || []).map(caller => {
            return {
              ...caller,
              key: caller.callerId,
              contactMethodSMS: caller.contactMethods.indexOf('sms') !== -1,
              contactMethodEmail: caller.contactMethods.indexOf('email') !== -1,
              status: callerStatus(caller),
            }
          });
          this.setState({allCallers});
        }).catch((e) => {
          Modal.error({
              title: "Error Loading Full Caller List",
              content: e.message,
          });
        });
      }
    }

    fetchCallerHistory() {
      const district = this.props.district;
      const caller = this.state.callerDetail && this.state.callerDetail.caller;
      if (district && caller) {
        const callHistoryRequestOptions = {
          url: `/calls/${caller['callerId']}`,
          method: 'GET',
          headers: { ...authHeader(), 'Content-Type': 'application/json' }
        };
        const reminderHistoryRequestOptions = {
          url: `/reminders/${caller['callerId']}`,
          method: 'GET',
          headers: { ...authHeader(), 'Content-Type': 'application/json' }
        };
        const callerDetail = {...this.state.callerDetail};
        Promise.all([
          axios(callHistoryRequestOptions), 
          axios(reminderHistoryRequestOptions)
        ]).then(([calls, reminders]) => {
          // TODO: Possibly move this into reducer logic if Redux is implemented
          const createHistoryItem = (timestamp, type) => {
            const dateTime = DateTime.fromSQL(timestamp)

            return {
              timestamp: dateTime.valueOf(),
              timestampDisplay: dateTime.toLocaleString(),
              type,
            }
          }

          const signUpHistory = [ createHistoryItem(caller.created, HistoryType.SIGN_UP) ]
          const callHistory = _.map(calls.data, ({ created }) => createHistoryItem(created, HistoryType.CALL))
          const reminderHistory = _.map(reminders.data, ({ timeSent }) => createHistoryItem(timeSent, HistoryType.NOTIFICATION))

          callerDetail.history = _([])
            .concat(signUpHistory, callHistory, reminderHistory)
            .sortBy('timestamp')
            .reverse()
            .value()
        }).catch( e => {
          callerDetail.callReminderError = e.message;
        }).then(()=>{
          this.setState({ callerDetail })
        });
      }
  }

    componentDidUpdate(prevProps) {
        if (prevProps.district !== this.props.district) {
            this.setState({callerDetail: null, callers: null});
            this.fetchCallers();
        }
    }

    detailModal = () => {
      const caller = this.state.callerDetail && this.state.callerDetail['caller']
      return <CallerDetailModal
        caller={this.state.callerDetail}
        display={caller != null}
        onEditCaller={(callerDetails) => { this.onEditCaller(callerDetails)}}
        onUnfocusCaller={this.onUnfocusCaller}
        onSave={this.onSavedCaller}
      ></CallerDetailModal>
    }

    onSavedCaller = () => {
      this.onUnfocusCaller(()=>{
        this.fetchCallers()
      })
    }

    allCallersJsx = () => {
      if (this.props.user && this.props.user.root){
        const callers = this.state.allCallers && this.state.allCallers.filter ( el => {
          if (!this.state.searchTerm) {
            return true
          }
          return el.firstName.indexOf(this.state.searchTerm) !== -1 ||
          el.lastName.indexOf(this.state.searchTerm) !== -1 ||
          (el.email && el.email.indexOf(this.state.searchTerm) !== -1) ||
          (el.phone && el.phone.indexOf(this.state.searchTerm) !== -1)
        })
      return (
        <>
          <Typography.Title level={2}>
            All Callers
          </Typography.Title>
          <Input allowClear onChange={(e => {this.setState({searchTerm: e.target.value})})} placeholder="Search by name, email, or phone number" />
          <Table
            loading={this.state.allCallers === null}
            bordered
            dataSource={callers}
            columns={this.columns}
            scroll={{ x: 300 }}
            scrollToFirstRowOnChange
            pagination={{
              onChange: (page)=>{this.onUnfocusCaller()},
            }}
          />
        </>
      )
    } else {
      return null
    }
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
          {this.detailModal()}
          <Table
            loading={this.state.districtCallers === null}
            bordered
            dataSource={this.state.districtCallers}
            columns={this.columns}
            scroll={{ x: 300 }}
            scrollToFirstRowOnChange
            pagination={{
              onChange: (page)=>{this.onUnfocusCaller()},
            }}
          />
          {this.allCallersJsx()}
        </>
		  );
		}
}

const mapStateToProps = state => {
    return {
        district: state.districts.selected,
        user: state.admin.admin
    };
};

const CallersTable = Form.create({ name: 'representative_edit' })(Callers);

export default connect(mapStateToProps)(CallersTable);
