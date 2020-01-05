import React, { Component } from 'react'; // eslint-disable-line no-unused-vars
import axios from '../../_util/axios-api';

import { authHeader } from '../../_util/auth/auth-header';

import './Districts.module.css';

class Districts extends Component {

    state = {
        districtDetails: null,
        districtFetchError: null
    }

    componentDidMount() {
        const requestOptions = {
            url: `/districts/${this.props.district}`,
            method: 'GET',
            headers: { ...authHeader(), 'Content-Type': 'application/json' },
        };
        axios(requestOptions).then((response)=>{
                this.setState({districtDetails: response.data});
            }).catch((e) => {
                console.log(e)
            })
    }

    render() {
        return <></>;
    }
}

export default Districts;
