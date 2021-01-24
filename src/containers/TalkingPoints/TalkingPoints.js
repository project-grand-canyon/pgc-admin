import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import moment from 'moment';
import { connect } from 'react-redux';
import { Button, Input, List, message, Modal, Skeleton, Spin, Typography } from 'antd';
import get from "lodash/get"

import { getTalkingPoints, getThemes, getAdmins, getScript, addTalkingPoint, editTalkingPoint, updateScript } from '../../_util/axios-api';
import { slug as districtSlug } from "../../_util/district";
import AddEditTalkingPointModal from './AddEditTalkingPointModal'
import TalkingPointsFilterForm from './TalkingPointsFilterForm'
import TalkingPointCard from './TalkingPointCard'

import './TalkingPoints.module.css';

class TalkingPoints extends Component {

    state = {
        loading: true,
        allTalkingPoints: null,
        themes: null,
        searchTerm: null,
        filters: {
            scope: ['national', 'state', 'district']
        },
        liveTalkingPoints: null,
        redirect: null,
        editing: null,
        isAddingNewTalkingPoint: false,
        admins: null,
        adminsById: null,
        isEditingTalkingPointsDetails: null
    }

    componentDidMount() {
        this.fetchData()
    }

    fetchData = (cb) => {
        if (!this.props.districts || !this.props.district) {
            return;
        }

        this.setState({loading: true}, () => {
            const getAdminsPromise = getAdmins()
            const getTalkingPointsPromise = getTalkingPoints()
            const getThemesPromise = getThemes()
            const getScriptPromise = getScript(this.props.district)
            
            Promise.all([getAdminsPromise, getTalkingPointsPromise, getThemesPromise, getScriptPromise]).then((response)=>{
                const admins = response[0].data;
                const adminsById = new Map(admins.map((el) => [el.adminId, el]));
                const talkingPoints = response[1].data;
                const themes = response[2].data;
                const sortedThemes = themes.sort((el1, el2) => el1.name.localeCompare(el2.name));
                const liveTPs = response[3].data;
                const sortedTPs = talkingPoints.sort((el1, el2)=>{
                    const d1 = new Date(el1.created)
                    const d2 = new Date(el2.created)
                    if (d1 < d2) {
                        return 1
                    } else {
                        return -1
                    }
                })
    
                this.setState({
                    allTalkingPoints: sortedTPs,
                    admins: admins,
                    adminsById: adminsById,
                    themes: sortedThemes,
                    liveTalkingPoints: liveTPs
                }, () => {
                    this.setState({
                        loading: false
                    });
                });
            }).catch((e) => {
                console.log(e)
            }).then(()=>{
                this.setState({
                    loading: false
                }, () => {
                    cb && cb()
                });
            })
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.districts !== this.props.districts || prevProps.district !== this.props.district) {
            this.fetchData();
        }
    }

    presentableTalkingPoints = () => {
        if (this.hasTalkingPoints() === false) {
            return;
        }

        const filters = this.state.filters;
        const presentableTalkingPoints = [...this.state.allTalkingPoints].filter(el =>{
            if (filters && filters.creationDate && filters.creationDate.length > 0) {
                const creationDateRange = this.state.filters.creationDate;
                const start = creationDateRange[0];
                const end = creationDateRange[1];
                const createdDate = moment(el.created, "YYYY-MM-DD h:mm")
                return createdDate.isSameOrAfter(start) && createdDate.isSameOrBefore(end)
            }
            return true
        }).filter(el =>{
            if (filters && filters.updatedDate && filters.updatedDate.length > 0) {
                const updatedDateRange = this.state.filters.updatedDate;
                const start = updatedDateRange[0];
                const end = updatedDateRange[1];
                const updatedDate = moment(el.lastModified, "YYYY-MM-DD h:mm")
                return updatedDate.isSameOrAfter(start) && updatedDate.isSameOrBefore(end)
            }
            return true
        }).filter((el)=>{
            if (filters && filters.script){
                return this.state.liveTalkingPoints.includes(el.talkingPointId)
            }
            return true;
        }).filter((el)=>{
            if (filters && filters.theme) {
                const theme = this.state.themes.find((theme) => {
                    return theme.name === filters.theme
                })
                if (theme) {
                    return el.themeId === theme.themeId
                }
            }
            return true;
        }).filter((el)=>{
            if (filters && filters.scope) {
                var shouldShow = filters.scope.length === 0;
                // "state", "national", "district"
                if (filters.scope.includes("national")
                    && el.scope === "national"
                ) {
                    shouldShow = true;
                }
                if (!shouldShow
                    && filters.scope.includes("state")
                    && el.scope === "state"
                    && el.states.includes(this.props.district.state)
                ) {
                    shouldShow = true;
                }
                if (!shouldShow
                    && filters.scope.includes("district")
                    && el.scope === "district"
                    && el.districts.includes(this.props.district.districtId)
                ) {
                    shouldShow = true;
                }
                return shouldShow;
            }
            return true;
        }).filter((el)=>{
            if (filters && filters.author) {
                const author = filters.author.trim().toLowerCase();
                const createdBy = el.createdBy && this.state.adminsById.get(el.createdBy);
                if (!createdBy) {
                    return false;
                }
                return (
                    createdBy.userName.toLowerCase().includes(author) ||
                    (createdBy.email && createdBy.email.toLowerCase().includes(author))
                );
            }
            return true;
        }).filter((el)=>{
            if (this.state.searchTerm){
                return el.content.toLowerCase().includes(this.state.searchTerm.toLowerCase())
            }
            return true;
        }).map((el, idx)=> {
            el['bg'] = idx % 2 === 0 ? "white" : 'rgba(0,0,0,0)';
            return el
        })
        return presentableTalkingPoints.slice(0, 100)
    }

    handleFilterChange = (values) => {
        if (this.hasTalkingPoints() === false) {
            return;
        }

        const filters = {...values};
        this.setState({filters: filters});
    }

    addNewTalkingPointClicked = () => {
        this.setState({
            isAddingNewTalkingPoint: true
        })
    }

    handleSaveTalkingPoint = (values) => {
        this.setState({isAddingNewTalkingPoint: false, isEditingTalkingPointsDetails: null, editing: true})

        const body = {
            content: values.content,
            scope: values.scope,
            themeId: values.theme,
            enabled: true
        }

        if (values.referenceUrl){
            body["referenceUrl"] = values.referenceUrl
        }

        if (values.scope === "state") {
            body.states = values.subScope;
        } else if (values.scope === "district") {
            body.districts = values.subScope;
        }

        if (values.talkingPointId) {
            body['talkingPointId'] = values.talkingPointId
            this.editExistingTalkingPoint(body)
        } else {
            this.addNewTalkingPoint(body)
        }
    }

    addNewTalkingPoint = (newTalkingPoint) => {
        addTalkingPoint(newTalkingPoint).then((response)=>{
            message.success('Talking Point Added');
        }).catch((e) => {
            Modal.error({
                title: 'Error Adding Talking Point',
                content: get(e, ['response', 'data', 'message'], "Unrecognized Error"),
                });
            console.log(e)
        }).then(()=>{
            this.fetchData(()=>{this.setState({editing: false})})
        })
    }

    editExistingTalkingPoint = (talkingPoint) => {
        editTalkingPoint(talkingPoint).then((response)=>{
            message.success('Talking Point Edited');
        }).catch((e) => {
            Modal.error({
                title: 'Error Editing Talking Point',
                content: get(e, ['response', 'data', 'message'], "Unrecognized Error"),
                });
            console.log(e)
        }).then(()=>{
            this.fetchData(()=>{this.setState({editing: false})})
        })
    }

    handleCancelAddNewTalkingPoint = () => {
        this.setState({isAddingNewTalkingPoint: false, isEditingTalkingPointsDetails: null})
    }

    addEditTalkingPointModal = () => {
        return this.hasTalkingPoints() ?
            <AddEditTalkingPointModal
                themes={this.state.themes}
                display={this.state.isAddingNewTalkingPoint || this.state.isEditingTalkingPointsDetails !== null}
                handleSave={(vals)=>{this.handleSaveTalkingPoint(vals)}}
                handleCancel={this.handleCancelAddNewTalkingPoint}
                districts={this.props.districts}
                talkingPointUnderEdit={this.state.isEditingTalkingPointsDetails}
            /> : null;
    }

    header = () => {
        return (
            <div>
                <Typography.Title level={2}>Talking Points Library</Typography.Title>
                <Typography.Paragraph>Use this page to discover talking points for your script or to add another talking point to the library.</Typography.Paragraph>
            </div>
        )
    }

    render() {
        if (this.state.redirect) {
            return <Redirect to={this.state.redirect}/>
        }

        return <>
            {this.header()}
            <Spin spinning={this.state.loading} size="large" />
            <Skeleton loading={this.state.loading}>
                {this.addEditTalkingPointModal()}
                {this.searchbar()}
                {this.filterBox()}
                {this.list()}
            </Skeleton>
        </>;
    }

    searchbar = () => {
        return (<div style={{ padding: "10px 0", position: "relative"}}>
            <Typography.Title level={3}>Search</Typography.Title>
            <Input.Search
                style={{ width: 280 }}
                placeholder="Search Talking Points"
                value={this.state.searchTerm}
                onSearch={value => this.setState({ searchTerm: value })}
                onChange={event => this.setState({ searchTerm: event.target.value })}
                allowClear={true}
                enterButton
            />
            <Button
                style={{position: "absolute", right: "10px", top:"10px"}}
                type="primary"
                onClick={this.addNewTalkingPointClicked || !this.hasTalkingPoints()}
                disabled={this.state.isAddingNewTalkingPoint}>
                    Add A New Talking Point
            </Button>
        </div>);
    }

    filterBox = () => {
        if (this.hasTalkingPoints() === false) {
            return <></>
        }
        return(
            <div style={{border: "1px solid black", padding: "10px"}}>
                <Typography.Title level={3}>Filters</Typography.Title>
                <TalkingPointsFilterForm
                    themes={this.state.themes}
                    filters={this.state.filters}
                    onValuesChange={this.handleFilterChange} />
            </div>
        );
    }

    initiateEditTalkingPoint = (talkingPointDetails) => {
        if (this.props.admin.adminId && this.props.admin.adminId !== talkingPointDetails.createdBy) {
            Modal.error({
                title: 'Not Allowed to Edit',
                content: "Only the person who created this talking point can edit it."
            })
            return
        }

        this.setState({
            isEditingTalkingPointsDetails: talkingPointDetails
        })
    }

    toggleTalkingPointInclusionInScript = (talkingPointId) => {
        const self = this;
        this.setState({editing: true}, () =>{
            const isInScript = this.state.liveTalkingPoints.includes(talkingPointId);
            const newScript = isInScript ?
                [...this.state.liveTalkingPoints].filter(el=>{
                    return el !== talkingPointId
                }) :
                [...this.state.liveTalkingPoints].concat([talkingPointId])
            const scriptURL = `/script/${districtSlug(this.props.district)}`;
            updateScript(this.props.district, newScript).then((response)=>{
                Modal.confirm({
                    title: 'View Updated Script?',
                    content: 'You just made changes to the call-in script. Would you like to view the updated script?',
                    okText: 'Yes',
                    cancelText: 'No',
                    onOk() {
                        self.setState({
                            redirect: scriptURL
                        })
                    }
                });
                }).catch((e) => {
                    console.log(e)
                    console.log(e.response.data)
                    Modal.error({
                        title: 'Error Updating Call-In Script',
                        content: get(e, ['response', 'data', 'message'], "Unrecognized Error")
                    })
                }).then(()=>{
                    self.fetchData()
                    this.setState({editing: false});
                })
        })
    }

    list = () => {
        if (this.hasTalkingPoints() === false) {
            return <></>
        }
        if (this.state.editing) {
            return <Spin size="large" />
        }
        return <List 
            style={{margin: "10px 0"}}
            bordered={false}
            itemLayout="vertical"
            // grid={{
            //     gutter: [{ xs: 8, sm: 16, md: 24, lg: 32 }, 20], column: 1       
            // }}
        header={<Typography.Title level={3}>Search Results</Typography.Title>}
            dataSource={this.presentableTalkingPoints()}
            renderItem={talkingPoint => {
                const theme = this.state.themes.find((el) => {
                    return el.themeId === talkingPoint.themeId
                });
                const createdBy = talkingPoint.createdBy && this.state.adminsById.get(talkingPoint.createdBy)
                const isInScript = this.state.liveTalkingPoints.includes(talkingPoint.talkingPointId)
                return <TalkingPointCard 
                    talkingPoint = {talkingPoint}
                    createdBy = {createdBy}
                    theme = { theme }
                    isInScript = { isInScript }
                    scriptToggle = { this.toggleTalkingPointInclusionInScript }
                    edit = { this.initiateEditTalkingPoint }
                    isShowingModerationControls = { this.props.admin.root }
                />                
                }
            }
        />
    }

    hasTalkingPoints = () => {
        return this.state.allTalkingPoints !== null
            && this.state.themes !== null
            && this.props.districts !== null
            && this.props.districts.length > 0
            && this.state.liveTalkingPoints !== null
            && this.state.admins !== null
            && this.state.adminsById !== null
    }
}

const mapStateToProps = state => {

    const admin = {...state.admin}

    return {
        admin: {...admin.admin},
        districts: state.districts.districts
    };
};


export default connect(mapStateToProps)(TalkingPoints);
