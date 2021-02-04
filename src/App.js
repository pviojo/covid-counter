/* eslint-disable max-len */
/* eslint-disable no-shadow */
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import numeral from 'numeral';
// eslint-disable-next-line
import numerales from "numeral/locales/es";
import Select from 'react-select';
import ReactLoading from 'react-loading';
import isMobile from 'is-mobile';
import { CSVLink } from 'react-csv';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

import pjson from '../package.json';

import { RenderLineChart, RenderBarChart } from './components/Charts';

import { generatePolynomialRegression } from './logic/parameters';
import { getData } from './logic/data';
import { maxWeekly, delta } from './helpers/data';

import './global.scss';
import styles from './index.module.scss';

const App = () => {
  numeral.locale('es');

  const addCases = 0;

  const [selectedRegion, setSelectedRegion] = useState('13');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [, setProbableDeaths] = useState(null);
  const [comunasData, setComunasData] = useState(null);
  const [vaccinesData, setVaccinesData] = useState(null);
  const [regionesData, setRegionesData] = useState(null);
  const [newCasesRegionData, setNewCasesRegionData] = useState(null);
  const [dataDeathsCovidByReportDay, setDataDeathsCovidByReportDay] = useState(null);
  const [modelCases, setModelCases] = useState(null);
  const [modelDeaths, setModelDeaths] = useState(null);
  const [modelLethality, setModelLethality] = useState(null);
  useEffect(() => {
    const tsParam = (new URLSearchParams(window.location.search.slice(1))).get('ts');
    const initData = (covidData) => {
      const filteredCovidData = !tsParam
        ? covidData
        : covidData.filter((x) => {
          const tsFormated = moment(tsParam).format('YYYY-MM-DD H:mm:ss');
          return x.updatedAt < tsFormated;
        });

      setData(filteredCovidData);

      const pointsTotalCases = filteredCovidData.slice(0, 12).map((item) => (
        {
          x: moment(item.updatedAt).format('X'),
          y: item.totalCases,
        }
      ));

      const pointsTotalDeaths = filteredCovidData.slice(7, 23).map((item) => (
        {
          x: moment(item.updatedAt).format('X'),
          y: item.totalDeathsCovid,
        }
      ));

      const pointsLethality = filteredCovidData.slice(7, 23).map((item) => (
        {
          x: moment(item.updatedAt).format('X'),
          y: item.lethality,
        }
      ));

      const localModelCases = generatePolynomialRegression(
        pointsTotalCases, pointsTotalCases.length,
      );
      const localModelDeaths = generatePolynomialRegression(
        pointsTotalDeaths, pointsTotalDeaths.length,
      );
      const localModelLethality = generatePolynomialRegression(
        pointsLethality, pointsLethality.length,
      );

      setModelCases(localModelCases);
      setModelDeaths(localModelDeaths);
      setModelLethality(localModelLethality);
    };

    const loadData = async () => {
      const {
        dailyData: loadedData,
        comunasData,
        regionesData,
        vaccinesData,
        newCasesRegionData,
        dataDeathsCovidByReportDay,
        probableDeaths,
      } = await getData();
      initData(loadedData);
      setProbableDeaths(probableDeaths);
      setComunasData(comunasData);
      setVaccinesData(vaccinesData);
      setRegionesData(regionesData);
      setNewCasesRegionData(newCasesRegionData);
      setDataDeathsCovidByReportDay(dataDeathsCovidByReportDay);
      setLoading(false);
    };

    loadData();
  }, []);
  if (loading) {
    return (
      <div className={styles.loading}>
        <ReactLoading
          type="spin"
          color="#96c"
        />
      </div>
    );
  }
  if (!data) {
    return null;
  }

  const simulatedTotalCases = data.slice(0, 15).map((x) => ({
    updatedAt: x.updatedAt,
    estimatedTotalCases: Math.floor(modelCases.predictY(modelCases.getTerms(), moment(x.updatedAt).format('X'))),
    realTotalCases: Math.floor(x.totalCases),
  }));

  const simulatedTotalDeaths = data.slice(0, 15).map((x) => ({
    updatedAt: x.updatedAt,
    estimatedTotalDeaths: Math.floor(modelDeaths.predictY(modelDeaths.getTerms(), moment(x.updatedAt).format('X'))),
    realTotalDeaths: Math.floor(x.totalDeathsCovid),
  }));

  const simulatedLethality = data.slice(0, 24).map((x) => ({
    updatedAt: x.updatedAt,
    estimatedLethality: modelLethality.predictY(modelLethality.getTerms(), moment(x.updatedAt).format('X')),
    realLethality: x.lethality,
  }));

  const csvData = data.map((row) => ([
    moment(row.updatedAt).add(4, 'hours').format('YYYY-MM-DD'),
    parseInt(row.newCases, 10),
    parseInt(row.totalCases, 10),
    parseInt(row.newDeathsCovid || 0, 10),
    parseInt(row.totalDeathsCovid, 10),
    parseFloat(row.lethality),
  ])).reverse();
  csvData.unshift([
    'fecha',
    'nuevos_casos',
    'total_casos',
    'nuevos_fallecidos',
    'total_fallecidos',
    'letalidad',
  ]);

  const dataDeathsCovidByReportDayKeys = [];
  if (dataDeathsCovidByReportDay && dataDeathsCovidByReportDay[0]) {
    Object.keys(dataDeathsCovidByReportDay[0]).map((k) => {
      if (k.startsWith('new_reported_')) {
        dataDeathsCovidByReportDayKeys[k.replace('new_reported_', '')] = k;
      }
      return null;
    });
  }
  return (
    <div className="App">
      <div className={styles.widget}>
        <RenderLineChart
          data={data.map((x) => (
            {
              ...x,
              last7DNewCases: x.avg7DNewCases * 7,
              last14DNewCases: x.avg14DNewCases * 14,
            }
          ))}
          colors={['#387', '#f60', '#39f', '#c03']}
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
            'Casos nuevos (ult 7D)': 'last7DNewCases',
            'Casos nuevos (ult 14D)': 'last14DNewCases',
          }}
        />
        <br />
      </div>
      <div className={styles.widget}>
        <RenderBarChart
          data={
            delta(
              data,
              7,
              'newCases',
            ).slice(30)
          }
          colors={['#09c', '#387']}
          yAxisScale="log"
          yAxisType="percentage"
          xAxisType="time"
          showYAxisSelector
          title="Variación Casos nuevos (7 días)"
          width={100}
          height={isMobile() ? 60 : 25}
          xAxisStepSize={isMobile() ? 7 : 1}
          xLabelsField="updatedAt"
          yDatasets={{
            'Var Casos activos (7 días)': 'newCases',
          }}
        />
      </div>
      <div className={styles.widget}>
        <RenderBarChart
          data={data.map((x) => (
            {
              ...x,
              percentAvg7DNewCasesWithSymptoms: parseInt((x.avg7DNewCasesWithSymptoms / (x.avg7DNewCasesWithSymptoms + x.avg7DNewCasesWithoutSymptoms)) * 100, 10),
              percentAvg7DNewCasesWithoutSymptoms: parseInt((x.avg7DNewCasesWithoutSymptoms / (x.avg7DNewCasesWithSymptoms + x.avg7DNewCasesWithoutSymptoms)) * 100, 10),
            }
          ))}
          colors={['#09c', '#999']}
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
          data={data.map((x) => (
            {
              ...x,
              positivity: x.positivity ? x.positivity * 100 : null,
              avg7DPositivity: x.positivity ? x.avg7DPositivity * 100 : null,
              avg14DPositivity: x.positivity ? x.avg14DPositivity * 100 : null,
              recommended: 5,
            }
          ))}
          colors={['#387', '#f60', '#39f', '#c03']}
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
          data={vaccinesData}
          colors={['#387', '#f60', '#39f', '#c03']}
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
          data={data.map((x) => (
            {
              ...x,
              last7DNewCases: x.avg7DNewCases * 7,
              last14DNewCases: x.avg14DNewCases * 14,
            }
          ))}
          colors={['#387']}
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
          data={data.map((x) => (
            {
              ...x,
              positivity: x.positivity ? x.positivity * 100 : null,
              avg7DPositivity: x.positivity ? x.avg7DPositivity * 100 : null,
              avg14DPositivity: x.positivity ? x.avg14DPositivity * 100 : null,
              recommended: 5,
            }
          ))}
          colors={['#387', '#f60', '#39f', '#c03']}
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
            'Test PCR (Media Móvil 7D)': 'avg7DtestsPCR',
          }}
        />
        <br />
      </div>
      {false
        && (
          <>
            <div className={`${styles.charts} ${styles.grid3Cols1Col}`}>
              <div className={styles.widget}>
                <RenderLineChart
                  data={data.slice(7)}
                  colors={['#387', '#f60']}
                  yAxisScale="linear"
                  title="Fallecidos Totales y COVID-19 Chile"
                  xAxisType="time"
                  xAxisStepSize={isMobile() ? 7 : 4}
                  width={100}
                  height={isMobile() ? 80 : 60}
                  yAxisMin={0}
                  xLabelsField="updatedAt"
                  yDatasets={{
                    COVID: 'avg7DayDeathsCovid',
                    Total: 'avg7DayAllDeaths',
                  }}
                />
                * Media movil 7 días
                <br />
                (últ 14 días datos provisorios, no se muestran últ 7 días por datos incompletos)
              </div>
              <div className={styles.widget}>
                <RenderLineChart
                  data={data.slice(7).map((x) => (
                    {
                      ...x,
                      pctDeathsCovid: x.avg7DayAllDeaths
                        ? ((x.avg7DayDeathsCovid || 0) / x.avg7DayAllDeaths) * 100
                        : 0,
                    }
                  ))}
                  colors={['#387', '#f60']}
                  yAxisScale="linear"
                  title="% Fallecidos COVID sobre Total de Fallecidos Chile"
                  xAxisType="time"
                  xAxisStepSize={isMobile() ? 7 : 4}
                  width={100}
                  height={isMobile() ? 80 : 60}
                  yAxisMin={0}
                  xLabelsField="updatedAt"
                  yDatasets={{
                    '% Fallecidos COVID': 'pctDeathsCovid',
                  }}
                />
                * Media movil 7 días
                <br />
                (últ 14 días datos provisorios, no se muestran últ 7 días por datos incompletos)
              </div>
              <div className={styles.widget}>
                <RenderBarChart
                  data={dataDeathsCovidByReportDay.slice(-14)}
                  colors={['#c30', '#f60', '#fc0', '#093', '#06c', '#a3c']}
                  yAxisScale="linear"
                  title="Fallecidos Últimos 14 días por día de reporte"
                  xAxisType="time"
                  xAxisStepSize={isMobile() ? 7 : 4}
                  width={100}
                  stack
                  height={isMobile() ? 80 : 60}
                  yAxisMin={0}
                  xLabelsField="updatedAt"
                  yDatasets={dataDeathsCovidByReportDayKeys}
                />
                * Haz click sobre cada fecha de reporte para agregarla o quitarla del gráfico.
              </div>
            </div>
            <div className={`${styles.charts} ${styles.grid3Cols1Col}`}>
              <div className={styles.widget}>
                <RenderLineChart
                  data={data.slice(0, 100)}
                  colors={['#387']}
                  yAxisScale="linear"
                  xAxisType="time"
                  showYAxisSelector
                  title="Total de Casos COVID-19 Chile"
                  width={100}
                  height={isMobile() ? 80 : 60}
                  yAxisMin={0}
                  xAxisStepSize={isMobile() ? 7 : 4}
                  xLabelsField="updatedAt"
                  yDatasets={{
                    'Total Casos': 'totalCases',
                  }}
                />
                *
                {' '}
                {addCases}
                {' '}
                casos fueron agregados el 15 de junio. No se muestran en gráfico
                {' ' }
                para evitar distorsión.
              </div>
              <div className={styles.widget}>
                <RenderLineChart
                  data={data.slice(0, 100).map((x) => (
                    {
                      ...x,
                      updatedAt: moment(x.updatedAt).add(3, 'hours').format(),
                      totalDeaths: x.totalDeathsCovid,
                    }
                  ))}
                  colors={['#387']}
                  yAxisScale="linear"
                  title="Total de Fallecidos COVID-19 Chile"
                  xAxisType="time"
                  showYAxisSelector
                  xAxisStepSize={isMobile() ? 7 : 4}
                  width={100}
                  height={isMobile() ? 80 : 60}
                  yAxisMin={0}
                  xLabelsField="updatedAt"
                  yDatasets={{
                    'Total Fallecidos': 'totalDeathsCovid',
                  }}
                />
                * Fallecidos usa info del Registro Civil disponible en
                {' '}
                <a target="_blank" rel="noreferrer" href="https://github.com/MinCiencia/Datos-COVID19/blob/master/output/producto37/Defunciones.csv">Min Ciencias</a>
              </div>
              <div className={styles.widget}>
                <RenderLineChart
                  data={data.slice(0, 100).map((x) => (
                    {
                      ...x,
                      updatedAt: moment(x.updatedAt).add(3, 'hours').format(),
                    }
                  ))}
                  colors={['#387']}
                  yAxisScale="linear"
                  title="Letalidad COVID-19 Chile (%)"
                  xAxisType="time"
                  showYAxisSelector
                  yAxisType="percentage"
                  xAxisStepSize={isMobile() ? 7 : 4}
                  width={100}
                  height={isMobile() ? 80 : 60}
                  yAxisMin={0}
                  xLabelsField="updatedAt"
                  yDatasets={{
                    Letalidad: 'lethality',
                  }}
                />
                * Fallecidos usa info del Registro Civil disponible en
                {' '}
                <a target="_blank" rel="noreferrer" href="https://github.com/MinCiencia/Datos-COVID19/blob/master/output/producto37/Defunciones.csv">Min Ciencias</a>
              </div>
            </div>

            <div className={`${styles.charts} ${styles.grid3Cols1Col}`}>
              <div className={styles.widget}>
                <RenderLineChart
                  data={simulatedTotalCases.map((x) => (
                    {
                      ...x,
                      updatedAt: moment(x.updatedAt).add(3, 'hours').format(),
                    }
                  ))}
                  colors={['#09c', '#387']}
                  yAxisScale="linear"
                  xAxisType="time"
                  showYAxisSelector
                  title="Comparación modelo estimación - reales. Casos"
                  width={100}
                  height={isMobile() ? 60 : 60}
                  xAxisStepSize={isMobile() ? 7 : 1}
                  xLabelsField="updatedAt"
                  yDatasets={{
                    'Total Casos Estimados': 'estimatedTotalCases',
                    'Total Casos Reales': 'realTotalCases',
                  }}
                />
              </div>
              <div className={styles.widget}>
                <RenderLineChart
                  data={simulatedTotalDeaths.map((x) => (
                    {
                      ...x,
                      updatedAt: moment(x.updatedAt).add(3, 'hours').format(),
                    }
                  ))}
                  colors={['#09c', '#387']}
                  yAxisScale="linear"
                  xAxisType="time"
                  showYAxisSelector
                  title="Comparación modelo estimación - reales. Fallecidos"
                  width={100}
                  height={isMobile() ? 60 : 60}
                  xAxisStepSize={isMobile() ? 7 : 1}
                  xLabelsField="updatedAt"
                  yDatasets={{
                    'Total Fallecidos Estimados': 'estimatedTotalDeaths',
                    'Total Fallecidos Reales': 'realTotalDeaths',
                  }}
                />
              </div>
              <div className={styles.widget}>
                <RenderLineChart
                  data={simulatedLethality}
                  colors={['#09c', '#387']}
                  yAxisScale="linear"
                  xAxisType="time"
                  showYAxisSelector
                  yAxisMin={0}
                  title="Comparación modelo estimación - reales. Letalidad"
                  width={100}
                  height={isMobile() ? 60 : 60}
                  xAxisStepSize={isMobile() ? 7 : 1}
                  xLabelsField="updatedAt"
                  yDatasets={{
                    'Letalidad Estimada': 'estimatedLethality',
                    'Letalidad Real': 'realLethality',
                  }}
                />
              </div>
            </div>
          </>
        )}
      <div className={styles.select}>
        <div className={styles.label}>
          Elige una región para ver detalles
        </div>
        <Select
          className="select"
          classNamePrefix="select"
          isSearchable
          name="color"
          defaultValue={{
            value: regionesData[selectedRegion].regionCode,
            label: regionesData[selectedRegion].region,
          }}
          onChange={(e) => setSelectedRegion(e.value)}
          options={
            Object.values(regionesData).sort(
              (a, b) => ((a.region > b.region) ? 1 : -1),
            ).map((r) => ({
              value: r.regionCode,
              label: r.region,
            }))
          }
        />
      </div>
      <div className={styles.widget}>
        <RenderLineChart
          data={regionesData[selectedRegion].data}
          colors={['#09c']}
          yAxisScale="linear"
          xAxisType="linear"
          showYAxisSelector
          yAxisMin={0}
          title={`Casos activos - ${regionesData[selectedRegion].region}`}
          width={100}
          height={isMobile() ? 60 : 25}
          xAxisStepSize={isMobile() ? 7 : 1}
          xLabelsField="updatedAt"
          yDatasets={{
            'Casos activos': 'activeCases',
          }}
        />
      </div>
      <div className={styles.widget}>
        <RenderBarChart
          data={
            delta(
              maxWeekly(regionesData[selectedRegion].data, 'activeCases'),
              2,
              'activeCases',
            )
          }
          colors={['#09c', '#387']}
          yAxisScale="linear"
          yAxisType="percentage"
          xAxisType="linear"
          title={`Variación Casos activos - ${regionesData[selectedRegion].region} (2 semanas)`}
          width={100}
          height={isMobile() ? 60 : 25}
          xAxisStepSize={isMobile() ? 7 : 1}
          xLabelsField="updatedAt"
          yDatasets={{
            'Var Casos activos (2 sem)': 'activeCases',
          }}
        />
      </div>
      <div className={styles.widget}>
        <RenderBarChart
          data={newCasesRegionData[selectedRegion].data}
          colors={['#09c', '#999']}
          yAxisScale="linear"
          xAxisType="linear"
          showYAxisSelector
          yAxisMin={0}
          title={`Casos nuevos - ${regionesData[selectedRegion].region}`}
          width={100}
          stack
          height={isMobile() ? 60 : 25}
          xAxisStepSize={isMobile() ? 7 : 1}
          xLabelsField="updatedAt"
          yDatasets={{
            'Con síntomas': 'newCaseWithSymptoms',
            'Sin síntomas': 'newCaseWithoutSymptoms',
          }}
        />
      </div>
      <div className={styles.widget}>
        <RenderBarChart
          data={newCasesRegionData[selectedRegion].data}
          colors={['#09c', '#999']}
          yAxisScale="linear"
          xAxisType="linear"
          showYAxisSelector
          yAxisMin={0}
          stack
          title={`Casos nuevos (% del total)- ${regionesData[selectedRegion].region}`}
          width={100}
          height={isMobile() ? 60 : 25}
          xAxisStepSize={isMobile() ? 7 : 1}
          xLabelsField="updatedAt"
          yDatasets={{
            'Con síntomas': 'percentNewCaseWithSymptoms',
            'Sin síntomas': 'percentNewCaseWithoutSymptoms',
          }}
        />
      </div>

      <div className={styles.grid3Cols1Col}>
        {Object.keys(comunasData).map((c) => (
          comunasData[c].regionCode === selectedRegion
            && (
              <div className={styles.widget} key={c}>
                <RenderLineChart
                  data={comunasData[c].data}
                  colors={['#09c', '#387']}
                  yAxisScale="linear"
                  xAxisType="time"
                  showYAxisSelector
                  yAxisMin={0}
                  title={`${comunasData[c].label}<br/><small>Prevalencia Casos activos</small><br/><small>(pob: ${numeral(comunasData[c].population).format('0,0')} hab)</small>`}
                  width={33}
                  height={isMobile() ? 25 : 25}
                  xAxisStepSize={isMobile() ? 14 : 1}
                  xLabelsField="updatedAt"
                  yDatasets={{
                    'Prevalencia 100.000 hab': 'prevalenceActiveCases',
                  }}
                />
              </div>
            )
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
              <th className="right">
                Nuevos Casos
              </th>
              <th className="right">
                Total de Casos
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.updatedAt}>
                <td>{moment(row.updatedAt).add(4, 'hours').format('YYYY-MM-DD')}</td>
                <td className="right">{row.newCases}</td>
                <td className="right">{row.totalCases}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.sources}>
        <div>
          <small>
            Fuente:
            {' '}
            <a href="https://www.gob.cl/coronavirus/cifrasoficiales/">
              Cifras Oficiales COVID-19, Gobierno de Chile
            </a>
            {', '}
            <a href="https://github.com/MinCiencia/Datos-COVID19">Min Ciencias</a>
          </small>
        </div>
        <div>
          <small>
            Código:
            {' '}
            <a href="https://github.com/pviojo/covid-counter">https://github.com/pviojo/covid-counter</a>
          </small>
        </div>
        <div>
          <small>
            Imagen:
            {' '}
            <a href="https://pixabay.com/es/illustrations/covid-corona-coronavirus-virus-4948866/">Miroslava Chrienova (Pixabay License)</a>
          </small>
        </div>
        <div>
          <small>
            v:
            {' '}
            {pjson.version}
          </small>
        </div>
      </div>
    </div>
  );
};

export default App;
