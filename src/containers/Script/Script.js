import React, { Component } from 'react';
import get from "lodash/get"

import { Button, Modal, message, Skeleton, Form, Typography} from 'antd';

import { getHydratedDistict, updateRequest } from '../../_util/axios-api';
import { displayName } from '../../_util/district';
import RequestSection from './RequestSection';


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
            getHydratedDistict(this.props.district).then(( response )=>{
                const district = response.data;
                if (district.districtId === this.props.district.districtId) {
                    this.setState({
                        hydratedDistrict: district
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

    updateRequest = (newRequest) => {
        this.setState({savingEdits: true},() => {
            updateRequest(this.state.hydratedDistrict, newRequest).then((response)=>{
            }).catch((e) => {
                console.log(e)
                console.log(e.response.data)
                message.error(get(e, ["response","data","message"], "Unrecognized error while updating request"))
            }).then(() => {
                this.fetchData(()=>{this.setState({savingEdits: false})})
            });
        })
    }

    requestSection = () => {
        const currentRequest = this.getCurrentRequest()
        return <RequestSection 
            district = {this.state.hydratedDistrict}  
            isSaving = {this.state.savingEdits}
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

    actions = () => {
        return (
            <Skeleton loading={this.state.hydratedDistrict === null}>
                {this.state.hydratedDistrict &&
                <div style={{padding: "10px", display: "flex", justifyContent: "center"}}>
                    <Button style={{marginLeft: "5px"}} target="_blank" href={`http://www.cclcalls.org/call/${this.state.hydratedDistrict.state.toLowerCase()}/${this.state.hydratedDistrict.number}`}>Preview the Live Script</Button>
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
                        {displayName(this.state.hydratedDistrict)} ({this.state.hydratedDistrict.repLastName}) Request
                    </Typography.Title>
                </div>
            }
        </Skeleton>);
    }

    render() {
        return <>
            {this.header()}
            {this.requestSection()}
            {this.actions()}
        </>;
    }
}

const ScriptPage = Form.create({ name: 'script_page' })(Script);

export default ScriptPage;
