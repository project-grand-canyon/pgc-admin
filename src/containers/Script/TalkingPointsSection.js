import React from "react";

import { Button, Icon, List, Popconfirm, Typography, Spin} from 'antd';

const TalkingPointsSection = ({district, themes, isSaving, scriptItemClicked}) => {
    if (district === null || themes === null) {
        return <></>
    }
    const list = <List
        itemLayout="vertical"
        bordered
        style={{background: "#FFFFFF"}}
        dataSource={district.script}
        renderItem={(item, idx) => {
            const theme = themes.find( (el) => {
                return el.themeId === item.themeId
            });

            return <List.Item
                key={item.talkingPointId}
                actions={[
                    <Button disabled={idx===0} shape="circle" onClick={e=>{scriptItemClicked(idx, "up")}}><Icon type="up-circle" theme="twoTone" /></Button>,
                    <Button disabled={idx===district.script.length-1} shape="circle" onClick={e=>{scriptItemClicked(idx, "down")}}><Icon type="down-circle" theme="twoTone" /></Button>,
                    <Popconfirm title="Are you sure you want to remove this talking point?" onConfirm={e=>{scriptItemClicked(idx, "remove")}} okText="Yes" cancelText="No">
                        <Button shape="circle">
                            <Icon type="minus-circle" theme="twoTone" twoToneColor="#ae1414" />
                        </Button>
                    </Popconfirm>
                ]}
            >
            <List.Item.Meta
                title={`${idx + 1}. ${theme.name}`}
            />
                <span>{item.content}</span>

            </List.Item>
        }
        }
    />
    const heading = (
        <>
            <Typography.Title level={3}>Talking Points</Typography.Title>
            <Typography.Paragraph>Change the order or remove talking points.</Typography.Paragraph>
        </>
    )
    const info = isSaving? <Spin /> : list
    return <div style={{marginTop: "1em"}}>
        {heading}
        {info}
    </div>
}

export default TalkingPointsSection;