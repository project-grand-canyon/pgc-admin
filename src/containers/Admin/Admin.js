import React, { Component } from 'react';
import axios from '../../_util/axios-api';
import { displayName } from '../../_util/district';
import { authHeader } from '../../_util/auth/auth-header';
import { Alert, Radio, Table, Typography, Tag } from 'antd';

class Admin extends Component {

    state = {
        admins: null,
        districts: null,
        fetchError: null,
        mode: 'district'
    };

    componentDidMount(){
        this.fetchAdmins();
    }

    fetchAdmins(){
        const adminsRequestOptions = {
            url: `/admins`,
            method: 'GET',
            headers: { ...authHeader(), 'Content-Type': 'application/json' },
        };
        const districtsRequestOptions = {
            url: `/districts`,
            method: 'GET',
            headers: { ...authHeader(), 'Content-Type': 'application/json' },
        };
        const adminsRequest = axios(adminsRequestOptions);
        const districtsRequest = axios(districtsRequestOptions);
        
        this.setState({}, () => {
            Promise.all([adminsRequest, districtsRequest])
            .then((responses)=>{
                const admins = responses[0].data.filter((admin)=>{return admin.loginEnabled});
                const districts = responses[1].data;
                
                this.setState({
                    admins: admins,
                    districts: districts,
                    fetchError: null
                });
            })
            .catch((error)=>{
                this.setState({
                    admins: null,
                    districts: null,
                    fetchError: error
                });
            });
        })
    }

    getByEmailColumns = () => [{
        title: 'Email',
		dataIndex: 'email',
        key: 'email',
        sorter: (a, b) => { 
            return a.email != null ? a.email.localeCompare(b.email) : 1
        }
    },{
        title: 'Districts',
		dataIndex: 'districts',
        key: 'districts',
        render: districts => (
            <span>
                {districts.map(district => {
                    return(<Tag key={district}>
                        {district}
                      </Tag>)
                })}
            </span>
        )
    },{
      title: 'Level',
      dataIndex: 'root',
      key: 'root',
      sorter: (a, b) => { return a.root ? 1 : -1},
      render: root => {
        return <Typography.Text>{root ? "Super Admin" : "District Admin"}</Typography.Text>
      }
    }];

    getByDistrictColumns = () => [{
        title: 'District',
		dataIndex: 'name',
        key: 'name',
        sorter: (a, b) => { 
            return a.name != null ? a.name.localeCompare(b.name) : 1;
        }
    },{
        title: 'Admins',
		dataIndex: 'emails',
        key: 'emails',
        render: emails => (
            <span>
                {emails.map(email => {
                    return(<Tag key={email}>
                        {email}
                      </Tag>)
                })}
            </span>
        )
    }];

    handleToggle = e => {
        const mode = e.target.value;
        this.setState({ mode });
      };

    getByEmailSource() {
        if (this.state.districts === null || this.state.admins === null) {
            return null;
        }
        return this.state.admins.filter((admin)=>{
            return admin.email !== null
        }).map((admin) => {
            const districts = admin.districts.map((adminDistrict)=>{
                return this.state.districts.find((district)=>{
                    return adminDistrict === district.districtId
                })
            }).filter((district)=>{
                return district !== undefined
            }).map((district)=>{
                return displayName(district)
            });
            return {
                email: admin.email,
                districts: districts,
                key: admin.email,
                root: admin.root
            }
        })
    }

    getByDistrictSource() {
        if (this.state.districts == null || this.state.admins == null) {
            return null;
        }

        return this.state.districts.map((district)=>{
            return {
                key: displayName(district),
                name: displayName(district),
                emails: this.state.admins.filter((admin)=>{
                    return admin.districts.indexOf(district.districtId) !== -1
                }).map((admin)=>{return admin.email})
            }
        }).filter((item)=>{
            return item.emails.length > 0
        }).sort((a, b) => { 
            return a.name.localeCompare(b.name)
        });
    }

    getTable() {
        if (this.state.fetchError) {
            return (
                <Alert
                    message="Error Loading Admins"
                    description={this.state.fetchError.message}
                    type="error"
              />
            )
        }

        return this.state.mode === "district" ? this.getByDistrictTable() : this.getByEmailTable();
    }

    getByDistrictTable() {
        const dataSource = this.getByDistrictSource();
        const columns = this.getByDistrictColumns();
        return (<Table
            loading={dataSource === null}
            bordered
            dataSource={dataSource}
            columns={columns}
            scroll={{ x: 300 }}
            scrollToFirstRowOnChange
            pagination={false}
        />)
    }

    getByEmailTable() {
        const dataSource = this.getByEmailSource();
        const columns = this.getByEmailColumns();
        return (<Table
            loading={dataSource === null}
            bordered
            dataSource={dataSource}
            columns={columns}
            scroll={{ x: 300 }}
            scrollToFirstRowOnChange
            pagination={false}
        />)
    }

    render() {
        const { mode } = this.state;
        return(<>
            <Typography.Title level={2}>
            Admins Master List
            </Typography.Title>

            <Radio.Group onChange={this.handleToggle} value={mode} style={{ marginBottom: 8 }}>
            <Radio.Button value="district">By District</Radio.Button>
            <Radio.Button value="admin">By Admin</Radio.Button>
            </Radio.Group>
            {this.getTable()}
        </>);
    }
}

export default Admin;







