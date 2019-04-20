import React, { Component } from 'react';
import axios from '../../_util/axios-api';

import { authHeader } from '../../_util/auth/auth-header';


import styles from './Districts.module.css';

class Districts extends Component {

    state = {
        districtDetails: null,
        districtFetchError: null
    }

    componentDidMount() {
        console.log('hi');
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
        console.log('hi');
        return <></>;
    }
}

const mapStateToProps = state => {
    return { 
        district: state.districts.selected,
    };
};

export default Districts;
