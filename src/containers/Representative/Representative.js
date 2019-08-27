import React, { Component } from 'react';
import { Card, List, Modal, Skeleton, Form, Input, Button, Spin, Typography} from 'antd';

import OfficeModal from './OfficeModal';

import axios from '../../_util/axios-api';


import { authHeader } from '../../_util/auth/auth-header';
import { connect } from 'react-redux';

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
        if (this.state.hydratedDistrict !== null) {
            this.fetchDistrictDetails();
        }
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
                if (district.districtId !== this.props.district.districtId) {
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
        const self = this;
        const formFields = this.props.form.getFieldsValue();
        // TODO: use object destructuring to avoid re-setting things like callTargets that don't change
        const body = {
            "state":this.state.hydratedDistrict.state,
            "number": this.state.hydratedDistrict.number,
            "repFirstName": formFields.firstName,
            "repLastName": formFields.lastName,
            "info": formFields.shortBio,
            "repImageUrl": this.state.hydratedDistrict.repImageUrl,
            "callTargets": this.state.hydratedDistrict.callTargets
        }

        this.setState({editing: true},()=>{
            const requestOptions = {
                url: `/districts/${this.props.district.districtId}/`,
                method: 'PUT',
                headers: { ...authHeader(), 'Content-Type': 'application/json' },
                data: body
            };
            axios(requestOptions).then((response)=>{
            }).catch((e) => {
                Modal.error({
                    title: "Error updating district",
                    content: e.message,
                });
            }).then(()=>{
                this.fetchDistrictDetails(()=>{self.setState({editing: false})})
            })
        })
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
            {this.state.editing !== false && form}
            {this.state.editing && <Spin size="large" />}
        </>;
    }

    form = (isLoading, dis, getFieldDecorator) => {
        return (
        <>
            <Skeleton loading={isLoading} title={true} paragraph={false}>
                <div>
                    {dis &&
                        <>
                        <Typography.Title level={2}>Representative {dis.repLastName} ({dis.state}-{dis.number})</Typography.Title>
                        <Typography.Paragraph>
                            Use this page to edit information about your representative/district.
                        </Typography.Paragraph>
                        </>
                    }
                </div>
            </Skeleton>
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
                    <Form.Item label="Short Bio">
                        {getFieldDecorator('shortBio', {
                            rules: [{required: true, message: 'A couple of sentences about the Representative.'},
                                    {max: 512, message:'The message must not exceed 512 characters.'}],
                            initialValue: dis.info
                        })(<Input.TextArea rows={3} />)}
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
                    <Form.Item
                        wrapperCol={{ span: 12, offset: 5 }}
                        >
                        <Button type="primary" htmlType="submit">
                            Save
                        </Button>
                    </Form.Item>
                </Skeleton>
            </Form>
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
        this.setState({officeForEditing: null, showAddOfficeModal: true})
    }

    launchEditOfficeModal = (office) => {
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
            return el.districtOfficeId !== districtOfficeId
        })
        if (!office){
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
                            content: e.message,
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
                    content: e.message,
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
                    content: e.message,
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

const mapStateToProps = state => {
    return {
        district: state.districts.selected,
    };
};

const RepresentativeEditForm = Form.create({ name: 'representative_edit' })(Representative);

export default connect(mapStateToProps)(RepresentativeEditForm);
