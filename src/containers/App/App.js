import React, { Component } from 'react';
import * as Sentry from '@sentry/browser';
import {Switch, Route} from 'react-router-dom';
import { withRouter } from "react-router";
import ReactGA from 'react-ga';

import ScrollToTop from '../ScrollToTop/ScrollToTop';
import PrivateRoute from '../../components/PrivateRoute/PrivateRoute';

import Admin from '../Admin/Admin'
import Dashboard from '../Dashboard/Dashboard';
import SignUp from '../SignUp/SignUp';
import Login from '../Login/Login';
import Reports from '../Reports/Reports';
import Callers from '../Callers/Callers';
import Schedule from '../Schedule/Schedule';
import CallDistribution from '../CallDistribution/CallDistribution';
import Script from '../Script/Script';
import TalkingPoints from '../TalkingPoints/TalkingPoints';
import TalkingPointSelection from '../TalkingPoints/TalkingPointSelection/TalkingPointSelection';
import Representative from '../Representative/Representative';
import Account from '../Account/Account';
import Districts from '../Districts/Districts';
import RequestPasswordReset from '../RequestPasswordReset/RequestPasswordReset';
import FinishPasswordReset from '../FinishPasswordReset/FinishPasswordReset';

import styles from './App.module.css';

class App extends Component {

  constructor(props) {
    super(props);
    Sentry.init({
      dsn: "https://a494b18b01b840f5859e7f93d9ef5b16@sentry.io/1462516"
    });
    // Google Analytics
    ReactGA.initialize('UA-140402020-2', {
      testMode: process.env.NODE_ENV === 'test',
    });
  }

  componentDidMount() {
		ReactGA.pageview(window.location.pathname)
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      if (this.props.location.pathname){
        ReactGA.pageview(this.props.location.pathname)
      }
    }
  }

  render() {
    return (
      <ScrollToTop>
        <div className={styles.App}>
            <Switch>
              <Route path="/" exact component={Login} />
              <Route path="/signup" component={SignUp} />
              <Route path="/request_password_reset" component={RequestPasswordReset} />
              <Route path="/finish_password_reset" component={FinishPasswordReset} />
              <Route path="/login" component={Login} />
              <PrivateRoute path="/dashboard/:districtSlug?" component={Dashboard} />
              <PrivateRoute path="/reports/:districtSlug?" component={Reports} />
              <PrivateRoute path="/callers/:districtSlug?" component={Callers} />
              <PrivateRoute path="/schedule/:districtSlug?" component={Schedule} />
              <PrivateRoute path="/distribution/:districtSlug?" component={CallDistribution} />
              <PrivateRoute path="/script/:districtSlug?" component={Script} />
              <PrivateRoute path="/talking-points/:districtSlug?" component={TalkingPoints} />
              <PrivateRoute path="/talking-points-selection/:districtSlug?" component={TalkingPointSelection} />
              <PrivateRoute path="/representative/:districtSlug?" component={Representative} />
              <PrivateRoute path="/admins/:districtSlug?" component={Admin} />
              <PrivateRoute path="/account/:districtSlug?" component={Account} />
              <PrivateRoute path="/districts/:districtSlug?" component={Districts} />
              <Route render={() => {return <h2>404</h2>}} />
            </Switch>
        </div>
      </ScrollToTop>
    );
  }
}

export default withRouter(App);
export { App };
