import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';
import moment from 'moment';

import styles from './index.module.css';

const Counter = ({
  subtitle, model, onChange, now,
}) => {
  const [n, setN] = useState(null);
  useEffect(() => {
    if (onChange) {
      onChange(n);
    }
  }, [n, onChange]);

  useEffect(() => {
    const calculate = () => {
      const nowTs = moment(now).format('X');
      const value = Math.floor(model.predictY(model.getTerms(), nowTs));
      if (value !== n && (n === null || value > n)) {
        setN(value);
      }
    };
    calculate();
    const pid = window.setInterval(calculate, 100);
    return () => {
      window.clearInterval(pid);
    };
  }, [model, n]);

  if (n === null) {
    return null;
  }

  return (
    <div className={styles.cnt}>
      <div className={styles.counter}>{numeral(n).format('0,0')}</div>
      <div className={styles.subtitle}>
        {subtitle}
      </div>
    </div>
  );
};

Counter.defaultProps = {
  onChange: () => {},
  now: null,
};

Counter.propTypes = {
  subtitle: PropTypes.string.isRequired,
  model: PropTypes.object.isRequired,
  onChange: PropTypes.func,
  now: PropTypes.number,
};

export default Counter;
