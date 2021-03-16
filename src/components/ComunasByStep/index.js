/* eslint-disable react/no-danger */
/* eslint-disable no-restricted-globals */
import React from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';

import Metric from '../Metric';
import { faseData } from '../../helpers/utils';

import styles from './index.module.css';

const ComunasByStep = ({
  fases,
}) => {
  if (!fases) {
    return null;
  }
  const comunasByStep = {};
  [...Array(5).keys()].map((x) => {
    comunasByStep[x + 1] = fases.filter((c) => c === (x + 1)).length;
    return null;
  });
  const totalComunas = fases.length;

  return (
    <div className={styles.grid6Cols1Col}>
      {[...Array(5).keys()].map((x) => (
        <div className={styles.widget} key={x}>
          <Metric
            color={faseData[x + 1].color}
            n={`${comunasByStep[x + 1]}`}
            subn={`${numeral((comunasByStep[x + 1] / totalComunas) * 100).format('0.00')}%`}
            subtitle={(
              <>
                Comunas en
                {' '}
                {faseData[x + 1].name}
                <br />
                <small>
                  Paso
                  {' ' }
                  {x + 1}
                </small>
              </>
            )}
          />
        </div>
      ))}
      <div className={styles.widget} key="all">
        <Metric
          n={totalComunas}
          subtitle="Total de comunas"
        />
      </div>
    </div>
  );
};

ComunasByStep.propTypes = {
  fases: PropTypes.array.isRequired,
};

export default ComunasByStep;
