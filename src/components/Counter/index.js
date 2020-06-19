import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import numeral from 'numeral';

import Metric from '../Metric';

const Counter = ({
  subtitle, model, onChange, now, add,
}) => {
  const [n, setN] = useState(null);
  const [inLast24H, setInLast24H] = useState(null);
  useEffect(() => {
    if (onChange) {
      onChange(n);
    }
  }, [n]);

  useEffect(() => {
    const calculate = () => {
      const nowTs = moment(now).format('X');
      const value = Math.floor(model.predictY(model.getTerms(), nowTs));
      const nowLess24HTs = moment(now).subtract(1, 'day').format('X');
      const last24H = value - Math.floor(model.predictY(model.getTerms(), nowLess24HTs));
      if (value !== n && (n === null || value > n)) {
        setN(value);
        setInLast24H(last24H);
      }
    };
    calculate();
  }, [model, now, n]);

  if (n === null) {
    return null;
  }

  return (
    <Metric
      subtitle={subtitle}
      n={n + add}
      subn={`(+${numeral(inLast24H).format('0,0')} últ 24 horas)`}
    />
  );
};

Counter.defaultProps = {
  onChange: () => {},
  now: null,
  add: 0,
};

Counter.propTypes = {
  subtitle: PropTypes.string.isRequired,
  model: PropTypes.object.isRequired,
  onChange: PropTypes.func,
  now: PropTypes.object,
  add: PropTypes.number,
};

export default Counter;
