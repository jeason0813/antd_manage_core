import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Antd from 'antd';
import _ from 'lodash';
import DI from '../../di';
import styles from './breadcrumb.styl';
import HashHistory from '../../router/hash-history';

const AntdBreadcrumb = Antd.Breadcrumb;

class Breadcrumb extends React.Component {

  static propTypes = {
    dispatch: PropTypes.func,
    breadcrumb: PropTypes.object
  };

  state = {
    breadcrumbs: []
  };

  componentWillMount() {
    this.unsubscribed = HashHistory.listen(::this.locationHasChanged);
  }

  componentWillUnmount() {
    this.unsubscribed();
  }

  locationHasChanged(toRoute) {
    const pathname = toRoute.pathname;
    if (pathname === '/') {
      DI.get('navigation').getDefault().then((breadcrumbs) => {
        this.setState({
          breadcrumbs: [breadcrumbs]
        });
      });
    } else {
      DI.get('navigation').getBreadcrumbs(toRoute.pathname).then((breadcrumbs) => {
        this.setState({
          breadcrumbs
        });
      });
    }
  }

  render() {
    const { breadcrumbs } = this.state;

    const maxBreadcrumbIndex = breadcrumbs.length - 1;
    const breadcrumbItems = _.map(breadcrumbs, (config, index) => {
      let content = config.name;

      if (config.component && index !== maxBreadcrumbIndex) {
        content = <Link to={config.path} >{config.name}</Link>;
      }

      return (
        <AntdBreadcrumb.Item key={config.path} >
          {content}
        </AntdBreadcrumb.Item>
      );
    });

    return (
      <div className={styles.container} >
        <AntdBreadcrumb separator=">" >
          {breadcrumbItems}
        </AntdBreadcrumb>
      </div>
    );
  }
}

Breadcrumb.contextTypes = {
  ...React.Component.contextTypes,
  router: PropTypes.object,
  history: PropTypes.object
};

export default Breadcrumb;
