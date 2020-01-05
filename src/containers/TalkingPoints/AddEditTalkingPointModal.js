import React, { Component } from 'react';
import { Form, Input, Modal, Select, TreeSelect } from 'antd';

import groupBy from '../../_util/groupBy';


class AddEditTalkingPointModal extends Component {

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
                if (this.props.talkingPointUnderEdit && this.props.talkingPointUnderEdit.talkingPointId) {
                    values["talkingPointId"] = this.props.talkingPointUnderEdit.talkingPointId;
                }
                this.props.handleSave(values);
                this.props.form.resetFields()
            }
        });
    }

    handleCancel = () => {
        this.props.form.resetFields();
        this.props.handleCancel();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.props.talkingPointUnderEdit && !prevProps.talkingPointUnderEdit){

            const states = this.props.talkingPointUnderEdit['states'];
            const districts = this.props.talkingPointUnderEdit['districts'];
            let subScope = null;




            if (Array.isArray(states) && states.length) {
                subScope = states
            } else if (Array.isArray(districts) && districts.length) {
                subScope = districts
            }

            this.props.form.setFieldsValue({
                scope: this.props.talkingPointUnderEdit['scope'],
                theme: this.props.talkingPointUnderEdit['themeId'],
                content: this.props.talkingPointUnderEdit['content']
            });
            if (subScope){
                this.props.form.setFieldsValue({subScope: subScope})
            }
            if (this.props.talkingPointUnderEdit.referenceUrl) {
                this.props.form.setFieldsValue({referenceUrl: this.props.talkingPointUnderEdit.referenceUrl})
            }
        }
    }

    render() {
        const {
            getFieldDecorator
          } = this.props.form;
        return (<Modal
        maskClosable={false}
        visible = {this.props.display}
        title = {this.props.talkingPointUnderEdit ? "Edit Talking Point" : "Add a Talking Point"}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
        okText = "Save"
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
                    rules: [{required: true, message: 'You must write a message to the Member of Congress'},
                            {max: 512, message:'The message must not exceed 512 characters.'}]
                })(<Input.TextArea placeholder="The message to the Member of Congress" autosize={{ minRows: 3, maxRows: 6 }} />
                )}
            </Form.Item>
            <Form.Item label="Reference URL">
                {getFieldDecorator('referenceUrl', {
                })(
                    <Input placeholder="Link to reference like a news article" />
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

        if (!scope || scope === "national") {
            return <Form.Item>
            {getFieldDecorator("subScope", {initialValue: this.empty, rules:[{required: false}]})(<></>)}
            </Form.Item>
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

        const houseOfRepDistricts = this.props.districts.filter((district) => { return parseInt(district.number) >= 0 });

        const districtsByState = groupBy(houseOfRepDistricts, 'state');
        const treeData = Object.keys(districtsByState).sort().map((state)=>{
            return {
                value: state,
                title: state,
                selectable: false,
                disableCheckbox: true,
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
            multiple: true,
            treeCheckable: true,
            showCheckedStrategy: TreeSelect.SHOW_PARENT,
            searchPlaceholder: 'Please select'
          };
          return <Form.Item label="Congressional Districts">
            {getFieldDecorator("subScope", {initialValue: this.empty, rules:[{required: true, message: "Select at least one district"}]})(
                <TreeSelect {...tProps} />,
                )}
            </Form.Item>
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
        if (Object.keys(changedValues).indexOf('content') !== -1) {
            props.form.validateFields(['content']);
        }
        if (changedValues && changedValues.scope) {
            props.form.resetFields(['subScope'])
        }
    }
})(AddEditTalkingPointModal);

export default AddNewTalkingPointForm;
