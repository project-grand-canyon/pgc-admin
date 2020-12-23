import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import get from "lodash/get"

import { Button, Modal, message, Skeleton, Form, Typography} from 'antd';

import { getHydratedDistict, getThemes, updateRequest, updateScript } from '../../_util/axios-api';
import { displayName, slug as districtSlug } from '../../_util/district';
import RequestSection from './RequestSection';
import TalkingPointsSection from './TalkingPointsSection';


class Script extends Component {
    state = {
        hydratedDistrict: null,
        themes: null,
        savingEdits: false,
        isEditingRequest: false
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
            const hydratedPromise = getHydratedDistict(this.props.district)
            const themesPromise = getThemes()
            Promise.all([hydratedPromise, themesPromise]).then(( responses )=>{
                const district = responses[0].data;
                const themes = responses[1].data;
                if (district.districtId === this.props.district.districtId) {
                    this.setState({
                        hydratedDistrict: district,
                        themes: themes // this can be moved to redux
                    });
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

            const newTalkingPointIds = newScript.map((el)=>{return el.talkingPointId})
            const self = this;
            updateScript(this.props.district, newTalkingPointIds).then((response)=>{
            }).catch((e) => {
                console.log(e)
                console.log(e.response.data)
                message.error(get(e, ["response","data","message"], "Unrecognized error while updating script"))
            }).then(() => {
                self.fetchData(()=>{self.setState({savingEdits: false})})
            });
        });
    }

    updateRequest = (newRequest) => {
        console.log(newRequest)
        updateRequest(this.state.hydratedDistrict, newRequest).then((response)=>{
        }).catch((e) => {
            console.log(e)
            console.log(e.response.data)
            message.error(get(e, ["response","data","message"], "Unrecognized error while updating request"))
        }).then(() => {
            this.fetchData(()=>{this.setState({savingEdits: false})})
        });
    }

    requestSection = () => {
        const currentRequest = this.getCurrentRequest()
        return <RequestSection 
            district = {this.state.hydratedDistrict}  
            isUpdating = {this.state.savingEdits}
            isEditing = {this.state.isEditingRequest}
            currentRequest = {currentRequest}
            onClickEdit = {(e)=> { this.setState({isEditingRequest: true})} }
            onCancel = {(e) => { this.setState({isEditingRequest: false}) }}
            onSave = { (newRequest) => {
                console.log('ben')
                this.setState({isEditingRequest: false}) 
                this.updateRequest(newRequest)
            }}
        />
    }

    talkingPointsSection = () => {
        return <TalkingPointsSection 
            district = {this.state.hydratedDistrict}
            themes = {this.state.themes}
            isSaving = {this.state.savingEdits}
            scriptItemClicked = {this.scriptItemClicked}
        />
    }

    actions = () => {
        const talkingPointsURL = `/talking-points/${districtSlug(this.props.district)}`;
        return (
            <Skeleton loading={this.state.hydratedDistrict === null}>
                {this.state.hydratedDistrict &&
                <div style={{padding: "10px", display: "flex", justifyContent: "center"}}>
                    <Button style={{marginRight: "5px"}} ><Link to={talkingPointsURL}>Add a Talking Point</Link></Button>
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

const ScriptPage = Form.create({ name: 'script_page' })(Script);

export default ScriptPage;
