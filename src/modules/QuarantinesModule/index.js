/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable no-shadow */
import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import numeral from 'numeral';
// eslint-disable-next-line
import numerales from "numeral/locales/es";
import { useHistory } from 'react-router-dom';
import isMobile from 'is-mobile';

import {
  faseData,
} from '../../helpers/utils';
import '../../global.scss';
import styles from './index.module.scss';
import { RenderScatterChart } from '../../components/Charts';

const QuarantinesModule = ({
  comunasData,
  theme,
  onChangeLocation,
}) => {
  const history = useHistory();
  return (
    <div className={`${styles.cnt} ${styles[`theme-${theme}`]}`}>
      <div className={styles.main}>
        {comunasData && (
        <div className={styles.widget}>
          <div className={styles.title}>
            Cuarentenas Actuales.
            <br />
            <small>
              Incidencia Activos cada 100.000 hab por comuna
            </small>
          </div>
          <div className={styles.subtitle}>
            * Fase de las comunas pueden tener un desfase de 3-4 días respecto a situación actual.
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Comuna</th>
                <th className="center">Inicio</th>
                <th className="center">Inc. Activos Inicio</th>
                <th className="center">Inc. Activos Actual</th>
                <th className="center">Días en fase actual</th>
                <th className="center">Variación Activos</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(comunasData).filter(
                (x) => (x.fase === 1 && x.currentFase.fase === 1),
              ).map((c) => (
                <tr
                  key={c.comunaCode}
                  style={{ background: faseData[c.fase] && faseData[c.fase].colortr }}
                >
                  <td>
                    <span style={{ verticalAlign: 'middle' }}>
                      <a onClick={() => { history.push(`/comparar-comunas/${c.comunaCode}`); onChangeLocation(); }}>{c.comuna}</a>
                    </span>
                    <br />
                    <small>
                      {c.region}
                    </small>
                  </td>
                  <td className="center">
                    {moment(c.currentFase.start).format('DD/MM')}
                  </td>
                  <td className="center">
                    {numeral(c.currentFase.prevalence_active_cases_start).format('0,000.0')}
                    <br />
                    (T:
                    {' '}
                    {numeral(c.currentFase.active_cases_start).format('0,000')}
                    )
                  </td>
                  <td className="center">
                    {numeral(c.currentFase.prevalence_active_cases_end).format('0,000.0')}
                    <br />
                    (T:
                    {' '}
                    {numeral(c.currentFase.active_cases_end).format('0,000')}
                    )
                  </td>
                  <td className="center">
                    {moment(c.currentFase.end).diff(moment(c.currentFase.start), 'days')}
                  </td>
                  <td className="center">
                    <span style={{ color: c.currentFase.pct_delta_active_cases >= 0 ? '#c30' : '#093' }}>
                      {numeral(c.currentFase.pct_delta_active_cases).format('+%0.0')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <br />
          <br />
          <RenderScatterChart
            theme={theme}
            data={Object.values(comunasData).filter(
              (x) => (x.fase === 1 && x.currentFase.fase === 1),
            ).map((c) => ({
              label: `${c.comuna}: (${moment(c.currentFase.end).diff(moment(c.currentFase.start), 'days')} días,  ${numeral(c.currentFase.pct_delta_active_cases).format('+0.0%')})`,
              x: moment(c.currentFase.end).diff(moment(c.currentFase.start), 'days'),
              y: Math.round((c.currentFase.pct_delta_active_cases * 100) * 10) / 10,
            }))}
            title="% Variación Casos Activos vs Días en cuarentena"
            width={100}
            height={isMobile() ? 60 : 60}
            xAxisStepSize={isMobile() ? 7 : 1}
            xLabelsField="updatedAt"

          />

        </div>
        )}

      </div>
    </div>
  );
};
QuarantinesModule.defaultProps = {
  theme: 'light',
  onChangeLocation: null,
};

QuarantinesModule.propTypes = {
  comunasData: PropTypes.object.isRequired,
  theme: PropTypes.string,
  onChangeLocation: PropTypes.func,
};

export default QuarantinesModule;
