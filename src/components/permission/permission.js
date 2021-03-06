import React from 'react';
import PropTypes from 'prop-types';
import DI from '../../di';
import styles from './permission.styl';

export default class Permission extends React.Component {
  static propTypes = {
    needPermission: PropTypes.array,
    children: PropTypes.node.isRequired
  };

  state = { showChildren: false };

  componentWillMount() {
    if (!this.props.needPermission.length) {
      this.setState({ showChildren: true });
    } else {
      DI.get('permission')
        .checkPermissionPromise(this.props.needPermission)
        .then((data) => {
          this.setState({ showChildren: data });
        });
    }
  }

  render() {
    let children = null;
    if (DI.get('config').get('permission.debug')) {
      children = (
        <div className={styles.debug} >
          <p className={styles.info} >
            {JSON.stringify(this.props.needPermission)}
          </p>
          {this.props.children}
        </div>
      );
    }
    if (this.state.showChildren) {
      children = this.props.children;
    }
    return children;
  }
}

