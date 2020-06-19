import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import Metric from '../Metric';

const Counter = ({
  subtitle, model, onChange, now, add,
}) => {
  const [n, setN] = useState(null);
  useEffect(() => {
    if (onChange) {
      onChange(n);
    }
  }, [n]);

  useEffect(() => {
    const calculate = () => {
      const nowTs = moment(now).format('X');
      const value = Math.floor(model.predictY(model.getTerms(), nowTs));
      if (value !== n && (n === null || value > n)) {
        setN(value);
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