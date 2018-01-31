import React from 'react';
import PropTypes from 'prop-types';
import './google-material-icon.styl';
const GoogleMaterialIcon = ({ type, style }) => (
  <i className="material-icons" style={style} >{type}</i>
);

GoogleMaterialIcon.propTypes = {
  type: PropTypes.string,
  style: PropTypes.object
};
export default GoogleMaterialIcon;
