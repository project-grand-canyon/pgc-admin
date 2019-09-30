import React, { Component } from 'react';
import { Redirect } from 'react-router';
import { Button, Icon, Form, Modal, Popover, Table, Typography } from 'antd';

import axios from '../../_util/axios-api';
import { isSenatorDistrict } from '../../_util/district';
import { callerStatus, monthsMissedCount } from '../../_util/caller';

import { authHeader } from '../../_util/auth/auth-header';
import { connect } from 'react-redux';

import './Callers.module.css';
import CallerDetailModal from './CallerDetailModal';

class Callers extends Component {

    state = {
		  callers: null,
      callerDetail: {}
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
        title: 'Call Status',
        dataIndex: 'status',
		    key: 'status',
        render: (status) => {
          return this.callStatusIcon(status);
        },
        sorter: (a, b) => {
          const orderedList = ["CURRENT", "WAITING", "BRAND_NEW", "PAUSED", "LAPSED"];   
          const aIndex = orderedList.indexOf(a.status.status);
          const bIndex = orderedList.indexOf(b.status.status);       
          const aScore = aIndex === -1 ? orderedList.length : aIndex;
          const bScore = bIndex === -1 ? orderedList.length : bIndex;
          const diff = bScore - aScore;
          if (diff !== 0 || a.status.status !== "LAPSED") {
            return diff;
          }
          return a.status.monthsMissedCount - b.status.monthsMissedCount;
        }
    },{
        title: 'Details',
        dataIndex: 'operation1',
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

    callStatusIcon = (status) => {
      switch (status.status) {
        case('CURRENT'): return <Popover content="This is an active caller." title="Current" trigger="hover"><Icon type="smile" theme="twoTone" twoToneColor="#52c41a" /></Popover>
        case('BRAND_NEW'): return <Popover content="This person hasn't been asked to call yet." title="Brand New" trigger="hover"> <Icon type="smile" theme="twoTone" /></Popover>
        case('PAUSED'): return <Popover content="This person has paused call notifications. They are not participating in Project Grand Canyon." title="Paused" trigger="hover"> <Icon type="pause-circle" theme="twoTone" twoToneColor="tan" /></Popover>
        case('WAITING'): return <Popover content="This person just recently got their notification, and they haven't made their call yet." title="Waiting For Call" trigger="hover"> <Icon type="message" theme="twoTone" twoToneColor="tan" /></Popover>
        case('LAPSED'): 
        return <Popover content={`This person has not called for ${status.monthsMissedCount} ${status.monthsMissedCount === 1 ? "month" : "months"}`} title="Lapsed" trigger="hover">
          {
            (status.monthsMissedCount > 3) ?
            (
              <div style={{display: "inherit"}}>
                <Icon type="phone" theme="twoTone" twoToneColor="red" />
                <Typography.Text type="danger">{` x${status.monthsMissedCount}`}</Typography.Text>
              </div>
            ) : (
                  <div style={{display: "inherit"}}>
                    { 
                      Array(status.monthsMissedCount).fill().map((el, idx)=>{
                        return <Icon key={idx} type="phone" theme="twoTone" twoToneColor="red" />
                      })
                    }
                  </div>
            )
          }
          </Popover>
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
      const caller = this.state.callers && this.state.callers.find((el)=>{
        return el.key === key
      });
      
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

    fetchCallers(cb) {
        const district = this.props.district;
        if (district) {
            const requestOptions = {
                url: `/callers?districtId=${district.districtId}`,
                method: 'GET',
                headers: { ...authHeader(), 'Content-Type': 'application/json' },
            };
            axios(requestOptions).then((response)=>{
                const allCallers = response.data;
                const callers = allCallers.map(el => {
                  const key = el['callerId'];
                  el.key = key;
                  el.contactMethodSMS = el.contactMethods.indexOf('sms') !== -1;
                  el.contactMethodEmail = el.contactMethods.indexOf('email') !== -1;
                  el.status = {
                    status: callerStatus(el),
                    monthsMissedCount: monthsMissedCount(el)
                  };
                  return el;
                });
                this.setState({callers: callers, callerDetail: null});
            }).catch((e) => {
                Modal.error({
                    title: "Error Loading Page",
                    content: e.message,
                });
                this.setState({callerDetail: null})
            }).then(()=>{
              cb && cb()
            })
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
        ]).then(values => {
          callerDetail['calls'] = values[0].data;
          callerDetail['reminders'] = values[1].data;
        }).catch( e => {
          callerDetail['callReminderError'] = e.message;
        }).then(()=>{
          this.setState({
            callerDetail: callerDetail
          });
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
            loading={this.state.callers === null}
            bordered
            dataSource={this.state.callers}
            columns={this.columns}
            pagination={{
              onChange: (page)=>{this.onUnfocusCaller()},
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
