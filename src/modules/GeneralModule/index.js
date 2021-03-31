/* eslint-disable no-param-reassign */
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
  const {
    ventiladoresAvailable, pctVentiladoresAvailable,
  } = data[data.length - 1];

  const newCasesToday = data[data.length - 1].newCases;
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
  return (
    <div className={`${styles.cnt} ${styles[`theme-${theme}`]}`}>
      <div className={styles.grid6Cols1Col}>
        <div className={styles.widget}>
          <Metric
            color={deltaNewCases7D > 0 ? '#c30' : '#777'}
            n={`${numeral(newCasesToday).format('0,000')}`}
            subn={`${numeral(deltaNewCases7D).format('+0.0')}% vs semana anterior (${numeral(newCases7DBefore).format('0,000')})`}
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
            data={data.slice(-14).map((x, i) => ({
              ...x,
              newCasesPrevWeek: data.slice(-28, -14)[i].newCases,
            }))}
            xcolors={chartColorsTheme[theme]}
            yAxisScale="linear"
            title="Comparación Casos nuevos ultimos 14 días (vs anteriores 14)"
            xAxisType="time"
            xAxisStepSize={1}
            width={100}
            showYAxisSelector
            height={isMobile() ? 80 : 50}
            yAxisMin={0}
            xLabelsField="updatedAt"
            yDatasets={{
              'Casos nuevos ult 14 días': 'newCases',
              'Casos nuevos anteriores 14 días': 'newCasesPrevWeek',
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
                data.slice(-28),
                14,
                'newCases',
              ).map((x) => ({
                ...x,
                newCases: Math.min(Math.max(x.newCases, -1), 1),
              }));
              const avg = (
                (originalData.slice(-14).reduce((a, b) => a + b.newCases, 0))
                / (originalData.slice(-28, -14).reduce((a, b) => a + b.newCases, 0))
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
            title="Variación Casos nuevos últimos 14 días (vs anteriores 14 días)"
            width={100}
            height={isMobile() ? 80 : 50}
            xAxisStepSize={isMobile() ? 7 : 1}
            xLabelsField="updatedAt"
            yDatasets={{
              'Var %': 'newCases',
              Promedio: 'avg',
            }}
          />
          <small>* Limitado en rango +/- 100%</small>
        </div>
      </div>
      <div className={styles.grid2Cols1Col}>
        <div className={styles.widget}>
          <RenderLineChart
            theme={theme}
            data={data.slice(-14).map((x, i) => ({
              ...x,
              deathsPrevWeek: data.slice(-28, -14)[i].deaths,
            }))}
            yAxisScale="linear"
            title="Comparación Fallecidos ultimos 14 días (vs anteriores 14)"
            xAxisType="time"
            xAxisStepSize={1}
            width={100}
            showYAxisSelector
            height={isMobile() ? 80 : 50}
            yAxisMin={0}
            xLabelsField="updatedAt"
            yDatasets={{
              'Casos nuevos ult 14 días': 'deaths',
              'Casos nuevos anteriores 14 días': 'deathsPrevWeek',
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
                data.slice(-28),
                14,
                'deaths',
              ).map((x) => ({
                ...x,
                deathsReal: x.deaths,
                deaths: Math.min(Math.max(x.deaths, -1), 1),
              }));
              const avg = (
                (originalData.slice(-14).reduce((a, b) => a + b.deaths, 0))
                / (originalData.slice(-28, -14).reduce((a, b) => a + b.deaths, 0))
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
            title="Variación Fallecidos últimos 14 días (vs anteriores 14 días)"
            width={100}
            height={isMobile() ? 80 : 50}
            xAxisStepSize={isMobile() ? 7 : 1}
            xLabelsField="updatedAt"
            yDatasets={{
              'Var %': 'deaths',
              Promedio: 'avg',
            }}
          />
          <small>* Limitado en rango +/- 100%</small>
        </div>
      </div>
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
            'Promedio Casos nuevos (ult 21D)': 'avg21DNewCases',
            'Promedio Casos nuevos (ult 28D)': 'avg28DNewCases',
            'Promedio Casos nuevos (ult 35D)': 'avg35DNewCases',
            'Promedio Casos nuevos (ult 42D)': 'avg42DNewCases',
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
          height={isMobile() ? 60 : 25}
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
          data={data}
          xcolors={chartColorsTheme[theme]}
          yAxisScale="linear"
          title="Casos totales"
          xAxisType="time"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          showYAxisSelector
          height={isMobile() ? 80 : 25}
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
          height={isMobile() ? 80 : 25}
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
          height={isMobile() ? 60 : 25}
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
            'Test PCR (Media Móvil 14D)': 'avg14DtestsPCR',
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
          height={isMobile() ? 60 : 25}
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
          data={data}
          xcolors={chartColorsTheme[theme]}
          yAxisScale="linear"
          title="Fallecidos totales"
          xAxisType="time"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          showYAxisSelector
          height={isMobile() ? 80 : 25}
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
          data={vaccinesData}
          yAxisScale="linear"
          title="Vacunados total"
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
            Total: 'total',
          }}
        />
        <br />
      </div>
      <div className={styles.widget}>
        <RenderLineChart
          theme={theme}
          data={vaccinesData}
          yAxisScale="linear"
          title="Vacunados diarios"
          xAxisType="time"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          showYAxisSelector
          height={isMobile() ? 80 : 25}
          yAxisMin={0}
          xLabelsField="date"
          yDatasets={{
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
          height={isMobile() ? 80 : 25}
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
          height={isMobile() ? 80 : 25}
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
          height={isMobile() ? 80 : 25}
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
          height={isMobile() ? 80 : 25}
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
          height={isMobile() ? 80 : 25}
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
        <RenderBarChart
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
          stack
          showYAxisSelector
          height={isMobile() ? 80 : 25}
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
      <div className={styles.widget}>
        <RenderBarChart
          theme={theme}
          data={data.filter((x) => x.agesRow.general).map((x) => ({
            updatedAt: x.updatedAt,
            ...x.agesRow.general,
          }))}
          yAxisScale="linear"
          title="Casos por edad"
          xAxisType="time"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          stack
          showYAxisSelector
          height={isMobile() ? 80 : 60}
          yAxisMin={0}
          xLabelsField="updatedAt"
          yDatasets={{
            '0-4': '0-4',
            '5-9': '5-9',
            '10-14': '10-14',
            '15-19': '15-19',
            '20-24': '20-24',
            '25-29': '25-29',
            '30-34': '30-34',
            '35-39': '35-39',
            '40-44': '40-44',
            '45-49': '45-49',
            '50-54': '50-54',
            '55-59': '55-59',
            '60-64': '60-64',
            '65-69': '65-69',
            '70-74': '70-74',
            '75-79': '75-79',
            '80+': '80+',
          }}
        />
      </div>
      <div className={styles.widget}>
        <RenderBarChart
          theme={theme}
          data={data.filter((x) => x.agesRow.general).map((x) => ({
            updatedAt: x.updatedAt,
            ...x.agesRow.pct,
          }))}
          yAxisScale="linear"
          title=" % Casos por edad"
          xAxisType="time"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          stack
          showYAxisSelector
          height={isMobile() ? 80 : 60}
          yAxisMin={0}
          yAxisMax={100}
          xLabelsField="updatedAt"
          yDatasets={{
            '0-4': '0-4',
            '5-9': '5-9',
            '10-14': '10-14',
            '15-19': '15-19',
            '20-24': '20-24',
            '25-29': '25-29',
            '30-34': '30-34',
            '35-39': '35-39',
            '40-44': '40-44',
            '45-49': '45-49',
            '50-54': '50-54',
            '55-59': '55-59',
            '60-64': '60-64',
            '65-69': '65-69',
            '70-74': '70-74',
            '75-79': '75-79',
            '80+': '80+',
          }}
        />
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
              title={`${r.region}<br/><small>Casos activos</small>`}
              width={33}
              height={isMobile() ? 25 : 25}
              xAxisStepSize={isMobile() ? 14 : 1}
              xLabelsField="updatedAt"
              yDatasets={{
                'Incidencia 100.000 hab': 'activeCases',
              }}
            />
          </div>

        ))}
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
