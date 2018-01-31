import React from 'react';
import PropTypes from 'prop-types';
import { HashRouter, Switch } from 'react-router-dom';
import _ from 'lodash';
import DI from '../../di';
import Layout from '../layout/layout';
import Login from '../login/login';
import NotFound from '../not-found/not-found';
import RouteWithSubRoutes from '../route-with-sub-routes/route-with-sub-routes';
import moment from 'moment';
import Raven from 'raven-js';


import 'moment-range';

if (process.env.NODE_ENV === 'development' && module && module.hot) {
  module.hot.accept();
}

class Root extends React.Component {

  static propTypes = {
    navigationConfig: PropTypes.array.isRequired,
    configs: PropTypes.object.isRequired
  };

  static notFoundRouteConfig = {
    name: 'notFound',
    path: '/404',
    component: NotFound
  };

  static loginRouteConfig = {
    name: '登录',
    path: '/login',
    component: Login
  };

  static routesConfig = {
    path: '/',
    component: Layout,
    name: 'layout',
    routes: []
  };

  state = {
    routesConfig: []
  };

  componentWillMount() {
    this.init();
  }

  init() {
    moment.locale('zh-CN');
    const sentryUrl = _.get(DI.get('config'), 'configs.sentry.url');
    if (process.env.NODE_ENV === 'production' && sentryUrl) {
      Raven.config(sentryUrl).install();
    }
    const { configs, navigationConfig } = this.props;
    DI.get('config').setConfigs(configs);
    DI.get('navigation')
      .setNavigationConfig(navigationConfig)
      .getChildRoutesAndIndexRoute()
      .then((childRoutesAndIndexRoute) => {
        this.setState({
          routesConfig: [
            Root.loginRouteConfig,
            Root.notFoundRouteConfig,
            _.merge(Root.routesConfig, childRoutesAndIndexRoute)
          ]
        });
      });
  }

  render() {
    const { routesConfig } = this.state;

    if (routesConfig.length) {
      return (
        <HashRouter>
          <Switch>
            {routesConfig.map((route, i) => (
              <RouteWithSubRoutes key={i} {...route} />
            ))}
          </Switch>
        </HashRouter>
      );
    }
    return <p>loading</p>;
  }
}

export default Root;

