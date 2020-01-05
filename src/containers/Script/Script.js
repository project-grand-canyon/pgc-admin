import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import get from "lodash/get"

import { Button, Card, Icon, Input, List, Modal, message, Skeleton, Form, Popconfirm, Typography, Spin} from 'antd';

import axios from '../../_util/axios-api';
import { displayName } from '../../_util/district';
import { authHeader } from '../../_util/auth/auth-header';
import { connect } from 'react-redux';

class Script extends Component {
    state = {
        hydratedDistrict: null,
        themes: null,
        savingEdits: false,
        updatedRequest: null,
    }

    componentDidMount() {
        if (this.state.hydratedDistrict === null) {
            this.fetchData();
        }
    }

    fetchData(cb) {
        if (cb && this.state.hydratedDistrict) {
            const dis = {...this.state.hydratedDistrict}
            dis.script = []
            this.setState({hydratedDistrict: dis, themes: null},()=>{
                this.doFetchData(cb)
            })
        } else {
            this.doFetchData(cb)
        }
    }

    doFetchData(cb){
        if (this.props.district) {
            const requestOptions = {
                url: `/districts/${this.props.district.districtId}/hydrated`,
                method: 'GET',
                headers: { ...authHeader(), 'Content-Type': 'application/json' },
            };
            axios(requestOptions).then((response)=>{
                const district = response.data;
                if (district.districtId === this.props.district.districtId) {
                    this.setState({hydratedDistrict: district});
                }
            }).catch((e) => {
                Modal.error({
                    title: "Error Loading Page",
                    content: e.message,
                });
                this.setState({fetchError: e.message})
            }).then(()=>{
                cb && cb()
            })
        }

        const themesRequestOptions = {
            url: `/themes`,
            method: 'GET',
            headers: { ...authHeader(), 'Content-Type': 'application/json' },
        };
        axios(themesRequestOptions).then((response)=>{
            this.setState({themes: response.data});
        }).catch((e) => {
            console.log(e)
        })
    }

    componentDidUpdate(prevProps) {
        if (prevProps.district !== this.props.district) {
            this.setState({hydratedDistrict: null});
            this.fetchData();
        }
    }

    getCurrentRequest = () => {
        if(!this.state.hydratedDistrict) {
            return null;
        }

        const emptyReq = {content: "No request set"};

        if (!this.state.hydratedDistrict.requests) {
            return emptyReq;
        }

        const sorted = [...this.state.hydratedDistrict.requests].sort((el1, el2)=> {
            if (el1.lastModified < el2.lastModified) {
                return 1
            } else {
                return -1
            }
        });

        const request = sorted.shift();

        return request || emptyReq;
    }

    scriptItemClicked = (idx, action) => {
        this.setState({savingEdits: true},() => {
            const newDistrict = {...this.state.hydratedDistrict}
            const newScript = [...newDistrict.script]
            if (action === "up") {
                if (idx > 0) {
                    const temp = newScript[idx]
                    newScript[idx] = newScript[idx-1]
                    newScript[idx-1] = temp
                }
            } else if (action === "down") {
                if (idx < newScript.length - 1) {
                    const temp = newScript[idx]
                    newScript[idx] = newScript[idx+1]
                    newScript[idx+1] = temp
                }
            } else if (action === "remove") {
                if (idx >= 0 && idx <= newScript.length - 1){
                    newScript.splice(idx, 1);
                }
            }

            const updateScriptRequestOptions = {
                url: `/districts/${this.props.district.districtId}/script`,
                method: 'PUT',
                headers: { ...authHeader(), 'Content-Type': 'application/json' },
                data: newScript.map((el)=>{return el.talkingPointId})
            };
            const self = this;
            axios(updateScriptRequestOptions).then((response)=>{
            }).catch((e) => {
                console.log(e)
                console.log(e.response.data)
                message.error(get(e, ["response","data","message"], "Unrecognized error while updating script"))
            }).then(() => {
                self.fetchData(()=>{self.setState({savingEdits: false})})
            });
        });
    }

    updateRequest = () => {
        const newRequest = {...this.state.updatedRequest};
        this.setState({
            updatedRequest: null,
            savingEdits: true
        }, () => {
            const updateRequestRequestOptions = newRequest.requestId ?  {
                url: `/requests/${newRequest.requestId}`,
                method: 'PUT',
                headers: { ...authHeader(), 'Content-Type': 'application/json' },
                data: {
                    districtId: this.state.hydratedDistrict.districtId,
                    content: newRequest.content
                }
            } : {
                url: `/requests/`,
                method: 'POST',
                headers: { ...authHeader(), 'Content-Type': 'application/json' },
                data: {
                    districtId: this.state.hydratedDistrict.districtId,
                    content: newRequest.content
                }
            };
            const self = this;
            axios(updateRequestRequestOptions).then((response)=>{
            }).catch((e) => {
                console.log(e)
                console.log(e.response.data)
                message.error(get(e, ["response","data","message"], "Unrecognized error while updating request"))
            }).then(() => {
                self.fetchData(()=>{self.setState({savingEdits: false})})
            });
        });
    }

    requestSection = () => {
        if (this.state.hydratedDistrict === null || this.state.themes === null || this.state.savingEdits) {
            return <></>
        }

        const heading = (
            <>
                <Typography.Title level={3}>Request</Typography.Title>
                <Typography.Paragraph>Set the request that each of your callers will make to your Member of Congress. Ensure the request is respectful and relevant to the lawmaker.</Typography.Paragraph>
            </>
        )

        const currentRequest = this.getCurrentRequest();
        let requestDisplay = (
            <Card actions={[<Icon type="edit" onClick={(e)=> { this.setState({updatedRequest: {...currentRequest}})} }/>]}>
                <Typography.Text>{currentRequest && currentRequest.content}</Typography.Text>
            </Card>
        );

        if (this.state.updatedRequest) {
            requestDisplay = (
                <>
                    <Input.TextArea defaultValue={currentRequest.content} autosize onChange={(e)=>{
                        const newUpdated = {...this.state.updatedRequest}
                        newUpdated.content = e.target.value;
                        this.setState({updatedRequest: newUpdated})
                    }}/>
                    <Button onClick={(e)=>{
                        this.setState({updatedRequest: null})
                    }}>Cancel</Button>
                    <Button onClick={(e)=>{
                        this.updateRequest();
                    }}>Save</Button>
                </>
            )
        }

        return (
            <>
                {heading}
                {requestDisplay}
            </>
        )
    }

    talkingPointsSection = () => {
        if (this.state.hydratedDistrict === null || this.state.themes === null) {
            return <></>
        }
        if (this.state.savingEdits) {
            return <Spin size="large" />
        }
        const list = <List
            itemLayout="vertical"
            bordered
            style={{background: "#FFFFFF"}}
            dataSource={this.state.hydratedDistrict.script}
            renderItem={(item, idx) => {
                const theme = this.state.themes.find( (el) => {
                    return el.themeId === item.themeId
                });

                return <List.Item
                    key={item.talkingPointId}
                    actions={[
                        <Button disabled={idx===0} shape="circle" onClick={e=>{this.scriptItemClicked(idx, "up")}}><Icon type="up-circle" theme="twoTone" /></Button>,
                        <Button disabled={idx===this.state.hydratedDistrict.script.length-1} shape="circle" onClick={e=>{this.scriptItemClicked(idx, "down")}}><Icon type="down-circle" theme="twoTone" /></Button>,
                        <Popconfirm title="Are you sure you want to remove this talking point?" onConfirm={e=>{this.scriptItemClicked(idx, "remove")}} okText="Yes" cancelText="No">
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
        return <div style={{marginTop: "1em"}}>
            {heading}
            {list}
        </div>
    }

    actions = () => {
        return (
            <Skeleton loading={this.state.hydratedDistrict === null}>
                {this.state.hydratedDistrict &&
                <div style={{padding: "10px", display: "flex", justifyContent: "center"}}>
                    <Button style={{marginRight: "5px"}} ><Link to="/talking-points">Add a Talking Point</Link></Button>
                    <Button style={{marginLeft: "5px"}} target="_blank" href={`http://www.cclcalls.org/call/${this.state.hydratedDistrict.state.toLowerCase()}/${this.state.hydratedDistrict.number}`}>View the Live Script</Button>
                </div>}
            </Skeleton>
        )
    }

    header = () => {
        return (
        <Skeleton loading={this.state.hydratedDistrict === null}>
            {this.state.hydratedDistrict &&
                <div style={{padding: "10px"}}>
                    <Typography.Title level={2}>
                        {displayName(this.state.hydratedDistrict)} ({this.state.hydratedDistrict.repLastName}) Script
                    </Typography.Title>
                </div>
            }
        </Skeleton>);
    }

    render() {
        return <>
            {this.header()}
            {this.requestSection()}
            {this.talkingPointsSection()}
            {this.actions()}
        </>;
    }
}

const mapStateToProps = state => {
    return {
        district: state.districts.selected,
    };
};

const ScriptPage = Form.create({ name: 'script_page' })(Script);

export default connect(mapStateToProps)(ScriptPage);
