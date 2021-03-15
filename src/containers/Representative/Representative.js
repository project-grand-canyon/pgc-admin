import React, { Component } from 'react';
import { Prompt } from 'react-router-dom';
import { Button, Card, Col, Form, Input, List, Modal, Row, Skeleton, Spin, Typography} from 'antd';

import OfficeModal from './OfficeModal';
import StatusFormItem from './StatusFormItem';

import axios, { getErrorMessage } from '../../_util/axios-api';
import { displayName } from '../../_util/district';
import { authHeader } from '../../_util/auth/auth-header';

import './Representative.module.css';

class Representative extends Component {

    state = {
        hydratedDistrict: null,
        officeForEditing: null,
        offices: null,
        showAddOfficeModal: false,
        editing: false
    }

    componentDidMount() {
        window.onbeforeunload = (e) => {
            if (this.props.form.isFieldsTouched()) {
                e.preventDefault();
                e.returnValue = 'dummystring';
                return 'dummystring';
            }
        };
        if (this.state.hydratedDistrict === null) {
            this.fetchDistrictDetails();
        }
    }

    componentWillUnmount() {
        window.onbeforeunload = null;
    }

    fetchDistrictDetails(cb) {
        if (this.props.district) {
            const requestOptions = {
                url: `/districts/${this.props.district.districtId}/hydrated`,
                method: 'GET',
                headers: { ...authHeader(), 'Content-Type': 'application/json' },
            };
            axios(requestOptions).then((response)=>{
                const district = response.data;
                if (district.districtId === this.props.district.districtId) {
                    const offices = district.offices;
                    offices.push('add');
                    this.setState({hydratedDistrict: district, offices: offices});
                }
            }).catch((e) => {
                Modal.error({
                    title: "Error Loading Page",
                    content: e.message,
                });
                this.setState({fetchError: e.message})
            }).then(()=>{
                if (cb) {
                    cb();
                }
            })
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.district !== this.props.district) {
            this.setState({hydratedDistrict: null});
            this.fetchDistrictDetails();
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const { validateFieldsAndScroll } = this.props.form;
        validateFieldsAndScroll(null, {force: true}, (errors, formFields) => {
            if (errors != null) {
                return;
            }
            const { state, number, callTargets, status: previousStatus } = this.state.hydratedDistrict
            const { firstName: repFirstName, lastName: repLastName, repImageUrl, status } = formFields
            
            const putBody = {
                state,
                number,
                callTargets,
                repFirstName,
                repLastName,
                repImageUrl,
                status,
            }

            const updateDistrict = () => { this.putUpdate(putBody) };
            if (previousStatus === 'active' && formFields.status === 'covid_paused') {
                this.showCovidConfirmation(updateDistrict);
            } else {
                updateDistrict();
            }
        });
    }

    handleReset = () => {
        this.props.form.resetFields();
    }

    showCovidConfirmation = (onCompetion) => {
        Modal.confirm({
            title: 'Confirm district status change',
            content: `
                Upon saving this change, monthly notifications for every caller in this
                district will cease. A message will immediately be sent to all callers in
                the district informing them that their monthly reminders are paused
                due to COVID-19. Are you sure you want to change the status?
            `,
            okText: 'Confirm',
            onOk() {
                onCompetion();
            }
          });
    }

    preEditOffices = () => {
        if (this.props.form.isFieldsTouched()) {
            Modal.error({
                title: 'Save or discard changes',
                content: 'Before changing office info, please save or discard your text changes.'
            });
            return false;
        } else {
            return true;
        }
    }

    putUpdate = (putBody) => {
        const self = this;
        this.setState({editing: true},()=>{
            const requestOptions = {
                url: `/districts/${this.props.district.districtId}/`,
                method: 'PUT',
                headers: { ...authHeader(), 'Content-Type': 'application/json' },
                data: putBody
            };
            axios(requestOptions).then((response)=>{
            }).catch((e) => {
                Modal.error({
                    title: "Error updating district",
                    content: getErrorMessage(e),
                });
            }).then(()=>{
                this.fetchDistrictDetails(()=>{self.setState({editing: false})})
            })
        });
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const isLoading = this.state.hydratedDistrict === null;
        const dis = this.state.hydratedDistrict
        const form = this.form(isLoading, dis, getFieldDecorator)
        return <>
            <OfficeModal office={this.state.officeForEditing}
                display={this.state.officeForEditing !== null}
                onUpdateOffice={(officeDetails) => { this.onUpdateOffice(officeDetails)}}
                onCancelUpdateOffice={this.onCancelAddUpdateOffice} />
            <OfficeModal display={this.state.showAddOfficeModal}
                onAddOffice={(officeDetails) => { this.onAddOffice(officeDetails)}}
                onCancelUpdateOffice={this.onCancelAddUpdateOffice} />
            <Prompt when={this.props.form.isFieldsTouched()} message="Discard unsaved changes?" />
            {this.state.editing === false && form}
            {this.state.editing && <Spin size="large" />}
        </>;
    }

    form = (isLoading, dis, getFieldDecorator) => {
        const disableButtons = !this.props.form.isFieldsTouched()
        return (
        <>
            <Skeleton loading={isLoading} title={true} paragraph={false}>
                <div>
                    {dis &&
                        <>
                        <Typography.Title level={2}>{displayName(dis)}</Typography.Title>
                        <Typography.Paragraph>
                            Use this page to edit information about your representative/district.
                        </Typography.Paragraph>
                        </>
                    }
                </div>
            </Skeleton>
            <Row>
                <Col sm={24} md={16}>
                    <Form layout="vertical" onSubmit={this.handleSubmit}>
                        <Skeleton loading={isLoading} title={false}>
                            {dis && (
                            <Form.Item label="First Name">
                                {getFieldDecorator('firstName', {
                                    rules: [{required: true, message: 'Representative\'s first name'}],
                                    initialValue: dis.repFirstName
                                })(<Input />)}
                            </Form.Item>
                            )}
                        </Skeleton>
                        <Skeleton loading={isLoading} title={false}>
                            {dis && (
                            <Form.Item label="Last Name">
                                {getFieldDecorator('lastName', {
                                    rules: [{required: true, message: 'Representative\'s last name'}],
                                    initialValue: dis.repLastName
                                })(<Input />)}
                            </Form.Item>
                            )}
                        </Skeleton>
                        <Skeleton loading={isLoading} title={false}>
                            {dis && (
                            <Form.Item label="Photo URL">
                                {getFieldDecorator('repImageUrl', {
                                    rules: [{required: true, message: 'A link to the Representative\'s photo'},
                                            {type: 'url', message: 'Must be a valid URL. For example, http://www.person4congress.com/photo.jpg'}
                                    ],
                                    initialValue: dis.repImageUrl
                                })(<Input />)}
                            </Form.Item>
                            )}
                        </Skeleton>
                        <Skeleton loading={isLoading}>
                                { this.state.offices &&
                                    <>
                                        <h4>Offices</h4>
                                        <List
                                            grid={{ gutter: 16, xs: 1, sm: 2, lg: 4 }}
                                            dataSource={this.state.offices}
                                            renderItem={office => (
                                                this.officeListItem(office)
                                            )}
                                        />
                                    </>
                                }
                        </Skeleton>
                        <Skeleton loading={isLoading}>
                                { dis &&
                                    <StatusFormItem getFieldDecorator={getFieldDecorator} district={dis} />
                                }
                        </Skeleton>
                        <Skeleton loading={isLoading}>
                            <Form.Item
                                wrapperCol={{ span: 12, offset: 5 }}
                                >
                                <Button type="primary" htmlType="submit" disabled={disableButtons} style={{marginRight: "5px"}}>
                                    Save
                                </Button>
                                <Button disabled={disableButtons} onClick={this.handleReset} style={{marginLeft: "5px"}}>
                                    Discard Changes
                                </Button>
                            </Form.Item>
                        </Skeleton>
                    </Form>
                </Col>
                <Col sm={24} md={8}>
                    {dis && (<img alt={`${displayName(dis)} legislator`} src={`${dis.repImageUrl}`} />)}
                </Col>
            </Row>
        </>)
    }

    officeListItem = (office) => {
        if (office === 'add') {
            return <List.Item
            key="add"
        >
            <Card
                hoverable
                title="Add An Office"
                onClick={ this.launchAddOfficeModal }
            >
                    <Button shape="circle" icon="plus-circle" />
            </Card>
        </List.Item>
        }
        return <List.Item
            key={office.districtOfficeId}
        >
            <Card
                title={office.address.city}
                actions={[
                    <Button shape="circle" icon="edit" onClick={ () => {
                            this.launchEditOfficeModal(office)
                        }
                    } />,
                    <Button shape="circle" icon="delete" onClick={ () => { this.removeOffice(office.districtOfficeId) } } />
                ]}
            >
                {office.phone}
            </Card>
        </List.Item>
    }

    launchAddOfficeModal = () => {
        if (!this.preEditOffices()) {
            return;
        }
        this.setState({officeForEditing: null, showAddOfficeModal: true})
    }

    launchEditOfficeModal = (office) => {
        if (!this.preEditOffices()) {
            return;
        }
        if (office) {
            this.setState({officeForEditing: office, showAddOfficeModal: false})
        } else {
            Modal.error({
                title: "Something went wrong",
                content: "Can not find office for editing."
            })
        }
    }

    removeOffice = (districtOfficeId) => {
        const offices = [...this.state.offices]
        const office = offices.find(el => {
            return el.districtOfficeId === districtOfficeId
        })
        if (!office){
            return;
        }
        if (!this.preEditOffices()) {
            return;
        }
        const that = this;
        Modal.confirm({
            title: 'Are you sure you want to delete this office?',
            content: `${office.address && office.address.city}`,
            onOk() {
                that.setState({editing: true},()=>{
                    const requestOptions = {
                        url: `/districts/${that.props.district.districtId}/offices/${districtOfficeId}`,
                        method: 'DELETE',
                        headers: { ...authHeader(), 'Content-Type': 'application/json' }
                    };
                    axios(requestOptions).then((response)=>{
                    }).catch((e) => {
                        Modal.error({
                            title: "Error removing office",
                            content: getErrorMessage(e),
                        });
                    }).then(()=>{
                        that.fetchDistrictDetails(()=>{that.setState({editing: false})})
                    })
                })
            }
        });
    }

    onCancelAddUpdateOffice = () => {
        this.setState({officeForEditing:null, showAddOfficeModal: false})
    }

    onAddOffice = (officeDetails) => {
        const newOffice = {
            "phone": officeDetails.phone,
            "address": {
                "addressLine1": officeDetails.addressLine1,
                "addressLine2": officeDetails.addressLine2,
                "city": officeDetails.city,
                "state": officeDetails.state,
                "country": "US",
                "zipCode": officeDetails.zipCode
            },
            email: "",
            opensAt: "11:00:00",
            closesAt:"12:00:00"
        }

        this.setState({showAddOfficeModal: false, editing: true},()=>{
            const requestOptions = {
                url: `/districts/${this.props.district.districtId}/offices`,
                method: 'POST',
                headers: { ...authHeader(), 'Content-Type': 'application/json' },
                data: newOffice
            };
            axios(requestOptions).then((response)=>{
            }).catch((e) => {
                Modal.error({
                    title: "Error adding office",
                    content: getErrorMessage(e),
                });
            }).then(()=>{
                this.fetchDistrictDetails(()=>{this.setState({editing: false})})
            })
        })
    }

    onUpdateOffice = (officeDetails) => {
        const updated = {
            "phone": officeDetails.phone,
            "address": {
                "addressLine1": officeDetails.addressLine1,
                "addressLine2": officeDetails.addressLine2,
                "city": officeDetails.city,
                "state": officeDetails.state,
                "country": "US",
                "zipCode": officeDetails.zipCode
            },
            email: "",
            opensAt: "11:00:00",
            closesAt:"12:00:00"
        }
        this.setState({officeForEditing: null, editing: true},()=>{
            const requestOptions = {
                url: `/districts/${this.props.district.districtId}/offices/${officeDetails.districtOfficeId}`,
                method: 'PUT',
                headers: { ...authHeader(), 'Content-Type': 'application/json' },
                data: updated
            };
            axios(requestOptions).then((response)=>{
            }).catch((e) => {
                Modal.error({
                    title: "Error updating office",
                    content: getErrorMessage(e),
                });
            }).then(()=>{
                this.fetchDistrictDetails(()=>{this.setState({editing: false})})
            })
        })
    }

    handleModalOk = (_) => {
        this.setState({
          fetchError: null,
        });
      }
}

const RepresentativeEditForm = Form.create({ name: 'representative_edit' })(Representative);

export default RepresentativeEditForm;
