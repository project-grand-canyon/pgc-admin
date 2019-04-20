import React, { Component } from 'react';
import { Form, Input, Modal, Select, TreeSelect } from 'antd';

import groupBy from '../../_util/groupBy';


class AddNewTalkingPointModal extends Component {

    empty = []

    scopes = [
        {"title": "Nationwide", "key": "national"},
        {"title": "One or more states", "key": "state"},
        {"title": "One or more districts", "key": "district"}
    ]

    handleOk = () => {
        const { validateFieldsAndScroll } = this.props.form;
        validateFieldsAndScroll((errors, values) => {
            if (errors == null) {
                this.props.handleAdd(values);
                this.props.form.resetFields()
            }
        });
    }

    handleCancel = () => {
        this.props.form.resetFields();
        this.props.handleCancel();
    }

    render() {
        const {
            getFieldDecorator
          } = this.props.form;
        return (<Modal
        visible = {this.props.display}
        title = "Add a Talking Point"
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        okText = "Add"
      >
        <Form layout="vertical">
            <Form.Item label="Theme">
            {getFieldDecorator("theme", {rules:[{required: true, message: 'You must select a theme for this talking point'}]})(
                <Select
                    showSearch
                    placeholder="Select a theme"
                    optionFilterProp="children"
                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                    {this.props.themes.map((el)=>{
                        return (<Select.Option key={el.themeId} value={el.themeId}>{el.name}</Select.Option>)
                    })}
                </Select>,
                )}
            </Form.Item> 
            <Form.Item label="Content">
                {getFieldDecorator('content', {
                    rules: [{required: true, message: 'You must write a message to the Member of Congress'}]
                })(<Input.TextArea placeholder="The message to the Member of Congress" autosize={{ minRows: 3, maxRows: 6 }} />
                )}
            </Form.Item>
            <Form.Item label="Scope">
            {getFieldDecorator("scope", {rules:[{required: true, message: "Scope is required"}]})(
                <Select
                    showSearch
                    placeholder="Select a scope">
                    {this.scopes.map((el)=>{
                        return (<Select.Option key={el.key} value={el.key}>{el.title}</Select.Option>)
                    })}
                </Select>,
                )}
            </Form.Item> 
            {this.subscopeInput(getFieldDecorator)}
        </Form>
      </Modal>);
    }

    subscopeInput = (getFieldDecorator) => {
        if (!this.props.form) {
            return null
        }

        const scope = this.props.form.getFieldValue('scope')

        if (!scope || scope == "national") {
            return null
        }

        if (scope === "state") {
            return this.states(getFieldDecorator)
        }

        if (scope === "district") {
            return this.districts(getFieldDecorator)
        }

    }

    districts = (getFieldDecorator) => {

        if (!this.props.districts) {
            return []
        }
        
        const houseOfRepDistricts = this.props.districts.filter((district) => { return parseInt(district.number) > 0 });

        const districtsByState = groupBy(houseOfRepDistricts, 'state');
        const treeData = Object.keys(districtsByState).sort().map((state)=>{
            return {
                value: state,
                title: state,
                children: districtsByState[state].sort((a, b)=> {
                    return parseInt(a.number) - parseInt(b.number)
                }).map((district) =>{
                    return {
                        value: district.districtId,
                        title: `${state}-${district.number} (${district.repLastName})`
                    }
                })
            }
        })

        const tProps = {
            treeData,
            allowClear: true,
            treeCheckable: true,
            showCheckedStrategy: TreeSelect.SHOW_PARENT,
            searchPlaceholder: 'Please select'
          };
          return <Form.Item label="Congressional Districts">
            {getFieldDecorator("subScope", {initialValue: this.empty, rules:[{required: true, message: "Select at least one district"}]})(
                <TreeSelect {...tProps} />,
                )}
            </Form.Item> 
          return ;

    }

    states = (getFieldDecorator) => {
        if (!this.props.districts) {
            return []
        }
        const stateList = Array.from(new Set(this.props.districts.map(el=>{return el.state}))).sort()

        return <Form.Item label="States">
        {getFieldDecorator("subScope", {initialValue: this.empty, rules:[{required: true, message: "Select at least one state"}]})(
            <Select mode="multiple">
                { stateList.map( (el) => {
                    return <Select.Option key={el}>{el}</Select.Option>
                })}
            </Select>,
            )}
        </Form.Item> 
    }

}

const AddNewTalkingPointForm = Form.create({ 
    name: 'add_new_talking_point_form', 
    onValuesChange (props, changedValues, allValues) {
        if (changedValues && changedValues.scope) {
            props.form.resetFields(['subScope'])
        }
    } 
})(AddNewTalkingPointModal);

export default AddNewTalkingPointForm;