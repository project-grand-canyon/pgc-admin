import React from "react";
import { Icon, List, Typography } from 'antd';

const TalkingPointCard = ({talkingPoint, createdBy, theme, isInScript, scriptToggle, edit, isShowingModerationControls }) => {
        if (talkingPoint == null || talkingPoint.created == null) {
            return null
        }

        const reference = talkingPoint.referenceUrl ?
            <Typography.Text copyable={{ text: talkingPoint.referenceUrl }}>
                <a target="_blank" href={talkingPoint.referenceUrl} rel="noopener noreferrer">Reference URL</a>
            </Typography.Text> : null;
        const createdDate = new Date(talkingPoint.created.replace(/-/g, "/") + " UTC");
        const createdByDesc = createdBy && createdBy.email ?
        <><Typography.Text style={{fontStyle: "italic"}}>Created on {createdDate.toDateString()} by: </Typography.Text><Typography.Text style={{fontStyle: "italic", color: "#0081C7"}} copyable={{ text: createdBy.email }}>{createdBy.email} </Typography.Text></>
             : null;
        const description = createdByDesc

        return <List.Item
            style={{background: talkingPoint.bg, padding: "10px"}}
            key={talkingPoint.talkingPointId}
            extra={reference}
            actions={[
                <span>
                    <Icon style={{ marginRight: 8, color: "#0081C7" }} type={isInScript ? "check-square" : "border"} onClick={(e)=> {
                       scriptToggle(talkingPoint.talkingPointId)
                    } }/>
                    <Typography.Text>In Script</Typography.Text>
                </span>,
                <span>
                    <Icon style={{ marginRight: 8 }} type="edit" theme="twoTone" twoToneColor="#0081C7" onClick={(e)=> {
                        edit(talkingPoint)
                    } } />
                    <Typography.Text>Edit</Typography.Text>
                </span> 
            ]}
        >
            <List.Item.Meta
                title={theme.name}
                description= {description}
            />
                <Typography.Paragraph>{talkingPoint.content}</Typography.Paragraph>
        </List.Item>  
};

export default TalkingPointCard;