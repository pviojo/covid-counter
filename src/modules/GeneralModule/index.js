/* eslint-disable max-len */
/* eslint-disable no-shadow */
import React from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';
// eslint-disable-next-line
import numerales from "numeral/locales/es";
import isMobile from 'is-mobile';

import { RenderLineChart, RenderBarChart, chartColorsTheme } from '../../components/Charts';

import { delta } from '../../helpers/data';

import '../../global.scss';
import styles from './index.module.scss';

const GeneralModule = ({
  data,
  vaccinesData,
  theme,
}) => {
  numeral.locale('es');

  return (
    <div className={`${styles.cnt} ${styles[`theme-${theme}`]}`}>
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
  theme: PropTypes.string,
};

export default GeneralModule;
