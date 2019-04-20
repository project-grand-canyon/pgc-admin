import React from 'react';

import { Button, Card, Icon, Avatar, Typography } from 'antd';


import styles from './TalkingPointCard.module.css';

const star = (props) => {
    const icon = <Icon type="star" theme={props.isInScript ? "filled" : "outlined" } onClick={(e)=> {
        props.handleScriptToggle(props.talkingPoint.talkingPointId)
    } }/>
    return (
        <div style={{display: "flex", flexDirection: "column"}}>
            {icon}
            <Typography.Text>{props.isInScript ? "In Script" : "Not Used"}</Typography.Text>
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
        </Card>
    );  
};

export default talkingpointcard;