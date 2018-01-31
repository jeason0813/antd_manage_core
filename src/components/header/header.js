import React from 'react';
import PropTypes from 'prop-types';
import Breadcrumb from '../breadcrumb/breadcrumb';
import AccountInfo from '../account-info/account-info';
import NavigationSearch from '../navigation-search/navigation-search';
import styles from './header.styl';

const Header = ({ toggle, account }) => (
  <header className={toggle ? `${styles.container} ${styles.toggle}` : styles.container} >
    <Breadcrumb />
    <AccountInfo account={account} />
    <NavigationSearch />
  </header>
);

Header.propTypes = {
  toggle: PropTypes.bool,
  account: PropTypes.object
};

export default Header;
