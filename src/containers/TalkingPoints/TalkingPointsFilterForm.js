import React, { Component } from 'react';
import { Checkbox, Col, Form, Input, DatePicker, Row, Select } from 'antd';

class TalkingPointsFilter extends Component {

    render() {
        const filters = this.props.filters;
        const { getFieldDecorator } = this.props.form;

        const moderationControl = this.props.showsModerationControl ? (
            <Row>
                <Col>
                    <Form.Item label="Review Status">
                        {getFieldDecorator("reviewStatus", {initialValue: filters && filters.reviewStatus})(
                            <Checkbox.Group>
                                <Checkbox value={"promoted"}>Approved</Checkbox>
                                <Checkbox value={"passed"}>Suppressed</Checkbox>
                                <Checkbox value={"waiting_review"}>Awaiting Review</Checkbox>
                                <Checkbox value={"archived"}>Archived</Checkbox>
                            </Checkbox.Group>
                        )}
                    </Form.Item>
                </Col>
            </Row>
        ) : null

        return (
            <Form>
                <Row>
                    <Col sm={24} md={12} >
                        <Form.Item label="Creation Date">
                            {getFieldDecorator("creationDate", {initialValue: filters && filters.creationDate})(
                                <DatePicker.RangePicker />
                            )}
                        </Form.Item>
                    </Col>
                    <Col sm={24} md={12} >
                        <Form.Item label="Last Updated Date">
                            {getFieldDecorator("updatedDate", {initialValue: filters && filters.updatedDate})(
                                <DatePicker.RangePicker />
                            )}
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
                    <Col sm={24} md={6} >
                        <Form.Item label="Relevance">
                            {getFieldDecorator("scope", {initialValue: filters && filters.scope})(
                                <Checkbox.Group>
                                    <Checkbox value={"national"}>National</Checkbox>
                                    <Checkbox value={"state"}>My State</Checkbox>
                                    <Checkbox value={"district"}>My District</Checkbox>
                            </Checkbox.Group>
                            )}
                        </Form.Item>
                    </Col>
                    <Col sm={24} md={6} >
                        <Form.Item label="Theme">
                        {getFieldDecorator("theme", {initialValue: filters && filters.theme})(
                            <Select
                                showSearch
                                allowClear
                                placeholder="Select a theme"
                                optionFilterProp="children"
                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                {this.props.themes.map((el)=>{
                                    return (<Select.Option key={el.name} value={el.name}>{el.name}</Select.Option>)
                                })}
                            </Select>,
                            )}
                        </Form.Item>
                    </Col>
                    <Col sm={24} md={6} >
                        <Form.Item label="Currently selected">
                            {getFieldDecorator("script", {
                                valuePropName: 'checked',
                                initialValue: filters && filters.script
                            })(
                                <Checkbox value={"script"}>In Script</Checkbox>
                            )}
                        </Form.Item>
                    </Col>
                    <Col sm={24} md={6} >
                        <Form.Item label="Author">
                            {getFieldDecorator("author", {initialValue: filters && filters.author})(
                                <Input placeholder="Username or email" />
                            )}
                        </Form.Item>
                    </Col>
                </Row>
                {moderationControl}
            </Form>
        );
    }
}

const TalkingPointsFilterForm = Form.create({
    name: 'talking_points_filter_sort',
    onValuesChange: (props, _, values) => props.onValuesChange(values)
})(TalkingPointsFilter);

export default TalkingPointsFilterForm;