import React, { Component } from 'react';
import { Form, Input, Modal } from 'antd';

import styles from './OfficeModal.module.css';

class OfficeModal extends Component {
    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!this.props.form) {
            return
        }

        const { setFieldsValue } = this.props.form;

        if (this.props.office && prevProps.office !== this.props.office) {
            const office = this.props.office;
            setFieldsValue({
                city: office.address && office.address.city || '',
                addressLine1: office.address && office.address.addressLine1 || '',
                addressLine2: office.address && office.address.addressLine2 || '',
                phone: office.phone || '',
                zipCode: office.address && office.address.zipCode || '',
                state: office.address && office.address.state || '',
            })    
        }
    }

    handleOk = () => {
        const { validateFieldsAndScroll } = this.props.form;
        validateFieldsAndScroll((errors, values) => {
            if (errors == null) {
                if (this.props.office && this.props.office.districtOfficeId) {
                    values["districtOfficeId"] = this.props.office.districtOfficeId;
                    this.props.onUpdateOffice(values);
                } else {
                    this.props.onAddOffice(values);
                }
                this.props.form.resetFields()
            }
        });
    }

    handleCancel = () => {
        this.props.onCancelUpdateOffice();
        this.props.form.resetFields()
    }

    render() {
        const office = {...this.props.office};
        const {
            getFieldDecorator
          } = this.props.form;
        return (<Modal
        visible = {this.props.display}
        title = {office.districtOfficeId ? "Edit Office" : "Add Office"} 
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        okText = {office.districtOfficeId ? "Edit Office" : "Add Office"}
      >
        <Form layout="vertical">
            <Form.Item label="Phone Number">
                {getFieldDecorator('phone', {
                    rules: [{required: true, message: 'Office Phone Number'}, 
                    {pattern: /^\d{3}-\d{3}-\d{4}$/, message: 'Please use format 555-555-1234'}]
                })(<Input />)}
            </Form.Item>
            <Form.Item label="Address (Line 1)">
                {getFieldDecorator('addressLine1', {
                    rules: [{required: true, message: 'Address, for ex. 123 Main Street'}]
                })(<Input />)}
            </Form.Item>
            <Form.Item label="Address (Line 2)">
                {getFieldDecorator('addressLine2', {
                    rules: [{required: false, message: 'Additional Address Info, for ex. Suite 456'}]
                })(<Input />)}
            </Form.Item>
            <Form.Item label="City">
                {getFieldDecorator('city', {
                    rules: [{required: true, message: 'City (use Washington for Washington DC office)'}]
                })(<Input />)}
            </Form.Item>
            <Form.Item label="State">
                {getFieldDecorator('state', {
                    rules: [{required: true, message: 'State (use DC for Washington DC office)', max: 2}]
                })(<Input />)}
            </Form.Item>
            <Form.Item label="Zip Code">
                {getFieldDecorator('zipCode', {
                    rules: [{required: true, message: 'Zip Code'},
                    {pattern: /^\d{5}$/, message: 'Please use a 5 digit number'}]
                })(<Input />)}
            </Form.Item>
        </Form>
      </Modal>);
    }
}

const OfficeEditForm = Form.create({ name: 'office_edit' })(OfficeModal);

export default OfficeEditForm;