import React, { Component } from 'react';
import { Checkbox, Form, Input, Modal } from 'antd';

class EditCallerModal extends Component {

    state = {
        requiresPhone: null,
        requiresEmail: null
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!this.props.form) {
            return
        }

        const { setFieldsValue } = this.props.form;

        if (this.props.caller && prevProps.caller !== this.props.caller) {
            const caller = this.props.caller;
            setFieldsValue({
                firstName: caller.firstName,
                lastName: caller.lastName,
                contactMethodEmail: caller.contactMethodEmail,
                contactMethodSMS: caller.contactMethodSMS,
                phone: caller.phone,
                email: caller.email,
                zipCode: caller.zipCode,
                paused: caller.paused,
            });
        }
    }

    render() {
        const caller = {...this.props};
        const {
            getFieldDecorator,
            onValuesChange,
          } = this.props.form;

        return (<Modal
        visible = {this.props.display}
        title = "Edit Caller"
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        okText = "Save"
      >
        <Form layout="vertical">
            <Form.Item label="First Name">
                {getFieldDecorator('firstName', {
                    rules: [{required: true, message: 'First Name'}]
                })(<Input />)}
            </Form.Item>
            <Form.Item label="Last Name">
                {getFieldDecorator('lastName', {
                    rules: [{required: true, message: 'Last Name'}]
                })(<Input />)}
            </Form.Item>
            <Form.Item label="Contact By SMS">
                {getFieldDecorator('contactMethodSMS', {
                    valuePropName: 'checked',
                })(<Checkbox onChange={this.toggleContactMethod}/>)}
            </Form.Item>
            <Form.Item label="Contact By Email">
                {getFieldDecorator('contactMethodEmail', {
                    valuePropName: 'checked',
                })(<Checkbox onChange={this.toggleContactMethod}/>)}
            </Form.Item>
            <Form.Item label="Phone">
                {getFieldDecorator('phone', {
                    rules: [{required: this.props.form.getFieldValue('contactMethodSMS'), message: 'Phone Number required if contacting by SMS'}]
                })(<Input />)}
            </Form.Item>
            <Form.Item label="Email Address">
                {getFieldDecorator('email', {
                    rules: [{required: this.props.form.getFieldValue('contactMethodEmail'), message: 'Email address required if contacting by email'}]
                })(<Input />)}
            </Form.Item>
            <Form.Item label="Zip Code">
                {getFieldDecorator('zipCode', {
                    rules: [{required: true, message: 'Zip Code'},
                    {pattern: /^\d{5}$/, message: 'Please use a 5 digit number'}]
                })(<Input />)}
            </Form.Item>
            <Form.Item label="Pause Reminders">
                {getFieldDecorator('paused', {
                    valuePropName: 'checked',
                })(<Checkbox/>)}
            </Form.Item>
        </Form>
      </Modal>);
    }

    handleOk = () => {
        const { validateFieldsAndScroll } = this.props.form;
        validateFieldsAndScroll(null, {force: true}, (errors, values) => {
            if (errors == null) {
                const updated = {...this.props.caller, ...this.props.form.getFieldsValue()};
                this.props.onEditCaller(updated);
            }
        });
    }

    handleCancel = () => {
        this.props.onCancelEditCaller();
    }
}

const EditCallerModalForm = Form.create({ 
    name: 'edit_caller_modal_form' }, 
    )(EditCallerModal);

export default EditCallerModalForm;