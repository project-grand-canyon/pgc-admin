import React, { Component } from "react";
import { Button, Checkbox, Form, Input, message, Select } from "antd";
import { authHeader } from "../../_util/auth/auth-header";
import axios, { getErrorMessage } from "../../_util/axios-api";

class EditCaller extends Component {
  state = {
    saving: false,
  };

  componentDidMount() {
    if (!this.props.form) {
      return;
    }
    const { setFieldsValue } = this.props.form;
    const caller = this.props.caller;
    setFieldsValue({
      firstName: caller.firstName,
      lastName: caller.lastName,
      contactMethodEmail: caller.contactMethodEmail,
      contactMethodSMS: caller.contactMethodSMS,
      reminderDayOfMonth: caller.reminderDayOfMonth,
      phone: caller.phone,
      email: caller.email,
      zipCode: caller.zipCode,
      paused: caller.paused,
      notes: caller.notes,
    });
  }

  render() {
    return (
      <>
        {this.form()}
        <Button
          disabled={this.state.saving}
          style={{ margin: "4px" }}
          onClick={this.handleCancel}
        >
          Cancel
        </Button>
        <Button
          disabled={this.state.saving}
          style={{ margin: "4px" }}
          onClick={this.handleSave}
          type="primary"
        >
          Save
        </Button>
      </>
    );
  }

  form = () => {
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 24 },
        md: { span: 10 },
        lg: { span: 8 },
        xl: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 24 },
        md: { span: 14 },
        lg: { span: 16 },
        xl: { span: 19 },
      },
    };

    const { getFieldDecorator } = this.props.form;
    return (
      <Form {...formItemLayout}>
        <Form.Item label="First Name">
          {getFieldDecorator("firstName", {
            rules: [{ required: true, message: "First Name" }],
          })(<Input />)}
        </Form.Item>
        <Form.Item label="Last Name">
          {getFieldDecorator("lastName", {
            rules: [{ required: true, message: "Last Name" }],
          })(<Input />)}
        </Form.Item>
        <Form.Item label="Contact By SMS">
          {getFieldDecorator("contactMethodSMS", {
            valuePropName: "checked",
          })(<Checkbox onChange={this.toggleContactMethod} />)}
        </Form.Item>
        <Form.Item label="Contact By Email">
          {getFieldDecorator("contactMethodEmail", {
            valuePropName: "checked",
          })(<Checkbox onChange={this.toggleContactMethod} />)}
        </Form.Item>
        <Form.Item label="Phone">
          {getFieldDecorator("phone", {
            rules: [
              {
                required: this.props.form.getFieldValue("contactMethodSMS"),
                message: "Phone Number required if contacting by SMS",
              },
              {
                pattern: /^[0-9]{3}-?[0-9]{3}-?[0-9]{4}$/,
                message: "Phone number must be 10 digits (ex. 888-222-4444).",
              },
            ],
          })(<Input />)}
        </Form.Item>
        <Form.Item label="Email Address">
          {getFieldDecorator("email", {
            rules: [
              {
                required: this.props.form.getFieldValue("contactMethodEmail"),
                message: "Email address required if contacting by email",
              },
            ],
          })(<Input />)}
        </Form.Item>
        <Form.Item label="Zip Code">
          {getFieldDecorator("zipCode", {
            rules: [
              { message: "Zip Code" },
              { pattern: /^\d{5}$/, message: "Please use a 5 digit number" },
            ],
          })(<Input />)}
        </Form.Item>
        <Form.Item label="Notification Day">
          {getFieldDecorator(
            "reminderDayOfMonth",
            {}
          )(<Select>{Array.from({ length: 31 }, (x, i) => <Select.Option key={i+1} value={i+1}>{i+1}</Select.Option>)}</Select>)}
        </Form.Item>
        <Form.Item label="Pause Reminders">
          {getFieldDecorator("paused", {
            valuePropName: "checked",
          })(<Checkbox />)}
        </Form.Item>
        <Form.Item label="Notes">
          {getFieldDecorator("notes", {})(<Input.TextArea />)}
        </Form.Item>
      </Form>
    );
  };

  handleSave = () => {
    const { validateFieldsAndScroll } = this.props.form;
    validateFieldsAndScroll(null, { force: true }, (errors, values) => {
      if (errors == null) {
        const updated = {
          ...this.props.caller,
          ...this.props.form.getFieldsValue(),
        };
        updated["contactMethods"] = [];
        if (updated.contactMethodEmail) {
          updated["contactMethods"].push("email");
        }
        if (updated.contactMethodSMS) {
          updated["contactMethods"].push("sms");
        }
        if (updated.phone) {
          updated.phone = updated.phone.replace(/-/g, "");
        }
        this.setState(
          {
            saving: true,
          },
          () => {
            this.performSave(updated);
          }
        );
      }
    });
  };

  performSave = (callerDetails) => {
    const updatedCaller = {
      firstName: callerDetails.firstName,
      lastName: callerDetails.lastName,
      contactMethods: callerDetails.contactMethods,
      phone: callerDetails.phone,
      email: callerDetails.email,
      reminderDayOfMonth: callerDetails.reminderDayOfMonth,
      districtId: callerDetails.districtId,
      zipCode: callerDetails.zipCode,
      paused: callerDetails.paused,
      notes: callerDetails.notes,
    };
    const requestOptions = {
      url: `/callers/${callerDetails.key}`,
      method: "PUT",
      headers: { ...authHeader(), "Content-Type": "application/json" },
      data: updatedCaller,
    };
    axios(requestOptions)
      .then((response) => {
        this.setState({ saving: false }, () => {
          this.props.onSave();
        });
      })
      .catch((e) => {
        this.setState({ saving: false }, () => {
          message.error(`Error saving: ${getErrorMessage(e)}`);
        });
      });
  };

  handleCancel = () => {
    this.props.onCancel();
  };
}

const EditCallerForm = Form.create({
  name: "edit_caller_form",
})(EditCaller);

export default EditCallerForm;
