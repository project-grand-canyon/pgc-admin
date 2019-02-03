import React, { Component } from 'react';
import {Switch, Route} from 'react-router-dom';

import ScrollToTop from '../ScrollToTop/ScrollToTop';
import PrivateRoute from '../../components/PrivateRoute/PrivateRoute';

import Home from '../Home/Home';
import Dashboard from '../Dashboard/Dashboard';
import SignUp from '../SignUp/SignUp';
import Login from '../Login/Login';
import Reports from '../Reports/Reports';
import Callers from '../Callers/Callers';
import Schedule from '../Schedule/Schedule';
import Script from '../Script/Script';
import TalkingPoints from '../TalkingPoints/TalkingPoints';
import TalkingPointSelection from '../TalkingPoints/TalkingPointSelection/TalkingPointSelection';
import Representative from '../Representative/Representative';
import Account from '../Account/Account';
import Districts from '../Districts/Districts';

import styles from './App.module.css';

class App extends Component {
  render() {
    return (
      <ScrollToTop>
        <div className={styles.App}>
            <Switch>
              <Route path="/" exact component={Home} />
              <Route path="/signup" component={SignUp} />
              <Route path="/login" component={Login} />
              <PrivateRoute path="/dashboard" exact component={Dashboard} />
              <PrivateRoute path="/reports" component={Reports} />
              <PrivateRoute path="/callers" component={Callers} />
              <PrivateRoute path="/schedule" component={Schedule} />
              <PrivateRoute path="/script" component={Script} />
              <PrivateRoute path="/talking-points" component={TalkingPoints} />
              <PrivateRoute path="/talking-points/selection" component={TalkingPointSelection} />
              <PrivateRoute path="/representative/" component={Representative} />
              <PrivateRoute path="/account" component={Account} />
              <PrivateRoute path="/districts" component={Districts} />
              <Route render={() => {return <h2>404</h2>}} />
            </Switch>
        </div>
      </ScrollToTop>
    );
  }
}

export default App;
