import React from 'react';
import { Route } from 'react-router-dom';
import PropTypes from 'prop-types';

const RouteWithSubRoutes = (route) => (
  <Route
    path={route.path}
    exact={route.exact}
    render={props => (
      <route.component {...props} routes={route.routes} />
    )}
  />
);
RouteWithSubRoutes.propTypes = {
  route: PropTypes.object
};
export default RouteWithSubRoutes;

