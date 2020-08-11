import React from 'react';
import { Route, Redirect } from 'react-router-dom';

import LoggedInWrapper from '../../containers/LoggedInWrapper/LoggedInWrapper';

const privateRoute = ({ component, ...rest }) => {
    const user = localStorage.getItem('user');
    const expiration = localStorage.getItem('expires');
    const isLoggedIn = user && expiration && expiration > Date.now();
    console.log('private route')
    console.log(user)
    console.log(isLoggedIn)

    return (
    <Route {...rest} render={props => (
        isLoggedIn
            ? <LoggedInWrapper component={component} componentProps={props}></LoggedInWrapper>
            : <Redirect to={{ pathname: '/login', state: { from: props.location } }} />
    )} />
)}

export default privateRoute;