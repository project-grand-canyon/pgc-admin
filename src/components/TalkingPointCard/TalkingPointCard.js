import React from 'react';

import { Button, Card, Icon, Avatar, Typography } from 'antd';


import styles from './TalkingPointCard.module.css';

const star = (props) => {
    const icon = <Icon type={props.isInScript ? "check-square" : "border" } onClick={(e)=> {
        props.handleScriptToggle(props.talkingPoint.talkingPointId)
    } }/>
    return (
        <div style={{display: "flex", flexDirection: "column"}}>
            {icon}
            <Typography.Text>In Script</Typography.Text>
        </div>
    )
}

const edit = () => {
    const icon = <Icon type="edit" />
    return (
        <div style={{display: "flex", flexDirection: "column"}}>
            {icon}
            <Typography.Text>Edit</Typography.Text>
        </div>
    )
}

const references = (props) => {
    const reference = props.talkingPoint.referenceUrl ?
        <Typography.Paragraph copyable={{ text: props.talkingPoint.referenceUrl }} style={{color:"black"}}>
            <a target="_blank" href={props.talkingPoint.referenceUrl}>Reference URL</a>
        </Typography.Paragraph> : null;
    const createdBy = props.createdBy && props.createdBy.email ? 
        <Typography.Paragraph copyable={{ text: props.createdBy.email }} style={{color:"black"}}>Created by: {props.createdBy.email} </Typography.Paragraph> : null;
    return <Typography.Paragraph>
        {reference}{createdBy}
    </Typography.Paragraph>
}

const talkingpointcard = (props) => {
    return (
        <Card
        actions={[ star(props), edit()]}
        >
            <Card.Meta
                title= {props.title}
            >   
            </Card.Meta>
            <Typography.Paragraph style={{color:"black"}}>{props.talkingPoint.content}</Typography.Paragraph>
            {references(props)}
        </Card>
    );  
};

export default talkingpointcard;