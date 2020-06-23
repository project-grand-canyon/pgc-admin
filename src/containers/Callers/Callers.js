import React, { Component } from "react";
import { Redirect } from "react-router";
import {
  Button,
  Icon,
  Input,
  Form,
  Modal,
  message,
  Popover,
  Table,
  Typography,
} from "antd";
import fileDownload from "js-file-download";

import _ from "lodash";
import {
  getAllCallers,
  getDistrictCallers,
  getCallerHistories,
} from "../../_util/axios-api";
import { isSenatorDistrict } from "../../_util/district";
import { Status, sortedByStatus, asCsv } from "../../_util/caller";

import { connect } from "react-redux";

import "./Callers.module.css";
import CallerDetailModal from "./CallerDetailModal";

class Callers extends Component {
  state = {
    districtCallers: null,
    allCallers: null,
    callerDetail: {},
    searchTerm: null,
    generatingCsv: false,
  };

  isCallerInFocus = (key) => {
    return (
      this.state.callerDetail &&
      this.state.callerDetail["caller"] &&
      this.state.callerDetail["caller"]["callerId"] === key
    );
  };

  componentDidMount() {
    this.fetchCallers();
  }

  columns = [
    {
      title: "First Name",
      dataIndex: "firstName",
      key: "firstName",
      sorter: (a, b) => {
        return a.firstName.localeCompare(b.firstName);
      },
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
      key: "lastName",
      sorter: (a, b) => {
        return a.lastName.localeCompare(b.lastName);
      },
    },
    {
      title: "Call Day",
      dataIndex: "reminderDayOfMonth",
      key: "reminderDayOfMonth",
      sorter: (a, b) => {
        return a.reminderDayOfMonth - b.reminderDayOfMonth;
      },
    },
    {
      title: "Call Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        return this.callStatusIcon(status);
      },
      sorter: sortedByStatus,
    },
    {
      title: "Details",
      dataIndex: "operation1",
      fixed: "right",
      width: 50,
      render: (text, record) => {
        return (
          <div>
            {this.isCallerInFocus(record.key) ? (
              <Typography.Text>Details</Typography.Text>
            ) : (
              <Button onClick={() => this.showDetailModal(record.key)}>
                Details
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  callStatusIcon = ({ monthsMissedCount, status }) => {
    switch (status) {
      case Status.CURRENT:
        return (
          <Popover
            content="This is an active caller."
            title="Current"
            trigger="hover"
          >
            <Icon type="smile" theme="twoTone" twoToneColor="#52c41a" />
          </Popover>
        );
      case Status.BRAND_NEW:
        return (
          <Popover
            content="This person hasn't been asked to call yet."
            title="Brand New"
            trigger="hover"
          >
            <Icon type="smile" theme="twoTone" />
          </Popover>
        );
      case Status.PAUSED:
        return (
          <Popover
            content="This person has paused call notifications. They are not participating in Project Grand Canyon."
            title="Paused"
            trigger="hover"
          >
            <Icon type="pause-circle" theme="twoTone" twoToneColor="tan" />
          </Popover>
        );
      case Status.WAITING:
        return (
          <Popover
            content="This person just recently got their notification, and they haven't made their call yet."
            title="Waiting For Call"
            trigger="hover"
          >
            <Icon type="message" theme="twoTone" twoToneColor="tan" />
          </Popover>
        );
      case Status.LAPSED:
        return (
          <Popover
            title="Lapsed"
            content={`This person has not called for ${monthsMissedCount} ${
              monthsMissedCount === 1 ? "month" : "months"
            }`}
            trigger="hover"
          >
            <Icon type="phone" theme="twoTone" twoToneColor="red" />
            {monthsMissedCount > 1 && (
              <Typography.Text type="danger">
                &nbsp;&times;&nbsp;{monthsMissedCount}
              </Typography.Text>
            )}
          </Popover>
        );
      default:
        return (
          <>
            <Icon type="stop" theme="twoTone" twoToneColor="red" />
            <Typography.Text type="danger"> Error</Typography.Text>
          </>
        );
    }
  };

  onUnfocusCaller = (cb) => {
    this.setState({ callerDetail: null }, () => {
      cb && cb();
    });
  };

  showDetailModal = (key) => {
    const caller =
      (this.state.districtCallers &&
        this.state.districtCallers.find((el) => {
          return el.key === key;
        })) ||
      (this.state.allCallers &&
        this.state.allCallers.find((el) => {
          return el.key === key;
        }));

    if (caller) {
      this.setState(
        {
          callerDetail: {
            caller: caller,
          },
        },
        () => {
          getCallerHistories(
            [this.state.callerDetail.caller],
            (err, history) => {
              const callerDetail = { ...this.state.callerDetail };
              if (err) {
                callerDetail.callReminderError = err.message;
              } else {
                callerDetail.history = this.makeTimeline(history[0]);
              }
              this.setState({ callerDetail });
            }
          );
        }
      );
    }
  };

  makeTimeline = (history) => {
    const { signUpHistory, callHistory, reminderHistory } = {
      ...history,
    };
    return _([])
      .concat(signUpHistory, callHistory, reminderHistory)
      .sortBy("timestamp")
      .reverse()
      .value();
  };

  fetchCallers = () => {
    if (this.props.district) {
      getDistrictCallers(this.props.district, (err, callers) => {
        if (err) {
          Modal.error({
            title: "Error Loading Page",
            content: err.message,
          });
          this.setState({ callerDetail: null });
        } else {
          this.setState({ districtCallers: callers, callerDetail: null });
        }
      });
    }

    if (this.props.user && this.props.user.root) {
      getAllCallers((err, callers) => {
        if (err) {
          Modal.error({
            title: "Error Loading Full Caller List",
            content: err.message,
          });
        } else {
          this.setState({ allCallers: callers });
        }
      });
    }
  };

  componentDidUpdate(prevProps) {
    if (prevProps.district !== this.props.district) {
      this.setState({ callerDetail: null, callers: null });
      this.fetchCallers();
    }
  }

  detailModal = () => {
    const caller = this.state.callerDetail && this.state.callerDetail["caller"];
    return (
      <CallerDetailModal
        caller={this.state.callerDetail}
        display={caller != null}
        onEditCaller={(callerDetails) => {
          this.onEditCaller(callerDetails);
        }}
        onUnfocusCaller={this.onUnfocusCaller}
        onSave={this.onSavedCaller}
      ></CallerDetailModal>
    );
  };

  onSavedCaller = () => {
    this.onUnfocusCaller(() => {
      this.fetchCallers();
    });
  };

  onClickDownloadAsCsv = (event) => {
    if (!this.state.districtCallers) {
      message.error("Could not generate a CSV");
      return;
    }

    const hide = message.loading("Generating a CSV", 0);
    getCallerHistories([...this.state.districtCallers], (err, histories) => {
      if (err) {
        message.error(`Could not generate a CSV - ${err.message}`);
      } else {
        hide();

        const enrichedCallers = this.state.districtCallers.map(
          (caller, index) => {
            const history = histories[index];
            caller.paused = caller.paused ? "Paused" : "Active"
            caller.totalCalls = history.callHistory.length;
            caller.history = JSON.stringify(this.makeTimeline(history));
            return caller;
          }
        );

        const data = asCsv(enrichedCallers);
        fileDownload(
          data,
          `${this.props.district.state}${this.props.district.number}.csv`
        );
        message.success(`CSV has downloaded!`);
      }
    });
  };

  allCallersJsx = () => {
    if (this.props.user && this.props.user.root) {
      const callers =
        this.state.allCallers &&
        this.state.allCallers.filter((el) => {
          if (!this.state.searchTerm) {
            return true;
          }
          return (
            el.firstName.indexOf(this.state.searchTerm) !== -1 ||
            el.lastName.indexOf(this.state.searchTerm) !== -1 ||
            (el.email && el.email.indexOf(this.state.searchTerm) !== -1) ||
            (el.phone && el.phone.indexOf(this.state.searchTerm) !== -1)
          );
        });
      return (
        <>
          <Typography.Title level={2}>All Callers</Typography.Title>
          <Input
            allowClear
            onChange={(e) => {
              this.setState({ searchTerm: e.target.value });
            }}
            placeholder="Search by name, email, or phone number"
          />
          <Table
            loading={this.state.allCallers === null}
            bordered
            dataSource={callers}
            columns={this.columns}
            scroll={{ x: 300 }}
            scrollToFirstRowOnChange
            pagination={{
              onChange: (page) => {
                this.onUnfocusCaller();
              },
            }}
          />
        </>
      );
    } else {
      return null;
    }
  };

  render() {
    if (isSenatorDistrict(this.props.district)) {
      return <Redirect to="/script" />;
    }

    return (
      <>
        <Typography.Title level={2}>Callers for District</Typography.Title>
        {this.detailModal()}

        <Button
          disabled={this.state.districtCallers === null}
          onClick={this.onClickDownloadAsCsv}
        >
          Download as CSV
        </Button>

        <Table
          loading={this.state.districtCallers === null}
          bordered
          dataSource={this.state.districtCallers}
          columns={this.columns}
          scroll={{ x: 300 }}
          scrollToFirstRowOnChange
          pagination={{
            onChange: (page) => {
              this.onUnfocusCaller();
            },
          }}
        />
        {this.allCallersJsx()}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    district: state.districts.selected,
    user: state.admin.admin,
  };
};

const CallersTable = Form.create({ name: "representative_edit" })(Callers);

export default connect(mapStateToProps)(CallersTable);
