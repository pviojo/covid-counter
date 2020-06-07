import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';
import moment from 'moment';

import styles from './index.module.css';

const Counter = ({
  subtitle, startTs, start, delta, onChange, simulateTs,
}) => {
  const [n, setN] = useState(start);
  useEffect(() => {
    if (onChange) {
      onChange(n);
    }
  }, [n, onChange]);

  useEffect(() => {
    const pid = window.setInterval(() => {
      const nowTs = moment(simulateTs).format('X');
      const cases = Math.floor(start + delta * (nowTs - startTs));
      if (cases !== n && cases > n) {
        setN(cases);
      }
    }, 100);
    return () => {
      window.clearInterval(pid);
    };
  }, [start, delta, startTs, n, simulateTs]);

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
  simulateTs: null,
};

Counter.propTypes = {
  subtitle: PropTypes.string.isRequired,
  startTs: PropTypes.number.isRequired,
  start: PropTypes.number.isRequired,
  delta: PropTypes.number.isRequired,
  simulateTs: PropTypes.number,
  onChange: PropTypes.func,
};

export default Counter;
