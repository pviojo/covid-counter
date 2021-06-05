/* eslint-disable no-nested-ternary */
/* eslint-disable no-param-reassign */
/* eslint-disable max-len */
/* eslint-disable no-shadow */
import React from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';
// eslint-disable-next-line
import numerales from "numeral/locales/es";
import moment from 'moment';
import 'moment/locale/es';
import isMobile from 'is-mobile';

import { CSVLink } from 'react-csv';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

import { RenderLineChart, RenderBarChart } from '../../components/Charts';

import Metric from '../../components/Metric';
import ComunasByStep from '../../components/ComunasByStep';
import {
  delta, avgLast,
  // maxWeekly,
  accumulatedWeekly,
} from '../../helpers/data';

import '../../global.scss';
import styles from './index.module.scss';

const GeneralModule = ({
  data,
  vaccinesData,
  theme,
  regionesData,
}) => {
  moment.locale('es');
  numeral.locale('es');
  const newCasesLast7D = data[data.length - 1].avg7DNewCases * 7;
  const newCasesPrev7D = data[data.length - 1].avg14DNewCases * 14 - data[data.length - 1].avg7DNewCases * 7;
  const deltaCases = ((newCasesLast7D / newCasesPrev7D) - 1) * 100;
  const deathsLast7D = data[data.length - 1].avg7DDeaths * 7;
  const deathsPrev7D = data[data.length - 1].avg14DDeaths * 14 - data[data.length - 1].avg7DDeaths * 7;
  const deltaDeaths = ((deathsLast7D / deathsPrev7D) - 1) * 100;
  const {
    ventiladoresAvailable, pctVentiladoresAvailable,
  } = data[data.length - 1];

  const newCasesToday = data[data.length - 1].newCases;
  const newCasesFromPCRToday = data[data.length - 1].newCasesFromPCR;
  const newCasesFromAGToday = data[data.length - 1].newCasesFromAG;
  const newCases7DBefore = data[data.length - 1 - 7].newCases;
  const deltaNewCases7D = ((newCasesToday / newCases7DBefore) - 1) * 100;
  const ventiladoresAvailable7DAgo = data[data.length - 8].ventiladoresAvailable;
  const pctVentiladoresAvailable7DAgo = data[data.length - 8].pctVentiladoresAvailable;

  const deltaVentiladores = ((ventiladoresAvailable / ventiladoresAvailable7DAgo) - 1) * 100;
  const deltaPctVentiladores = pctVentiladoresAvailable7DAgo - pctVentiladoresAvailable;

  const allFases = regionesData ? Object.values(regionesData).reduce((a, b) => a.concat(b.fases), []) : [];
  const fasesData = regionesData ? Object.values(regionesData).reduce((a, b) => {
    Object.keys(b.byFase).map((k) => {
      if (!a[k]) {
        a[k] = { ...b.byFase[k] };
      } else {
        a[k].population += b.byFase[k].population;
      }
      return null;
    });
    return a;
  }, {}) : {};

  const csvData = data.map((row) => ([
    moment(row.updatedAt).add(4, 'hours').format('YYYY-MM-DD'),
    parseInt(row.newCases, 10),
    parseInt(row.totalCases, 10),
    parseInt(row.testsPCR, 10),
    parseInt(row.avg7DtestsPCR, 10),
    parseFloat(row.positivity),
    parseFloat(row.avg7DPositivity),
    parseInt(row.newDeaths || 0, 10),
    parseInt(row.deaths || 0, 10),
    parseFloat((row.totalDeaths / row.totalCases) * 100 || 0),
  ]));
  csvData.unshift([
    'fecha',
    'nuevos_casos',
    'total_casos',
    'nuevos_fallecidos',
    'total_fallecidos',
    'letalidad',
  ]);

  return (
    <div className={`${styles.cnt} ${styles[`theme-${theme}`]}`}>
      <div className={styles.grid6Cols1Col}>
        <div className={styles.widget}>
          <Metric
            color={deltaNewCases7D > 0 ? '#c30' : '#777'}
            n={`${numeral(newCasesToday).format('0,000')}`}
            subn={(
              <div>
                {`${numeral(deltaNewCases7D).format('+0.0')}% vs semana anterior (${numeral(newCases7DBefore).format('0,000')})`}
                <br />
                {`PCR: ${numeral(newCasesFromPCRToday).format('0,000')}`}
                <br />
                {`Antígenos: ${numeral(newCasesFromAGToday).format('0,000')}`}
              </div>
            )}
            subtitle="Casos nuevos hoy"
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
            color={data[data.length - 1].positivity * 100 > 5 ? '#c30' : '#777'}
            n={`${numeral(data[data.length - 1].positivity * 100).format('0.0')}%`}
            subn={(
              <div>
                {numeral(data[data.length - 1].avg7DPositivity * 100).format('0.0')}
                % ult 7 días
                <br />
                {numeral(data[data.length - 1 - 7].avg7DPositivity * 100).format('0.0')}
                %  7 días previos
                (
                {
                  numeral(
                    (
                      (data[data.length - 1].avg7DPositivity / data[data.length - 1 - 7].avg7DPositivity) - 1
                    ) * 100,
                  ).format('+0.0')
                }
                % variación)
              </div>
            )}
            subtitle="Positividad PCR"
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
            subn={`${deltaCases > 0 ? '+' : ''}${numeral(deltaCases).format('0.0')}% vs semana anterior (${numeral(newCasesPrev7D).format('0,000')})`}
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
            subn={`${deltaDeaths > 0 ? '+' : ''}${numeral(deltaDeaths).format('0.0')}% vs semana anterior (${numeral(deathsPrev7D).format('0,000')})`}
            subtitle="Fallecidos últimos 7 dias"
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
            color={(pctVentiladoresAvailable < 10 || deltaVentiladores < 0) ? '#c30' : '#777'}
            n={`${numeral(ventiladoresAvailable).format('0,000')}`}
            subn={`${deltaVentiladores > 0 ? '+' : ''}${numeral(deltaVentiladores).format('0.0')}% vs semana anterior (${numeral(ventiladoresAvailable7DAgo).format('0,000')})`}
            subtitle="Camas críticas y Ventiladores disponibles"
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
            color={(pctVentiladoresAvailable < 10 || deltaPctVentiladores < 0) ? '#c30' : '#777'}
            n={`${numeral(100 - pctVentiladoresAvailable).format('0.0')}%`}
            subn={`${deltaPctVentiladores > 0 ? '+' : ''}${numeral(deltaPctVentiladores).format('0.0')}% vs semana anterior (${numeral(100 - pctVentiladoresAvailable7DAgo).format('0.0')}%)`}
            subtitle="Ocupación críticas y Ventiladores"
          />
          <br />
          <small>
            * Actualizado
            {' '}
            {moment(data[data.length - 1].updatedAt).add(3, 'hours').format('YYYY-MM-DD')}
          </small>
        </div>
      </div>

      <ComunasByStep fases={allFases} fasesData={fasesData} />
      <div className={styles.grid2Cols1Col}>
        <div className={styles.widget}>
          <RenderLineChart
            theme={theme}
            data={data.slice(-56).map((x, i) => ({
              ...x,
              newCasesPrevWeek: data.slice(-56 - 7, -7)[i].newCases,
              newCasesPrev2Week: data.slice(-56 - 14, -14)[i].newCases,
            }))}
            yAxisScale="linear"
            title="Comparación Casos nuevos ultimos 56 días (vs anteriores 7 y 14 días)"
            xAxisType="time"
            xAxisStepSize={1}
            width={100}
            showYAxisSelector
            height={isMobile() ? 80 : 50}
            yAxisMin={0}
            xLabelsField="updatedAt"
            yDatasets={{
              'Casos nuevos': 'newCases',
              'Casos nuevos (7 días antes)': 'newCasesPrevWeek',
              'Casos nuevos (14 días antes)': 'newCasesPrev2Week',
            }}
          />
        </div>
        <div className={styles.widget}>
          <RenderLineChart
            theme={theme}
            data={
            (() => {
              let originalData = [...data];
              originalData = avgLast(originalData, 7, 'pcr', 'avg7DPCR');
              let d = delta(
                data.slice(-56 - 7),
                7,
                'newCases',
              );
              d = avgLast(d, 7, 'newCases', 'avg7DNewCases');
              d.map((x) => ({
                ...x,
                newCases: Math.min(Math.max(x.newCases, -1), 1),
              }));
              const avg = (
                (originalData.slice(-56).reduce((a, b) => a + b.newCases, 0))
                / (originalData.slice(-56 - 7, -7).reduce((a, b) => a + b.newCases, 0))
              ) - 1;

              d = d.map((x) => ({
                ...x,
                avg: Math.round(avg * 100) / 100,
              }));
              return d;
            })()
          }
            yAxisScale="linear"
            yAxisType="percentage"
            xAxisType="time"
            showYAxisSelector
            title="Variación Casos nuevos últimos 56 días (vs anteriores 7)"
            width={100}
            height={isMobile() ? 80 : 50}
            xAxisStepSize={isMobile() ? 7 : 1}
            xLabelsField="updatedAt"
            yDatasets={{
              'Var %': 'newCases',
              'Promedio (ult 7 días)': 'avg7DNewCases',
            }}
          />
          <small>* Limitado en rango +/- 100%</small>
        </div>
      </div>
      <div className={styles.grid2Cols1Col}>
        <div className={styles.widget}>
          <RenderLineChart
            theme={theme}
            data={data.slice(-56).map((x, i) => ({
              ...x,
              deathsPrevWeek: data.slice(-56 - 7, -7)[i].deaths,
              deathsPrev2Week: data.slice(-56 - 14, -14)[i].deaths,
            }))}
            yAxisScale="linear"
            title="Comparación Fallecidos ultimos 56 días (vs anteriores 7 y 14 días)"
            xAxisType="time"
            xAxisStepSize={1}
            width={100}
            showYAxisSelector
            height={isMobile() ? 80 : 50}
            yAxisMin={0}
            xLabelsField="updatedAt"
            yDatasets={{
              Fallecidos: 'deaths',
              'Fallecidos (7 días antes)': 'deathsPrevWeek',
              'Fallecidos (14 días antes)': 'deathsPrev2Week',
            }}
          />
        </div>
        <div className={styles.widget}>
          <RenderLineChart
            theme={theme}
            data={
            (() => {
              const originalData = [...data];
              let d = delta(
                originalData.slice(-56),
                7,
                'deaths',
              );
              d = avgLast(d, 7, 'deaths', 'avg7Ddeaths');
              d = avgLast(d, 14, 'deaths', 'avg14Ddeaths');
              d = d
                .map((x) => ({
                  ...x,
                  deathsReal: x.deaths,
                  deaths: Math.min(Math.max(x.deaths, -1), 1),
                }));
              return d;
            })()
          }
            yAxisScale="linear"
            yAxisType="percentage"
            xAxisType="time"
            showYAxisSelector
            title="Variación Fallecidos últimos 56 días (vs anteriores 7 días)"
            width={100}
            height={isMobile() ? 80 : 50}
            xAxisStepSize={isMobile() ? 7 : 1}
            xLabelsField="updatedAt"
            yDatasets={{
              'Var %': 'deaths',
              'Promedio (ult 7 días)': 'avg7Ddeaths',
            }}
          />
          <small>* Limitado en rango +/- 100%</small>
        </div>
      </div>
      <div className={styles.widget}>
        <RenderLineChart
          theme={theme}
          data={data.map((x) => ({
            ...x,
            avg7DNewCases: Math.round(x.avg7DNewCases),
            avg14DNewCases: Math.round(x.avg14DNewCases),
            avg21DNewCases: Math.round(x.avg21DNewCases),
            avg28DNewCases: Math.round(x.avg28DNewCases),
          }))}
          yAxisScale="linear"
          title="Casos nuevos"
          xAxisType="time"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          showYAxisSelector
          height={isMobile() ? 80 : 30}
          yAxisMin={0}
          xLabelsField="updatedAt"
          yDatasets={{
            'Casos nuevos': 'newCases',
            'Promedio Casos nuevos (ult 7D)': 'avg7DNewCases',
            'Promedio Casos nuevos (ult 14D)': 'avg14DNewCases',
            'Promedio Casos nuevos (ult 21D)': 'avg21DNewCases',
            'Promedio Casos nuevos (ult 28D)': 'avg28DNewCases',
          }}
        />
        <br />
      </div>
      <div className={styles.widget}>
        <RenderLineChart
          theme={theme}
          data={data}
          yAxisScale="linear"
          title="Casos nuevos con sospecha de reinfección"
          xAxisType="time"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          showYAxisSelector
          height={isMobile() ? 80 : 30}
          yAxisMin={0}
          xLabelsField="updatedAt"
          yDatasets={{
            Casos: 'newCasesReinfect',
            'Promedio Casos (ult 7D)': 'avg7DNewCasesReinfect',
            'Promedio Casos (ult 14D)': 'avg14DNewCasesReinfect',
          }}
        />
        <small>* No muestra reporte del 24/2/2021 y 25/2/2021 de 316 y 23 casos acumulados con anterioridad para evitar distorsión del gráfico</small>
        <br />
      </div>
      <div className={styles.widget}>
        <RenderLineChart
          theme={theme}
          data={data}
          yAxisScale="linear"
          title="Casos nuevos según test"
          xAxisType="time"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          showYAxisSelector
          height={isMobile() ? 80 : 30}
          yAxisMin={0}
          xLabelsField="updatedAt"
          yDatasets={{
            PCR: 'newCasesFromPCR',
            Antígenos: 'newCasesFromAG',
          }}
        />
        <br />
      </div>
      <div className={styles.widget}>
        <RenderLineChart
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
          height={isMobile() ? 60 : 30}
          xAxisStepSize={isMobile() ? 7 : 1}
          xLabelsField="updatedAt"
          yDatasets={{
            'Var %': 'newCases',
          }}
        />
        <small>* Limitado en rango +/- 100%</small>
      </div>

      <div className={styles.widget}>
        <RenderLineChart
          theme={theme}
          data={
            delta(
              data,
              7,
              'avg7DNewCases',
            ).map((x) => ({
              ...x,
              avg7DNewCases: Math.min(Math.max(x.avg7DNewCases, -1), 1),
            }))
          }
          yAxisScale="linear"
          yAxisType="percentage"
          xAxisType="time"
          showYAxisSelector
          title="Variación en 7 días de Media 7d Casos nuevos"
          width={100}
          height={isMobile() ? 60 : 30}
          xAxisStepSize={isMobile() ? 7 : 1}
          xLabelsField="updatedAt"
          yDatasets={{
            'Var %': 'avg7DNewCases',
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
          height={isMobile() ? 80 : 30}
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
          data={data}
          yAxisScale="linear"
          title="Casos totales"
          xAxisType="time"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          showYAxisSelector
          height={isMobile() ? 80 : 30}
          yAxisMin={0}
          xLabelsField="updatedAt"
          yDatasets={{
            'Casos totales': 'totalCases',
          }}
        />
        <br />
      </div>
      <div className={styles.widget}>
        <RenderLineChart
          theme={theme}
          data={data}
          yAxisScale="linear"
          title="Casos activos"
          xAxisType="time"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          showYAxisSelector
          height={isMobile() ? 80 : 30}
          yAxisMin={0}
          xLabelsField="updatedAt"
          yDatasets={{
            'Casos activos (FIS)': 'activeCasesFIS',
            'Casos activos (FD)': 'activeCasesFD',
          }}
        />
        <small>* FIS: Fecha inicio de sintomas, FD: Fecha de diagnostico</small>
        <br />
      </div>
      <div className={styles.widget}>
        <RenderLineChart
          theme={theme}
          data={
            delta(
              delta(
                data,
                7,
                'activeCasesFIS',
              ).map((x) => ({
                ...x,
                activeCasesFIS: Math.min(Math.max(x.activeCasesFIS, -1), 1),
              })),
              7,
              'activeCasesFD',
            ).map((x) => ({
              ...x,
              activeCasesFD: Math.min(Math.max(x.activeCasesFD, -1), 1),
            }))
          }
          yAxisScale="linear"
          yAxisType="percentage"
          xAxisType="time"
          showYAxisSelector
          title="Variación en 7 días de casos activos"
          width={100}
          height={isMobile() ? 60 : 30}
          xAxisStepSize={isMobile() ? 7 : 1}
          xLabelsField="updatedAt"
          yDatasets={{
            'Var % (FIS)': 'activeCasesFIS',
            'Var % (FD)': 'activeCasesFD',
          }}
        />
        <small>* Limitado en rango +/- 100%</small>
      </div>
      <div className={styles.widget}>
        <RenderLineChart
          theme={theme}
          data={() => {
            let rsp = data;
            const maxAvg7DtestsPCR = Math.max(...rsp.slice(-90).map((x) => x.avg7DtestsPCR));
            rsp = rsp.map((x) => (
              {
                ...x,
                maxAvg7DtestsPCR,
              }
            ));
            return rsp;
          }}
          yAxisScale="linear"
          title="Test PCR reportados"
          xAxisType="time"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          showYAxisSelector
          height={isMobile() ? 80 : 30}
          yAxisMin={0}
          xLabelsField="updatedAt"
          yDatasets={{
            'Test PCR': 'testsPCR',
            'Test PCR (Media Móvil 7D)': 'avg7DtestsPCR',
            'Test PCR (Media Móvil 14D)': 'avg14DtestsPCR',
            'Máx Media Móvil 14D (ult 90d)': 'maxAvg7DtestsPCR',
          }}
        />
        <br />
      </div>
      <div className={styles.widget}>
        <RenderLineChart
          theme={theme}
          data={
            delta(
              data,
              7,
              'avg7DtestsPCR',
            ).map((x) => ({
              ...x,
              avg7DtestsPCR: Math.min(Math.max(x.avg7DtestsPCR, -1), 1),
            }))
          }
          yAxisScale="linear"
          yAxisType="percentage"
          xAxisType="time"
          showYAxisSelector
          title="Variación en 7 días de Media 7d Test PCR reportados"
          width={100}
          height={isMobile() ? 60 : 30}
          xAxisStepSize={isMobile() ? 7 : 1}
          xLabelsField="updatedAt"
          yDatasets={{
            'Var %': 'avg7DtestsPCR',
          }}
        />
        <small>* Limitado en rango +/- 100%</small>
      </div>
      <div className={styles.widget}>
        <RenderLineChart
          theme={theme}
          data={() => {
            let rsp = data.slice(-120).map((x) => (
              {
                ...x,
                positivity: x.positivity ? Math.round(x.positivity * 100 * 100) / 100 : null,
                avg7DPositivity: x.positivity ? Math.round(x.avg7DPositivity * 100 * 100) / 100 : null,
                avg14DPositivity: x.positivity ? Math.round(x.avg14DPositivity * 100 * 100) / 100 : null,
                recommended: 5,
              }
            ));
            const maxAvg7DPositivity = Math.max(...rsp.map((x) => x.avg7DPositivity));
            rsp = rsp.map((x) => (
              {
                ...x,
                maxAvg7DPositivity,
              }
            ));
            return rsp;
          }}
          yAxisScale="linear"
          title="% Positividad PCR (Nuevos casos por PCR / Test PCR reportados)"
          xAxisType="time"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          showYAxisSelector
          height={isMobile() ? 80 : 30}
          yAxisMin={0}
          xLabelsField="updatedAt"
          yDatasets={{
            '% Test PCR Positivos': 'positivity',
            '% Test PCR Positivos (Media Móvil 7D)': 'avg7DPositivity',
            '% Test PCR Positivos (Media Móvil 14D)': 'avg14DPositivity',
            'Recomendado (5%)': 'recommended',
            'Máx Media Móvil 7D (ult 90d)': 'maxAvg7DPositivity',
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
          height={isMobile() ? 80 : 30}
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
          height={isMobile() ? 60 : 30}
          xAxisStepSize={isMobile() ? 7 : 1}
          xLabelsField="updatedAt"
          yDatasets={{
            'Var %': 'deaths',
          }}
        />
        <small>* Limitado en rango +/- 100%</small>
      </div>
      <div className={styles.widget}>
        <RenderLineChart
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
          height={isMobile() ? 60 : 30}
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
          data={data}
          yAxisScale="linear"
          title="Fallecidos totales"
          xAxisType="time"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          showYAxisSelector
          height={isMobile() ? 80 : 30}
          yAxisMin={0}
          xLabelsField="updatedAt"
          yDatasets={{
            'Fallecidos totales': 'totalDeaths',
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
              lethality: (x.totalDeaths / x.totalCases) * 100,
            }
          ))}
          yAxisScale="linear"
          title="Letalidad %"
          xAxisType="time"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          showYAxisSelector
          height={isMobile() ? 80 : 30}
          yAxisMin={0}
          xLabelsField="updatedAt"
          yDatasets={{
            'Letalidad (14d) %': 'lethality',
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
              lethality: (x.avg14DDeaths / x.avg14DNewCases) * 100,
            }
          ))}
          yAxisScale="linear"
          title="Letalidad (14d) %"
          xAxisType="time"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          showYAxisSelector
          height={isMobile() ? 80 : 30}
          yAxisMin={0}
          xLabelsField="updatedAt"
          yDatasets={{
            'Letalidad %': 'lethality',
          }}
        />
        <br />
      </div>
      <div className={styles.widget}>
        <RenderLineChart
          theme={theme}
          data={vaccinesData}
          yAxisScale="linear"
          title="Vacunados total"
          xAxisType="time"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          showYAxisSelector
          height={isMobile() ? 80 : 30}
          yAxisMin={0}
          xLabelsField="date"
          yDatasets={{
            'Primera dosis': 'firstDose',
            'Segunda dosis': 'secondDose',
            Total: 'total',
          }}
        />
        <br />
      </div>
      <div className={styles.widget}>
        <RenderLineChart
          theme={theme}
          data={vaccinesData.map((x) => ({
            ...x,
            avg7DNewFirstDose: Math.round(x.avg7DNewFirstDose),
            avg7DNewSecondDose: Math.round(x.avg7DNewSecondDose),
            avg7DNewTotal: Math.round(x.avg7DNewTotal),
          }))}
          yAxisScale="linear"
          title="Vacunados diarios"
          xAxisType="time"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          showYAxisSelector
          height={isMobile() ? 80 : 30}
          yAxisMin={0}
          xLabelsField="date"
          yDatasets={{
            'Primera dosis': 'newFirstDose',
            'Segunda dosis': 'newSecondDose',
            Total: 'newTotal',
            'Primera dosis (promedio ult 7 dias)': 'avg7DNewFirstDose',
            'Segunda dosis (promedio ult 7 dias)': 'avg7DNewSecondDose',
            'Total (promedio ult 7 dias)': 'avg7DNewTotal',
          }}
        />
        <br />
      </div>
      <div className={styles.widget}>
        <RenderLineChart
          theme={theme}
          data={vaccinesData.slice(-56).map((x) => ({
            ...x,
            avg7DNewFirstDose: Math.round(x.avg7DNewFirstDose),
            avg7DNewSecondDose: Math.round(x.avg7DNewSecondDose),
            avg7DNewTotal: Math.round(x.avg7DNewTotal),
          }))}
          yAxisScale="linear"
          title="Vacunados diarios últimos 56 días"
          xAxisType="time"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          showYAxisSelector
          height={isMobile() ? 80 : 30}
          yAxisMin={0}
          xLabelsField="date"
          yDatasets={{
            'Primera dosis': 'newFirstDose',
            'Segunda dosis': 'newSecondDose',
            Total: 'newTotal',
            'Primera dosis (promedio ult 7 dias)': 'avg7DNewFirstDose',
            'Segunda dosis (promedio ult 7 dias)': 'avg7DNewSecondDose',
            'Total (promedio ult 7 dias)': 'avg7DNewTotal',
          }}
        />
        <br />
      </div>
      <div className={styles.widget}>
        <RenderLineChart
          theme={theme}
          data={data}
          yAxisScale="linear"
          title="Ventiladores"
          xAxisType="time"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          showYAxisSelector
          height={isMobile() ? 80 : 30}
          yAxisMin={0}
          xLabelsField="updatedAt"
          yDatasets={{
            Disponibles: 'ventiladoresAvailable',
            Ocupados: 'ventiladoresBusy',
            Totales: 'ventiladoresTotal',
          }}
        />
        <br />
      </div>
      <div className={styles.widget}>
        <RenderBarChart
          theme={theme}
          data={data}
          yAxisScale="linear"
          title="% Ventiladores disponibles"
          xAxisType="time"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          stack
          showYAxisSelector
          height={isMobile() ? 80 : 30}
          yAxisMin={0}
          xLabelsField="updatedAt"
          yDatasets={{
            '% Disponibles': 'pctVentiladoresAvailable',
            '% Ocupados': 'pctVentiladoresBusy',
          }}
        />
        <br />
      </div>
      <div className={styles.widget}>
        <RenderLineChart
          theme={theme}
          data={data}
          yAxisScale="linear"
          title="Camas críticas"
          xAxisType="time"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          showYAxisSelector
          height={isMobile() ? 80 : 30}
          yAxisMin={0}
          xLabelsField="updatedAt"
          yDatasets={{
            Disponibles: 'camasAvailable',
            'Ocupados COVID-19': 'camasBusyCovid19',
            'Ocupados No COVID-19': 'camasBusyNonCovid19',
            'Ocupados Total': 'camasBusy',
            Totales: 'camasTotal',
          }}
        />
      </div>
      <div className={styles.widget}>
        <RenderBarChart
          theme={theme}
          data={data}
          yAxisScale="linear"
          title="% Camas críticas disponibles"
          xAxisType="time"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          stack
          showYAxisSelector
          height={isMobile() ? 80 : 30}
          yAxisMin={0}
          xLabelsField="updatedAt"
          yDatasets={{
            '% Disponibles': 'pctCamasAvailable',
            '% Ocupados COVID-19': 'pctCamasBusyCovid19',
            '% Ocupados No COVID-19': 'pctCamasBusyNonCovid19',
          }}
        />
      </div>
      <div className={styles.widget}>
        <div className={styles.title}>Camas disponibles por región</div>
        <div className={styles.grid8Cols1Col}>
          {Object.values(regionesData).sort((a, b) => (a.regionCode < b.regionCode ? -1 : 1)).map((r) => {
            const { available, total } = r.camas[r.camas.length - 1];
            const { available: available7D } = r.camas[r.camas.length - 1 - 8];
            const deltaAvailable7D = ((available / available7D) - 1) * 100;
            const pctAvailable = available / total;
            return (
              <div className={styles.widget} key={r.regionCode}>
                <Metric
                  color={available === 1 ? '#5e309a' : (pctAvailable < 0.1 ? '#c30' : '#999')}
                  n={`${numeral(available).format('0,000')}`}
                  subn={(
                    <small>
                      {`${numeral(deltaAvailable7D).format('+0.0')}% vs semana anterior (${numeral(available7D).format('0,000')})`}
                      <br />
                      Total:
                      {' '}
                      {numeral(total).format('0,000')}
                    </small>
)}
                  subtitle={r.region}
                />
                <br />
                <small>
                  * Actualizado
                  {' '}
                  {moment(data[data.length - 1].updatedAt).add(3, 'hours').format('YYYY-MM-DD')}
                </small>
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.widget}>
        <RenderLineChart
          theme={theme}
          data={
            () => {
              const fields = [
                '0-9',
                '10-19',
                '20-29',
                '30-39',
                '40-49',
                '50-59',
                '60-69',
                '70-79',
                '80+',
                'total',
                '0-19',
                '20-59',
                '60+',
              ];
              let rsp = accumulatedWeekly(
                data.filter((x) => x.agesRow.general).map((x) => ({
                  updatedAt: x.updatedAt,
                  ...x.agesRow.general,
                })),
                fields,
              );
              const maximums = fields.reduce(
                (a, b) => {
                  a[b] = Math.max(...(rsp.slice(0, -26).map((x) => x[b]).filter((x) => !Number.isNaN(x))));
                  return a;
                }, {},
              );
              rsp = rsp.map((r) => {
                fields.map((f) => {
                  r[f] = Math.round(((r[f] / maximums[f])) * 100);
                  return null;
                });
                r['100pct'] = 100;
                return r;
              });
              return rsp;
            }
          }
          yAxisScale="linear"
          title="% Casos por edad vs primer peak"
          xAxisType="linear"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          showYAxisSelector
          height={isMobile() ? 80 : 40}
          yAxisMin={0}
          xLabelsField="updatedAt"
          yDatasets={{
            '0-9': '0-9',
            '10-19': '10-19',
            '20-29': '20-29',
            '30-39': '30-39',
            '40-49': '40-49',
            '50-59': '50-59',
            '60-69': '60-69',
            '70-79': '70-79',
            '80+': '80+',
            Total: 'total',
            '0-19': '0-19',
            '20-59': '20-59',
            '60+': '60+',
            '100%': '100pct',
          }}
        />
      </div>

      <div className={styles.widget}>
        <RenderLineChart
          theme={theme}
          data={
            () => {
              const fields = [
                '0-4',
                '5-9',
                '10-14',
                '15-19',
                'total',
              ];
              let rsp = accumulatedWeekly(
                data.filter((x) => x.agesRow.general).map((x) => ({
                  updatedAt: x.updatedAt,
                  ...x.agesRow.general,
                })),
                fields,
              );
              const maximums = fields.reduce(
                (a, b) => {
                  a[b] = Math.max(...(rsp.slice(0, -26).map((x) => x[b]).filter((x) => !Number.isNaN(x))));
                  return a;
                }, {},
              );
              rsp = rsp.map((r) => {
                fields.map((f) => {
                  r[f] = Math.round(((r[f] / maximums[f])) * 100);
                  return null;
                });
                r['100pct'] = 100;
                return r;
              });
              return rsp;
            }
          }
          yAxisScale="linear"
          title="% Casos por edad vs primer peak (NNA)"
          xAxisType="linear"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          showYAxisSelector
          height={isMobile() ? 80 : 40}
          yAxisMin={0}
          xLabelsField="updatedAt"
          yDatasets={{
            '0-4': '0-4',
            '5-9': '5-9',
            '10-14': '10-14',
            '15-19': '15-19',
            Total: 'total',
            '100%': '100pct',
          }}
        />
      </div>

      <div className={styles.widget}>
        <RenderLineChart
          theme={theme}
          data={() => {
            const fields = [
              '0-9',
              '10-19',
              '20-29',
              '30-39',
              '40-49',
              '50-59',
              '60-69',
              '70-79',
              '80+',
            ];
            const rsp = accumulatedWeekly(
              data.filter((x) => x.agesRow.general).map((x) => ({
                updatedAt: x.updatedAt,
                ...x.agesRow.general,
              })),
              fields,
            );
            return rsp;
          }}
          yAxisScale="linear"
          title="Casos por edad"
          xAxisType="linear"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          showYAxisSelector
          height={isMobile() ? 80 : 50}
          yAxisMin={0}
          xLabelsField="updatedAt"
          yDatasets={{
            '0-9': '0-9',
            '10-19': '10-19',
            '20-29': '20-29',
            '30-39': '30-39',
            '40-49': '40-49',
            '50-59': '50-59',
            '60-69': '60-69',
            '70-79': '70-79',
            '80+': '80+',
          }}
        />
      </div>

      <div className={styles.widget}>
        <RenderLineChart
          theme={theme}
          data={data.filter((x) => x.agesRow.general).map((x) => ({
            updatedAt: x.updatedAt,
            ...x.agesRow.pct,
          }))}
          yAxisScale="linear"
          title="% Casos por edad"
          xAxisType="time"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          showYAxisSelector
          height={isMobile() ? 80 : 40}
          yAxisMin={0}
          xLabelsField="updatedAt"
          yDatasets={{
            '0-9': '0-9',
            '10-19': '10-19',
            '20-29': '20-29',
            '30-39': '30-39',
            '40-49': '40-49',
            '50-59': '50-59',
            '60-69': '60-69',
            '70-79': '70-79',
            '80+': '80+',
          }}
        />
      </div>

      <div className={styles.widget}>
        <RenderLineChart
          theme={theme}
          data={() => {
            const fields = [
              '0-39',
              '40-49',
              '50-59',
              '60-69',
              '70-79',
              '80-89',
              '90+',
              'total',
            ];
            const rsp = accumulatedWeekly(
              data.map((x) => ({
                updatedAt: x.updatedAt,
                ...x.deathsByAge,
              })),
              fields,
            ).reverse().slice(0, -1);
            return rsp;
          }}
          yAxisScale="linear"
          title="Fallecidos por edad"
          xAxisType="linear"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          showYAxisSelector
          height={isMobile() ? 80 : 40}
          yAxisMin={0}
          xLabelsField="updatedAt"
          yDatasets={{
            'Menos de 39': '0-39',
            '40-49': '40-49',
            '50-59': '50-59',
            '60-69': '60-69',
            '70-79': '70-79',
            '80-89': '80-89',
            'Mayor de 90': '90+',
            Total: 'total',
          }}
        />
        <small>* Se eliminaron semanas 2020-23 y 2020-29 por ajustes realizados en esas semanas</small>
      </div>

      <div className={styles.widget}>
        <RenderLineChart
          theme={theme}
          data={() => {
            const fields = [
              '0-39',
              '40-49',
              '50-59',
              '60-69',
              '70-79',
              '80-89',
              '90+',
              'total',
            ];
            let rsp = accumulatedWeekly(
              data.map((x) => ({
                updatedAt: x.updatedAt,
                ...x.deathsByAge,
              })),
              fields,
            ).reverse().slice(0, -1);

            const maximums = fields.reduce(
              (a, b) => {
                a[b] = Math.max(...(rsp.slice(0, -26).map((x) => x[b]).filter((x) => !Number.isNaN(x))));
                return a;
              }, {},
            );

            rsp = rsp.map((r) => {
              fields.map((f) => {
                r[f] = Math.round(((r[f] / maximums[f])) * 100);
                return null;
              });
              r['100pct'] = 100;
              return r;
            });

            return rsp;
          }}
          yAxisScale="linear"
          title="% Fallecidos por edad vs primer peak"
          xAxisType="linear"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          showYAxisSelector
          height={isMobile() ? 80 : 40}
          yAxisMin={0}
          xLabelsField="updatedAt"
          yDatasets={{
            'Menos de 39': '0-39',
            '40-49': '40-49',
            '50-59': '50-59',
            '60-69': '60-69',
            '70-79': '70-79',
            '80-89': '80-89',
            'Mayor de 90': '90+',
            Total: 'total',
            '100%': '100pct',
          }}
        />
        <small>* Se eliminaron semanas 2020-23 y 2020-29 por ajustes realizados en esas semanas</small>
      </div>

      <div className={styles.widget}>
        <RenderLineChart
          theme={theme}
          data={data.map((x) => ({
            updatedAt: x.updatedAt,
            ...x.hospitalizados,
          }))}
          yAxisScale="linear"
          title="Hospitalizados UCI por edad"
          xAxisType="time"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          showYAxisSelector
          height={isMobile() ? 80 : 30}
          yAxisMin={0}
          xLabelsField="updatedAt"
          yDatasets={{
            'Menos de 39': '0-39',
            '40-49': '40-49',
            '50-59': '50-59',
            '60-69': '60-69',
            'Mayor de 70': '70+',
            Total: 'total',
          }}
        />
        <br />
      </div>
      <div className={styles.widget}>
        <RenderLineChart
          theme={theme}
          data={data.map((x) => ({
            updatedAt: x.updatedAt,
            ...x.hospitalizados,
          }))}
          yAxisScale="linear"
          title="% Hospitalizados UCI por edad"
          xAxisType="time"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          showYAxisSelector
          height={isMobile() ? 80 : 30}
          yAxisMin={0}
          yAxisMax={100}
          xLabelsField="updatedAt"
          yDatasets={{
            '%Menos de 39': 'pct0-39',
            '40-49': 'pct40-49',
            '50-59': 'pct50-59',
            '60-69': 'pct60-69',
            'Mayor de 70': 'pct70+',
          }}
        />
        <br />
      </div>
      <div className={styles.grid4Cols1Col}>
        {Object.values(regionesData).sort((a, b) => (a.regionCode < b.regionCode ? -1 : 1)).map((r) => (
          <div className={styles.widget} key={r}>
            <RenderLineChart
              theme={theme}
              data={r.data}
              yAxisScale="linear"
              xAxisType="time"
              showYAxisSelector
              yAxisMin={0}
              title={`${r.region}<br/><small>Camas disponibles: ${(r.camas[r.camas.length - 1]).available}</small><br/><small>Incidencia Casos activos 100.000 hab</small>`}
              width={33}
              height={isMobile() ? 60 : 30}
              xAxisStepSize={isMobile() ? 14 : 1}
              xLabelsField="updatedAt"
              yDatasets={{
                'Incidencia 100.000 hab': 'prevalenceActiveCases',
              }}
            />
          </div>

        ))}
      </div>

      <div className={styles.widget}>
        <div className={styles.tools}>
          <div className="btn">
            <CSVLink data={csvData} filename={`${moment().utc().format()}-covid-data-chile.csv`}>
              <FontAwesomeIcon icon={faDownload} />
              Descargar
            </CSVLink>
          </div>
        </div>
        <div className={styles.title}>
          Datos
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>
                Fecha del reporte (cierre 21H día anterior)
              </th>
              <th>
                Día de semana
              </th>
              <th className="right">
                Nuevos Casos
              </th>
              <th className="right">
                Total de Casos
              </th>
              <th className="right">
                Test PCR
              </th>
              <th className="right">
                Prom Test PCR (ult 7 d)
              </th>
              <th className="right">
                % Positividad Test PCR
              </th>
              <th className="right">
                Prom % Positividad Test PCR (ult 7 d)
              </th>
              <th className="right">
                Total de Fallecidos nuevos
              </th>
              <th className="right">
                Total de Fallecidos acumulados
              </th>
              <th className="right">
                Prom fallecidos diarios por millón (ult 7 d)
              </th>
              <th className="center">
                Letalidad (%)
              </th>
            </tr>
          </thead>
          <tbody>
            {data.reverse().map((row) => (
              <tr
                key={row.updatedAt}
                style={{
                  background:
                    `rgb(${255 - 55 * (moment(row.updatedAt).add(4, 'hours').isoWeekday() / 7)}, ${255 - 55 * (moment(row.updatedAt).add(4, 'hours').isoWeekday() / 7)}, ${255 - 55 * (moment(row.updatedAt).add(4, 'hours').isoWeekday() / 7)})`,
                }}
              >
                <td>{moment(row.updatedAt).add(4, 'hours').format('YYYY-MM-DD')}</td>
                <td>{moment(row.updatedAt).add(4, 'hours').format('dddd')}</td>
                <td className="right">{numeral(row.newCases).format('0,000')}</td>
                <td className="right">{numeral(row.totalCases).format('0,000')}</td>
                <td className="right">{numeral(row.testsPCR).format('0,000')}</td>
                <td className="right">{numeral(row.avg7DtestsPCR).format('0,000')}</td>
                <td className="right">{numeral(row.positivity * 100).format('0.0')}</td>
                <td className="right">{numeral(row.avg7DPositivity * 100).format('0.0')}</td>
                <td className="right">{numeral(row.deaths || 0).format('0,000')}</td>
                <td className="right">{numeral(row.totalDeaths).format('0,000')}</td>
                <td className="right">{numeral(row.avg7DDeaths).format('0,000')}</td>
                <td className="center">{numeral((row.totalDeaths / row.totalCases) * 100).format('0.0')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

GeneralModule.defaultProps = {
  theme: 'light',
};

GeneralModule.propTypes = {
  data: PropTypes.array.isRequired,
  vaccinesData: PropTypes.array.isRequired,
  regionesData: PropTypes.object.isRequired,
  theme: PropTypes.string,
};

export default GeneralModule;
