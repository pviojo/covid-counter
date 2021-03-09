/* eslint-disable max-len */
/* eslint-disable no-shadow */
import React from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';
// eslint-disable-next-line
import numerales from "numeral/locales/es";
import moment from 'moment';
import isMobile from 'is-mobile';

import { RenderLineChart, RenderBarChart, chartColorsTheme } from '../../components/Charts';

import Metric from '../../components/Metric';
import ComunasByStep from '../../components/ComunasByStep';
import { delta } from '../../helpers/data';

import '../../global.scss';
import styles from './index.module.scss';

const GeneralModule = ({
  data,
  vaccinesData,
  theme,
  regionesData,
}) => {
  numeral.locale('es');

  const newCasesLast7D = data[data.length - 1].avg7DNewCases * 7;
  const newCasesPrev7D = data[data.length - 1].avg14DNewCases * 14 - data[data.length - 1].avg7DNewCases * 7;
  const deltaCases = ((newCasesLast7D / newCasesPrev7D) - 1) * 100;
  const deathsLast7D = data[data.length - 1].avg7DDeaths * 7;
  const deathsPrev7D = data[data.length - 1].avg14DDeaths * 14 - data[data.length - 1].avg7DDeaths * 7;
  const deltaDeaths = ((deathsLast7D / deathsPrev7D) - 1) * 100;

  const allFases = regionesData ? Object.values(regionesData).reduce((a, b) => a.concat(b.fases), []) : [];

  return (
    <div className={`${styles.cnt} ${styles[`theme-${theme}`]}`}>
      <div className={styles.grid3Cols1Col}>
        <div className={styles.widget}>
          <Metric
            color={data[data.length - 1].positivity * 100 > 5 ? '#c30' : '#777'}
            n={`${numeral(data[data.length - 1].positivity * 100).format('0.00')}%`}
            subn={`${numeral(data[data.length - 1].avg7DPositivity * 100).format('0.00')}% ult 7 días`}
            subtitle="Positividad en todo el país"
          />
          <br />
          <small>
            * Actualizado
            {' '}
            {moment(data[data.length - 1].updatedAt).add(3, 'hours').format('YYYY-MM-DD')}
          </small>
        </div>
        <div className={styles.widget}>
          <Metric
            color={deltaCases > 0 ? '#c30' : '#777'}
            n={`${numeral(newCasesLast7D).format('0,000')}`}
            subn={`${deltaCases > 0 ? '+' : ''}${numeral(deltaCases).format('0.00')}% vs semana anterior (${numeral(newCasesPrev7D).format('0,000')})`}
            subtitle="Casos nuevos últimos 7 dias"
          />
          <br />
          <small>
            * Actualizado
            {' '}
            {moment(data[data.length - 1].updatedAt).add(3, 'hours').format('YYYY-MM-DD')}
          </small>
        </div>
        <div className={styles.widget}>
          <Metric
            color={deltaDeaths > 0 ? '#c30' : '#777'}
            n={`${numeral(deathsLast7D).format('0,000')}`}
            subn={`${deltaDeaths > 0 ? '+' : ''}${numeral(deltaDeaths).format('0.00')}% vs semana anterior (${numeral(deathsPrev7D).format('0,000')})`}
            subtitle="Fallecidos últimos 7 dias"
          />
          <br />
          <small>
            * Actualizado
            {' '}
            {moment(data[data.length - 1].updatedAt).add(3, 'hours').format('YYYY-MM-DD')}
          </small>
        </div>
      </div>

      <ComunasByStep fases={allFases} />

      <div className={styles.widget}>
        <RenderLineChart
          theme={theme}
          data={data}
          xcolors={chartColorsTheme[theme]}
          yAxisScale="linear"
          title="Casos nuevos"
          xAxisType="time"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          showYAxisSelector
          height={isMobile() ? 80 : 25}
          yAxisMin={0}
          xLabelsField="updatedAt"
          yDatasets={{
            'Casos nuevos': 'newCases',
            'Promedio Casos nuevos (ult 7D)': 'avg7DNewCases',
            'Promedio Casos nuevos (ult 14D)': 'avg14DNewCases',
          }}
        />
        <br />
      </div>
      <div className={styles.widget}>
        <RenderBarChart
          theme={theme}
          data={
            delta(
              data,
              7,
              'newCases',
            ).map((x) => ({
              ...x,
              newCases: Math.min(Math.max(x.newCases, -1), 1),
            }))
          }
          yAxisScale="linear"
          yAxisType="percentage"
          xAxisType="time"
          showYAxisSelector
          title="Variación Casos nuevos (7 días)"
          width={100}
          height={isMobile() ? 60 : 25}
          xAxisStepSize={isMobile() ? 7 : 1}
          xLabelsField="updatedAt"
          yDatasets={{
            'Var %': 'newCases',
          }}
        />
        <small>* Limitado en rango +/- 100%</small>
      </div>
      <div className={styles.widget}>
        <RenderBarChart
          theme={theme}
          data={data.map((x) => (
            {
              ...x,
              percentAvg7DNewCasesWithSymptoms: parseInt((x.avg7DNewCasesWithSymptoms / (x.avg7DNewCasesWithSymptoms + x.avg7DNewCasesWithoutSymptoms)) * 100, 10),
              percentAvg7DNewCasesWithoutSymptoms: parseInt((x.avg7DNewCasesWithoutSymptoms / (x.avg7DNewCasesWithSymptoms + x.avg7DNewCasesWithoutSymptoms)) * 100, 10),
            }
          ))}
          yAxisScale="linear"
          title="% Casos nuevos con y sin síntomas (promedio ult 7d)"
          stack
          xAxisType="time"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          showYAxisSelector
          height={isMobile() ? 80 : 25}
          yAxisMin={0}
          xLabelsField="updatedAt"
          yDatasets={{
            'Con síntomas': 'percentAvg7DNewCasesWithSymptoms',
            'Sin síntomas': 'percentAvg7DNewCasesWithoutSymptoms',
          }}
        />
        <br />
      </div>
      <div className={styles.widget}>
        <RenderLineChart
          theme={theme}
          data={data.map((x) => (
            {
              ...x,
              positivity: x.positivity ? x.positivity * 100 : null,
              avg7DPositivity: x.positivity ? x.avg7DPositivity * 100 : null,
              avg14DPositivity: x.positivity ? x.avg14DPositivity * 100 : null,
              recommended: 5,
            }
          ))}
          yAxisScale="log"
          title="% Positividad PCR (Nuevos casos / Test reportados)"
          xAxisType="time"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          showYAxisSelector
          height={isMobile() ? 80 : 25}
          yAxisMin={0}
          xLabelsField="updatedAt"
          yDatasets={{
            '% Test PCR Positivos': 'positivity',
            '% Test PCR Positivos (Media Móvil 7D)': 'avg7DPositivity',
            '% Test PCR Positivos (Media Móvil 14D)': 'avg14DPositivity',
            'Recomendado (5%)': 'recommended',
          }}
        />
        <br />
      </div>
      <div className={styles.widget}>
        <RenderLineChart
          theme={theme}
          data={data.map((x) => (
            {
              ...x,
              last7DDeaths: x.avg7DDeaths * 7,
              last14DDeaths: x.avg14DDeaths * 14,
              deaths: Math.min(Math.max(x.deaths, 0), 300),
            }
          ))}
          yAxisScale="linear"
          title="Fallecidos"
          xAxisType="time"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          showYAxisSelector
          height={isMobile() ? 80 : 25}
          yAxisMin={0}
          xLabelsField="updatedAt"
          yDatasets={{
            Fallecidos: 'deaths',
            'Promedio Fallecidos (ult 7D)': 'avg7DDeaths',
            'Promedio Fallecidos (ult 14D)': 'avg14DDeaths',
          }}
        />
        <small>* Limitado en rango 0-300 para omitir peaks de computos retrasados</small>
        <br />
      </div>
      <div className={styles.widget}>
        <RenderBarChart
          theme={theme}
          data={
            delta(
              data,
              7,
              'deaths',
            ).map((x) => ({
              ...x,
              deaths: Math.min(Math.max(x.deaths, -1), 1),
            }))
          }
          yAxisScale="linear"
          yAxisType="percentage"
          xAxisType="time"
          showYAxisSelector
          title="Variación en 7 días Fallecidos"
          width={100}
          height={isMobile() ? 60 : 25}
          xAxisStepSize={isMobile() ? 7 : 1}
          xLabelsField="updatedAt"
          yDatasets={{
            'Var %': 'deaths',
          }}
        />
        <small>* Limitado en rango +/- 100%</small>
      </div>
      <div className={styles.widget}>
        <RenderBarChart
          theme={theme}
          data={
            delta(
              data,
              7,
              'avg7DDeaths',
            ).map((x) => ({
              ...x,
              avg7DDeaths: Math.min(Math.max(x.avg7DDeaths, -1), 1),
            }))
          }
          yAxisScale="linear"
          yAxisType="percentage"
          xAxisType="time"
          showYAxisSelector
          title="Variación en 7 días de Media 7d Fallecidos"
          width={100}
          height={isMobile() ? 60 : 25}
          xAxisStepSize={isMobile() ? 7 : 1}
          xLabelsField="updatedAt"
          yDatasets={{
            'Var %': 'avg7DDeaths',
          }}
        />
        <small>* Limitado en rango +/- 100%</small>
      </div>
      <div className={styles.widget}>
        <RenderLineChart
          theme={theme}
          data={vaccinesData}
          yAxisScale="linear"
          title="Vacunados"
          xAxisType="time"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          showYAxisSelector
          height={isMobile() ? 80 : 25}
          yAxisMin={0}
          xLabelsField="date"
          yDatasets={{
            'Primera dosis': 'firstDose',
            'Segunda dosis': 'secondDose',
          }}
        />
        <br />
      </div>
      <div className={styles.widget}>
        <RenderLineChart
          theme={theme}
          data={data.map((x) => (
            {
              ...x,
              last7DNewCases: x.avg7DNewCases * 7,
              last14DNewCases: x.avg14DNewCases * 14,
            }
          ))}
          yAxisScale="linear"
          title="Casos activos"
          xAxisType="time"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          showYAxisSelector
          height={isMobile() ? 80 : 25}
          yAxisMin={0}
          xLabelsField="updatedAt"
          yDatasets={{
            'Casos activos': 'activeCases',
          }}
        />
        <br />
      </div>
      <div className={styles.widget}>
        <RenderLineChart
          theme={theme}
          data={data}
          yAxisScale="linear"
          title="Test PCR reportados"
          xAxisType="time"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          showYAxisSelector
          height={isMobile() ? 80 : 25}
          yAxisMin={0}
          xLabelsField="updatedAt"
          yDatasets={{
            'Test PCR': 'testsPCR',
            'Test PCR (Media Móvil 7D)': 'avg7DtestsPCR',
          }}
        />
        <br />
      </div>
    </div>
  );
};

GeneralModule.defaultProps = {
  theme: 'light',
};

GeneralModule.propTypes = {
  data: PropTypes.object.isRequired,
  vaccinesData: PropTypes.object.isRequired,
  regionesData: PropTypes.object.isRequired,
  theme: PropTypes.string,
};

export default GeneralModule;
