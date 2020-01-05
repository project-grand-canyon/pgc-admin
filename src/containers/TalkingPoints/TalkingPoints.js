import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import moment from 'moment';
import { connect } from 'react-redux';
import { Button, Checkbox, Col, Form, Icon, Input, List, message, Modal, DatePicker, Row, Select, Skeleton, Spin, Typography } from 'antd';
import get from "lodash/get"

import axios from '../../_util/axios-api';
import { authHeader } from '../../_util/auth/auth-header';
import AddEditTalkingPointModal from './AddEditTalkingPointModal'

import './TalkingPoints.module.css';

class TalkingPoints extends Component {

    state = {
        loading: true,
        allTalkingPoints: null,
        themes: null,
        searchTerm: null,
        filters: null,
        liveTalkingPoints: null,
        redirect: null,
        editing: null,
        wantsToAddNewTalkingPoint: false,
        admins: null,
        editingTalkingPointDetails: null
    }

    componentDidMount() {
        this.fetchData()
    }

    fetchData = (cb) => {
        if (!this.props.districts || !this.props.district) {
            return;
        }

        this.setState({loading: true}, () => {
            const adminsRequestOptions = {
                url: `/admins`,
                method: 'GET',
                headers: { ...authHeader(), 'Content-Type': 'application/json' },
            };
            const getAdmins = axios(adminsRequestOptions);
            const talkingPointRequestOptions = {
                url: `/talkingpoints`,
                method: 'GET',
                headers: { ...authHeader(), 'Content-Type': 'application/json' },
            };
            const getTPs = axios(talkingPointRequestOptions);
            const themesRequestOptions = {
                url: `/themes`,
                method: 'GET',
                headers: { ...authHeader(), 'Content-Type': 'application/json' },
            };
            const getThemes = axios(themesRequestOptions);
            const liveTalkingPointsRequestOptions = {
                url: `districts/${this.props.district.districtId}/script`,
                method: 'GET',
                headers: { ...authHeader(), 'Content-Type': 'application/json' },
            };
            const getLiveTPs = axios(liveTalkingPointsRequestOptions);
            
            Promise.all([getAdmins, getTPs, getThemes, getLiveTPs]).then((response)=>{
                const admins = response[0].data;
                const talkingPoints = response[1].data;
                const themes = response[2].data;
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
                    themes: themes,
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
        const filtersForm = this.props.form.getFieldsValue();
        if (JSON.stringify(filtersForm) !== JSON.stringify(this.state.filters)) {
            this.handleFilterChange(filtersForm)
        }
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
            if (this.state.searchTerm){
                return el.content.toLowerCase().includes(this.state.searchTerm.toLowerCase())
            }
            return true;
        }).map((el, idx)=> {
            el['bg'] = idx % 2 === 0 ? "white" : 'rgba(0,0,0,0)';
            return el
        })
        return presentableTalkingPoints.slice(0, 30)
    }

    handleFilterChange = (filtersForm) => {
        if (this.hasTalkingPoints() === false) {
            return;
        }

        const filters = {...filtersForm};
        this.setState({filters: filters});
    }

    addNewTalkingPointClicked = () => {
        this.setState({
            wantsToAddNewTalkingPoint: true
        })
    }

    handleSaveTalkingPoint = (values) => {
        this.setState({wantsToAddNewTalkingPoint: false, editingTalkingPointDetails: null, editing: true})

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
            this.editTalkingPoint(body)
        } else {
            this.addNewTalkingPoint(body)
        }
    }

    addNewTalkingPoint = (body) => {
        const talkingPointRequestOptions = {
            url: `/talkingpoints`,
            method: 'POST',
            headers: { ...authHeader(), 'Content-Type': 'application/json' },
            data: body,
        };
        axios(talkingPointRequestOptions).then((response)=>{
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

    editTalkingPoint = (body) => {
        const talkingPointRequestOptions = {
            url: `/talkingpoints/${body.talkingPointId}`,
            method: 'PUT',
            headers: { ...authHeader(), 'Content-Type': 'application/json' },
            data: body,
        };
        axios(talkingPointRequestOptions).then((response)=>{
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
        this.setState({wantsToAddNewTalkingPoint: false, editingTalkingPointDetails: null})
    }

    addEditTalkingPointModal = () => {
        return this.hasTalkingPoints() ?
            <AddEditTalkingPointModal
                themes={this.state.themes}
                display={this.state.wantsToAddNewTalkingPoint || this.state.editingTalkingPointDetails !== null}
                handleSave={(vals)=>{this.handleSaveTalkingPoint(vals)}}
                handleCancel={this.handleCancelAddNewTalkingPoint}
                districts={this.props.districts}
                talkingPointUnderEdit={this.state.editingTalkingPointDetails}
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
                onSearch={value => this.setState({ searchTerm: value })}
                onChange={event => this.setState({ searchTerm: event.target.value })}
                allowClear={true}
                enterButton
            />
            <Button
                style={{position: "absolute", right: "10px", top:"10px"}}
                type="primary"
                onClick={this.addNewTalkingPointClicked || !this.hasTalkingPoints()}
                disabled={this.state.wantsToAddNewTalkingPoint}>
                    Add A New Talking Point
            </Button>
        </div>);
    }

    filterBox = () => {
        if (this.hasTalkingPoints() === false) {
            return <></>
        }
        const { getFieldDecorator } = this.props.form;
        return(
            <div style={{border: "1px solid black", padding: "10px"}}>
            <Typography.Title level={3}>Filters</Typography.Title>
            <Form onSubmit={this.handleFilter}>
                <Row>
                    <Col sm={24} md={12} >
                        <Form.Item label="Creation Date">
                            {getFieldDecorator("creationDate", {})(
                                <DatePicker.RangePicker />
                            )}
                        </Form.Item>
                    </Col>
                    <Col sm={24} md={12} >
                        <Form.Item label="Last Updated Date">
                            {getFieldDecorator("updatedDate", {})(
                                <DatePicker.RangePicker />
                            )}
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
                    <Col sm={24} md={8} >
                        <Form.Item label="Relevance">
                            {getFieldDecorator("scope", {})(
                                <Checkbox.Group>
                                    <Checkbox value={"national"}>National</Checkbox>
                                    <Checkbox value={"state"}>My State</Checkbox>
                                    <Checkbox value={"district"}>My District</Checkbox>
                            </Checkbox.Group>
                            )}
                        </Form.Item>
                    </Col>
                    <Col sm={24} md={8} >
                        <Form.Item label="Theme">
                        {getFieldDecorator("theme", {})(
                            <Select
                                showSearch
                                allowClear
                                placeholder="Select a theme"
                                optionFilterProp="children"
                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                {this.state.themes.map((el)=>{
                                    return (<Select.Option key={el.name} value={el.name}>{el.name}</Select.Option>)
                                })}
                            </Select>,
                            )}
                        </Form.Item>
                    </Col>
                    <Col sm={24} md={8} >
                        <Form.Item label="Currently selected for Call-In Script">
                            {getFieldDecorator("script", {
                                valuePropName: 'checked'
                            })(
                                <Checkbox value={"script"}>In Script</Checkbox>
                            )}
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
            </div>
        );
    }

    initiateEditTalkingPoint = (talkingPointDetails) => {
        if (this.props.adminId && this.props.adminId !== talkingPointDetails.createdBy) {
            Modal.error({
                title: 'Not Allowed to Edit',
                content: "Only the person who created this talking point can edit it."
            })
            return
        }

        this.setState({
            editingTalkingPointDetails: talkingPointDetails
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
            const updateScriptRequestOptions = {
                url: `/districts/${this.props.district.districtId}/script`,
                method: 'PUT',
                headers: { ...authHeader(), 'Content-Type': 'application/json' },
                data: newScript
            };
            axios(updateScriptRequestOptions).then((response)=>{
                Modal.confirm({
                    title: 'View Updated Script?',
                    content: 'You just made changes to the call-in script. Would you like to view the updated script?',
                    okText: 'Yes',
                    cancelText: 'No',
                    onOk() {
                        self.setState({
                            redirect: "/script"
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
            renderItem={item => {
                const theme = this.state.themes.find((el) => {
                    return el.themeId === item.themeId
                });
                const createdBy = this.state.admins.find((el)=> {
                    return el.adminId === item.createdBy
                })

                const reference = item.referenceUrl ?
                    <Typography.Text copyable={{ text: item.referenceUrl }}>
                        <a target="_blank" href={item.referenceUrl} rel="noopener noreferrer">Reference URL</a>
                    </Typography.Text> : null;

                const createdDate = new Date(item.created.replace(/-/g, "/") + " UTC");
                const createdByDesc = createdBy && createdBy.email ?
                <><Typography.Text style={{fontStyle: "italic"}}>Created on {createdDate.toDateString()} by: </Typography.Text><Typography.Text style={{fontStyle: "italic", color: "#0081C7"}} copyable={{ text: createdBy.email }}>{createdBy.email} </Typography.Text></>
                     : null;
                const description = createdByDesc

                const isInScript = this.state.liveTalkingPoints.includes(item.talkingPointId)
                return <List.Item
                    style={{background: item.bg, padding: "10px"}}
                    key={item.talkingPointId}
                    extra={reference}
                    actions={[
                        <span>
                            <Icon style={{ marginRight: 8, color: "#0081C7" }} type={isInScript ? "check-square" : "border"} onClick={(e)=> {
                                this.toggleTalkingPointInclusionInScript(item.talkingPointId)
                            } }/>
                            <Typography.Text>In Script</Typography.Text>
                        </span>,
                        <span>
                            <Icon style={{ marginRight: 8 }} type="edit" theme="twoTone" twoToneColor="#0081C7" onClick={(e)=> {
                                this.initiateEditTalkingPoint(item)
                            } } />
                            <Typography.Text>Edit</Typography.Text>
                        </span> 
                    ]}
                >
                    <List.Item.Meta
                        title={theme.name}
                        description= {description}
                    />
                        <Typography.Paragraph>{item.content}</Typography.Paragraph>
                </List.Item>
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
    }
}

const mapStateToProps = state => {

    const admin = {...state.admin}
    const adminTwo = {...admin.admin}

    return {
        adminId: adminTwo.adminId,
        districts: state.districts.districts,
        district: state.districts.selected
    };
};


const TalkingPointsForm = Form.create({ name: 'talking_points_filter_sort' })(TalkingPoints);

export default connect(mapStateToProps)(TalkingPointsForm);
