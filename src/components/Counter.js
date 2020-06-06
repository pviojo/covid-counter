import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';

import styles from './index.module.css';

const Counter = ({
  subtitle, startTs, start, delta, onChange,
}) => {
  const [n, setN] = useState(start);
  useEffect(() => {
    if (onChange) {
      onChange(n);
    }
  }, [n, onChange]);

  useEffect(() => {
    const pid = window.setInterval(() => {
      const nowTs = Date.now() / 1000;
      const cases = Math.floor(start + delta * (nowTs - startTs));
      if (cases !== n && cases > n) {
        setN(cases);
      }
    }, 100);
    return () => {
      window.clearInterval(pid);
    };
  }, [start, delta, startTs, n]);

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
};

Counter.propTypes = {
  subtitle: PropTypes.string.isRequired,
  startTs: PropTypes.number.isRequired,
  start: PropTypes.number.isRequired,
  delta: PropTypes.number.isRequired,
  onChange: PropTypes.func,
};

export default Counter;
