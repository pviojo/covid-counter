/* eslint-disable no-shadow */
/* eslint-disable object-curly-spacing */
/* eslint-disable quote-props */
/* eslint-disable quotes */
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import numeral from 'numeral';
// eslint-disable-next-line
import numerales from "numeral/locales/es";
import ReactLoading from 'react-loading';
import isMobile from 'is-mobile';
import { CSVLink } from 'react-csv';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';

import pjson from '../package.json';

import { RenderLineChart, RenderBarChart } from './components/Charts';

import { generatePolynomialRegression } from './logic/parameters';
import { getData } from './logic/data';

import './global.scss';
import styles from './index.module.scss';

const App = () => {
  numeral.locale('es');

  const addCases = 0;

  const [loading, setLoading] = useState(true);
  const [, setNow] = useState(moment());
  const [data, setData] = useState(null);
  const [, setProbableDeaths] = useState(null);
  const [comunasData, setComunasData] = useState(null);
  const [regionesData, setRegionesData] = useState(null);
  const [dataDeathsCovidByReportDay, setDataDeathsCovidByReportDay] = useState(null);
  const [modelCases, setModelCases] = useState(null);
  const [modelDeaths, setModelDeaths] = useState(null);
  const [modelLethality, setModelLethality] = useState(null);
  useEffect(() => {
    const tsParam = (new URLSearchParams(window.location.search.slice(1))).get('ts');
    if (tsParam) {
      setNow(moment(tsParam));
    } else {
      window.setInterval(() => {
        setNow(moment());
      }, 1000);
    }

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
        dataDeathsCovidByReportDay,
        probableDeaths,
      } = await getData();
      initData(loadedData);
      setProbableDeaths(probableDeaths);
      setComunasData(comunasData);
      setRegionesData(regionesData);
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
              positivity: x.positivity ? x.positivity * 100 : null,
              avg7DPositivity: x.positivity ? x.avg7DPositivity * 100 : null,
              accumulatedPositivity: x.accumulatedPositivity ? x.accumulatedPositivity * 100 : null,
              recommended: 10,
            }
          ))}
          colors={["#387", "#f60", "#39f", "#c03"]}
          yAxisScale="linear"
          title="% Positividad PCR (Nuevos casos / Test reportados)"
          xAxisType="time"
          xAxisStepSize={isMobile() ? 7 : 4}
          width={100}
          height={isMobile() ? 80 : 25}
          yAxisMin={0}
          xLabelsField="updatedAt"
          yDatasets={{
            '% Test PCR Positivos': 'positivity',
            '% Test PCR Positivos (Media Móvil 7D)': 'avg7DPositivity',
            '% Test PCR Positivos Acumulado': 'accumulatedPositivity',
            'Recomendado (10%)': 'recommended',
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
                  colors={["#387", "#f60"]}
                  yAxisScale="linear"
                  title="Fallecidos Totales y COVID-19 Chile"
                  xAxisType="time"
                  xAxisStepSize={isMobile() ? 7 : 4}
                  width={100}
                  height={isMobile() ? 80 : 60}
                  yAxisMin={0}
                  xLabelsField="updatedAt"
                  yDatasets={{
                    'COVID': 'avg7DayDeathsCovid',
                    'Total': 'avg7DayAllDeaths',
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
                  colors={["#387", "#f60"]}
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
                  colors={["#c30", "#f60", "#fc0", "#093", "#06c", "#a3c"]}
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
                  colors={["#387"]}
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
                  colors={["#387"]}
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
                  colors={["#387"]}
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
                    'Letalidad': 'lethality',
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
                  colors={["#09c", "#387"]}
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
                  colors={["#09c", "#387"]}
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
                  colors={["#09c", "#387"]}
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

      <div className={styles.widget}>
        <RenderLineChart
          data={regionesData['13'].data}
          colors={["#09c", "#387"]}
          yAxisScale="linear"
          xAxisType="time"
          showYAxisSelector
          yAxisMin={0}
          title="Casos activos - RM"
          width={100}
          height={isMobile() ? 60 : 30}
          xAxisStepSize={isMobile() ? 7 : 1}
          xLabelsField="updatedAt"
          yDatasets={{
            'Casos activos': 'activeCases',
          }}
        />
      </div>
      <div className={styles.grid3Cols1Col}>
        {Object.keys(comunasData).map((c) => (
          comunasData[c].regionCode === '13'
            && (
              <div className={styles.widget} key={c}>
                <RenderLineChart
                  data={comunasData[c].data}
                  colors={["#09c", "#387"]}
                  yAxisScale="log"
                  xAxisType="time"
                  showYAxisSelector
                  yAxisMin={0}
                  title={`Casos activos - ${comunasData[c].label}`}
                  width={33}
                  height={isMobile() ? 60 : 25}
                  xAxisStepSize={isMobile() ? 7 : 1}
                  xLabelsField="updatedAt"
                  yDatasets={{
                    'Casos': 'activeCases',
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
            {data.map((row) => (
              <tr key={row.updatedAt}>
                <td>{moment(row.updatedAt).add(4, 'hours').format('YYYY-MM-DD')}</td>
                <td className="right">{row.newCases}</td>
                <td className="right">{row.totalCases}</td>
                <td className="right">{row.newDeathsCovid || 0}</td>
                <td className="right">{row.totalDeathsCovid}</td>
                <td className="right">{numeral(row.avg7DayDeathsCovid ? row.avg7DayDeathsCovid / 18 : null).format('0,0.00')}</td>
                <td className="center">{row.lethality && Math.round(row.lethality * 100 * 100, 2) / 100}</td>
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
