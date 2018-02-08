import React from 'react';
import PropTypes from 'prop-types';
import { Switch, Redirect } from 'react-router-dom';
import Navigation from '../navigation/navigation';
import LoginModal from '../login/login-modal';
import MyTask from '../my-task/my-task';
import Header from '../header/header';
import Birthday from '../../components/birthday/birtyday';
import RouteWithSubRoutes from '../route-with-sub-routes/route-with-sub-routes';
import HashHistory from '../../router/hash-history';
import DI from '../../di';
import styles from './layout.styl';

export default class Layout extends React.Component {

  static propTypes = {
    routes: PropTypes.array
  };

  state = {
    toggle: undefined,
    account: {}
  };

  componentWillMount() {
    DI.get('auth').getAccount().then((account) => {
      if (!account || !account.real_name) {
        HashHistory.push('/login');
      } else {
        this.setState({ account });
      }
    });
    DI.get('commonOfflineStorage').get('menuToggleStatus')
      .then((toggle) => {
        this.setState({ toggle: !!toggle });
      })
      .catch(() => {
        this.setState({ toggle: false });
      });
  }

  boradcastMenuToggle(val) {
    this.setState({
      toggle: val
    }, () => {
      DI.get('commonOfflineStorage').add('menuToggleStatus', val);
    });
  }

  render() {
    const { routes } = this.props;
    const { toggle, account } = this.state;
    const main = (
      <section
        className={toggle ? `${styles.container} ${styles.toggle}` : styles.container}
      >
        <Header toggle={toggle} account={account} />
        <div className={styles.children} >
          <Switch>
            {routes.map((route, i) => (
              <RouteWithSubRoutes key={i} {...route} />
            ))}
            <Redirect path="*" to="/404" />
          </Switch>
        </div>
        <Birthday
          account={account}
        />
      </section>
    );

    return (
      <div>
        <LoginModal />
        <Navigation
          location={location}
          onToggle={::this.boradcastMenuToggle}
          toggle={toggle}
        />
        {main}
        <MyTask />
      </div>
    );
  }

}
