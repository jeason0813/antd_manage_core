import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'antd';
import AuthHttp from '../../services/auth-http';
import Login from './login';
import DI from '../../di';
import styles from './login-modal.styl';
import HashHistory from '../../components/hash-history/hash-history';

class LoginModal extends React.Component {

  static propTypes = {
    children: PropTypes.element
  };

  state = {
    visible: false
  };

  componentWillMount() {
    this.checkToken();
    this.intervalId = setInterval(() => {
      this.checkToken();
    }, DI.get('config').get(
      'core.auth.token.checkDelay'
    ));
  }

  componentWillUnmount() {
    clearInterval(this.intervalId);
  }

  onLoginSuccess() {
    this.setState({
      visible: false
    });
  }

  onShow() {
    this.setState({
      visible: true
    });
  }

  checkToken() {
    if (!this.state.visible) {
      DI.get('authHttp')
        .checkToken()
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            this.onShow();
          }
        });
    }
  }

  render() {
    const width = 'auto';
    const modal = true;
    const closable = false;
    const { visible } = this.state;
    return (
      <Modal
        visible={visible}
        width={width}
        wrapClassName={styles.container}
        footer=""
        closable={closable}
      >
        <Login
          modal={modal}
          onLoginSuccess={::this.onLoginSuccess}
        />
      </Modal>
    );
  }
}


export default LoginModal;
