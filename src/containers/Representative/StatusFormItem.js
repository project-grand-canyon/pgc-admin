import React from 'react';
import { Button, Card, Col, Form, Input, List, Modal, Row, Skeleton, Spin, Typography, Select} from 'antd';

const statusFormItem = ({ district, getFieldDecorator }) => {
    return (
        <Form.Item label="District Status">
        {getFieldDecorator('status', {
            initialValue: district.status
        })(
            <Select>
                <Select.Option value="active">Active</Select.Option>
                <Select.Option value="covid_paused">Paused for COVID-19</Select.Option>
            </Select>
        )}
        </Form.Item>
    );
}

export default statusFormItem;