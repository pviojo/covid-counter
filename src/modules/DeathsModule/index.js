/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
/* eslint-disable no-shadow */
import React from 'react';
import PropTypes from 'prop-types';

import '../../global.scss';
import styles from './index.module.scss';

const DeathsModule = ({
  // eslint-disable-next-line no-unused-vars
  data,
}) => {
  const n = 28000;
  return (
    <div className={styles.deaths}>
      {
        [...Array(n).keys()].map((x) => (
          <div className={styles.death} key={x} />
        ))
    }
    </div>
  );
};

DeathsModule.defaultProps = {
};

DeathsModule.propTypes = {
  data: PropTypes.any.isRequired,
};

export default DeathsModule;
