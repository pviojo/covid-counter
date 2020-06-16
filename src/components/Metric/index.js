/* eslint-disable no-restricted-globals */
import React from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';
import styles from './index.module.css';

const Metric = ({
  n, subtitle, color,
}) => (
  <div className={styles.cnt} style={{ color }}>
    <div className={styles.counter}>{!isNaN(n) ? numeral(n).format('0,0') : n}</div>
    <div className={styles.subtitle}>
      {subtitle}
    </div>
  </div>
);
Metric.defaultProps = {
  color: '',
};

Metric.propTypes = {
  subtitle: PropTypes.string.isRequired,
  n: PropTypes.string.isRequired,
  color: PropTypes.string,
};

export default Metric;
