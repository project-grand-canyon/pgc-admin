import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import { Button, Icon, List, Modal, message, Skeleton, Form, Popconfirm, Typography, Spin} from 'antd';

import axios from '../../_util/axios-api';

import { authHeader } from '../../_util/auth/auth-header';
import { connect } from 'react-redux';

class Script extends Component {
    state = {
        hydratedDistrict: null,
        themes: null,
        editing: false
    }

    componentDidMount() {
        if (this.state.hydratedDistrict == null) {
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
                if (district.districtId == this.props.district.districtId) {
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
        if (prevProps.district != this.props.district) {
            this.setState({hydratedDistrict: null});
            this.fetchData();
        }
    }

    scriptItemClicked = (idx, action) => {
        this.setState({editing: true},() => { 
            const newDistrict = {...this.state.hydratedDistrict}
            const newScript = [...newDistrict.script]
            if (action == "up") {
                if (idx > 0) {
                    const temp = newScript[idx]
                    newScript[idx] = newScript[idx-1]
                    newScript[idx-1] = temp
                }
            } else if (action == "down") {
                if (idx < newScript.length - 1) {
                    const temp = newScript[idx]
                    newScript[idx] = newScript[idx+1]
                    newScript[idx+1] = temp
                }
            } else if (action == "remove") {
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
                message.error(e.response && e.response.data && e.response.data.message || "Unrecognized error while updating script")
            }).then(() => {
                self.fetchData(()=>{self.setState({editing: false})})
            });
        });
    }

    list = () => {
        if (this.state.hydratedDistrict == null) {
            return <></>
        }
        if (this.state.editing) {
            return <Spin size="large" />
        }
        return <List
            itemLayout="vertical"
            bordered
            dataSource={this.state.hydratedDistrict.script}
            renderItem={(item, idx) => {
                const theme = this.state.themes.find( (el) => {
                    return el.themeId === item.themeId
                });

                return <List.Item
                    key={item.talkingPointId}
                    actions={[
                        <Button disabled={idx==0} shape="circle" onClick={e=>{this.scriptItemClicked(idx, "up")}}><Icon type="up-circle" theme="twoTone" /></Button>, 
                        <Button disabled={idx==this.state.hydratedDistrict.script.length-1} shape="circle" onClick={e=>{this.scriptItemClicked(idx, "down")}}><Icon type="down-circle" theme="twoTone" /></Button>, 
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
    }

    actions = () => {
        return (
            <Skeleton loading={this.state.hydratedDistrict == null}>
                {this.state.hydratedDistrict &&
                <div style={{padding: "10px", display: "flex", justifyContent: "center"}}>
                    <Button style={{marginRight: "5px"}} ><Link to="/talking-points">Add a Talking Point</Link></Button>
                    <Button style={{marginLeft: "5px"}} target="_blank" href={`https://www.projectgrandcanyon.com/${this.state.hydratedDistrict.state.toLowerCase()}${this.state.hydratedDistrict.number}.html`}>View the Live Script</Button>
                </div>}
            </Skeleton>
        )
    }

    header = () => {
        return (
        <Skeleton loading={this.state.hydratedDistrict == null}>
            {this.state.hydratedDistrict &&
                <div style={{padding: "10px"}}>
                    <Typography.Title level={2}>
                        {this.state.hydratedDistrict.state}-{this.state.hydratedDistrict.number} Script
                    </Typography.Title>
                    <Typography.Paragraph>
                        Use this page to re-order or remove talking points in your district's call-in guide.
                    </Typography.Paragraph>
                </div>
            }
        </Skeleton>);
    }

    render() {
        return <>
            {this.header()}
            {this.list()}
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
