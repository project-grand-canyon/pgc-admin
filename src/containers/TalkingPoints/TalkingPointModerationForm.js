import React, { Component } from "react";
import { Form, Select } from "antd";

class TalkingPointModeration extends Component {
  render() {
    const talkingPoint = this.props.talkingPoint
    if (this.props.talkingPoint == null) {
      return null;
    }
    const { getFieldDecorator } = this.props.form;
    return (
      <div>
        <Form>
          <Form.Item label="Status">
            {getFieldDecorator("status", {
              initialValue: talkingPoint.reviewStatus,
            })(
              <Select>
                <Select.Option key="promoted" value="promoted">
                  Promote
                </Select.Option>
                <Select.Option key="passed" value="passed">
                  Suppress
                </Select.Option>
                <Select.Option key="archived" value="archived">
                  Archive
                </Select.Option>
                <Select.Option value="waiting_review" disabled>
                  Awaiting Review
                </Select.Option>
              </Select>
            )}
          </Form.Item>
        </Form>
      </div>
    );
  }
}

const TalkingPointModerationForm = Form.create({
  name: "talking_points_moderation",
  onValuesChange: (props, _, values) => props.onValuesChange(values),
})(TalkingPointModeration);

export default TalkingPointModerationForm;
