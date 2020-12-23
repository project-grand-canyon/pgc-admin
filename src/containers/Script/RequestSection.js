import React from "react";
import { Button, Card, Icon, Input, Typography, Spin} from 'antd';

const RequestSection = ({ district, isSaving, isEditing, currentRequest, onClickEdit, onCancel, onSave }) => {

  if (district === null) {
    return <></>
  }

  let newRequestContent = currentRequest && currentRequest.content || "";

  if (isSaving) {
    return <Spin />
  }

const heading = (
    <>
        <Typography.Title level={3}>Request</Typography.Title>
        <Typography.Paragraph>Set the request that each of your callers will make to your Member of Congress. Ensure the request is respectful and relevant to the lawmaker.</Typography.Paragraph>
    </>
)

const immutableRequest = (
  <Card actions={[<Icon type="edit" onClick={onClickEdit} />]}>
      <Typography.Text>{currentRequest && currentRequest.content}</Typography.Text>
  </Card>
)

const input = <Input.TextArea defaultValue={currentRequest.content} autosize onChange = {(e) => {
  newRequestContent = e.target.value
}} />
const mutableRequest = (
    <>
        { input }
        <Button onClick={ onCancel }>Cancel</Button>
        <Button onClick={ (e) => {
          const newRequest = {...currentRequest}
          newRequest['content'] = newRequestContent
          onSave(newRequest)
        } 
           }>Save</Button>
    </>
)

const requestDisplay = isEditing ? mutableRequest : immutableRequest;

return (
    <>
        {heading}
        {requestDisplay}
    </>
)
};

export default RequestSection;