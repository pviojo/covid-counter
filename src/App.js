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
import { faVolumeMute, faVolumeUp, faDownload } from '@fortawesome/free-solid-svg-icons';
import {
  FacebookShareButton,
  FacebookIcon,
  TwitterShareButton,
  TwitterIcon,
  WhatsappShareButton,
  WhatsappIcon,
  TelegramShareButton,
  TelegramIcon,
} from 'react-share';

import pjson from '../package.json';

import Counter from './components/Counter';
import { RenderLineChart } from './components/Charts';

import { generatePolynomialRegression } from './logic/parameters';
import { getData } from './logic/data';

import './global.scss';
import styles from './index.module.scss';

const App = () => {
  numeral.locale('es');
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(moment());
  const [data, setData] = useState(null);
  const [modelCases, setModelCases] = useState(null);
  const [modelDeaths, setModelDeaths] = useState(null);
  const [modelLethality, setModelLethality] = useState(null);
  const [sound, setSound] = useState(new URLSearchParams(window.location.search.slice(1)).get('sound'));
  useEffect(() => {
    const tsParam = (new URLSearchParams(window.location.search.slice(1))).get('ts');
    if (tsParam) {
      setNow(moment(tsParam));
    } else {
      window.setInterval(() => {
        setNow(moment());
      }, 100);
    }

    const initData = (covidData) => {
      const filteredCovidData = !tsParam
        ? covidData
        : covidData.filter((x) => {
          const tsFormated = moment(tsParam).format('YYYY-MM-DD H:mm:ss');
          return x.updatedAt < tsFormated;
        });

      setData(filteredCovidData);

      const pointsTotalCases = filteredCovidData.slice(2, 12).map((item) => (
        {
          x: moment(item.updatedAt).format('X'),
          y: item.totalCases,
        }
      ));

      const pointsTotalDeaths = filteredCovidData.slice(7, 23).map((item) => (
        {
          x: moment(item.updatedAt).format('X'),
          y: item.totalDeaths,
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
      const loadedData = await getData();
      initData(loadedData);
      setLoading(false);
    };

    loadData();
  }, []);
  if (loading) {
    return (
      <div className={styles.loading}>
        <ReactLoading
          type="spin"
          color="#69c"
        />
      </div>
    );
  }
  if (!data) {
    return null;
  }

  const tsLastOfficialInfo = moment(data[0].updatedAt).add(1, 'day').format('X');
  const estimationLastOfficialInfoCases = Math.floor(
    modelCases.predictY(modelCases.getTerms(), tsLastOfficialInfo),
  );
  const estimationLastOfficialInfoDeaths = Math.floor(
    modelDeaths.predictY(modelDeaths.getTerms(), tsLastOfficialInfo),
  );

  const simulatedTotalCases = data.slice(0, 6).map((x) => ({
    updatedAt: x.updatedAt,
    estimatedTotalCases: Math.floor(modelCases.predictY(modelCases.getTerms(), moment(x.updatedAt).format('X'))),
    realTotalCases: Math.floor(x.totalCases),
  }));

  const simulatedTotalDeaths = data.slice(0, 24).map((x) => ({
    updatedAt: x.updatedAt,
    estimatedTotalDeaths: Math.floor(modelDeaths.predictY(modelDeaths.getTerms(), moment(x.updatedAt).format('X'))),
    realTotalDeaths: Math.floor(x.totalDeaths),
  }));

  const simulatedLethality = data.slice(0, 24).map((x) => ({
    updatedAt: x.updatedAt,
    estimatedLethality: modelLethality.predictY(modelLethality.getTerms(), moment(x.updatedAt).format('X')),
    realLethality: x.lethality,
  }));

  const secondsBetweenCases = Math.round((60 * 60) / (
    modelDeaths.predictY(modelCases.getTerms(), moment().format('X'))
    - modelDeaths.predictY(modelCases.getTerms(), moment().subtract(1, 'hour').format('X'))
  ));

  const minutesBetweenDeaths = Math.round((24 * 60) / (
    modelDeaths.predictY(modelDeaths.getTerms(), moment().format('X'))
    - modelDeaths.predictY(modelDeaths.getTerms(), moment().subtract(1, 'day').format('X'))
  ));

  const message = `🔴 ¡AHORA! 🦠 Cada ${secondsBetweenCases} segundos una persona se contagia y cada ${minutesBetweenDeaths} minutos una persona muere por #COVID en #Chile. #QuedateEnCasa`;
  const fbMessage = `¡AHORA! Cada ${secondsBetweenCases} segundos una persona se contagia y cada ${minutesBetweenDeaths} minutos una persona muere por #COVID en #Chile. #QuedateEnCasa`;
  const url = 'https://covid.tiopaul.io';

  const csvData = data.map((row) => ([
    moment(row.updatedAt).add(4, 'hours').format('YYYY-MM-DD'),
    parseInt(row.newCases, 10),
    parseInt(row.totalCases, 10),
    parseInt(row.newDeaths, 10),
    parseInt(row.totalDeaths, 10),
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

  return (
    <div className="App">
      <div className={`${styles.topCounter} ${styles.estimation} ${styles.widget}`}>
        <div className={styles.counters}>
          <Counter
            model={modelCases}
            now={now}
            onChange={(n) => {
              if (sound && n) {
                const snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
                snd.volume = 0.1;
                snd.play();
              }
            }}
            subtitle="Casos totales estimados en Chile"
          />
          <Counter
            model={modelDeaths}
            now={now}
            subtitle="Fallecidos estimados en Chile"
          />
        </div>
        <div className={styles.calculatedAt}>
          <div className={styles.sound}>
            { sound
              ? <FontAwesomeIcon icon={faVolumeUp} size="3x" onClick={() => setSound(false)} />
              : <FontAwesomeIcon icon={faVolumeMute} size="3x" onClick={() => setSound(true)} />}
          </div>
          Situación en Chile. Estimada en tiempo real.
          {' '}
          Actualizado:
          {' '}
          {now.format('DD/MM HH:mm:ss')}
          <div><small>* Estimaciones en base a datos de últ 3 días</small></div>
        </div>
      </div>
      <div className={`${styles.widget}`}>
        {message}
        <div className={styles.share}>
          <div className={styles.btn}>
            <TwitterShareButton url={url} title={message}>
              <div style={{width: 30}}><TwitterIcon width={30} height={30} round /></div>
            </TwitterShareButton>
          </div>
          <div className={styles.btn}>
            <FacebookShareButton url={url} quote={fbMessage}>
              <div style={{width: 30}}><FacebookIcon width={30} height={30} round /></div>
            </FacebookShareButton>
          </div>

          <div className={styles.btn}>
            <WhatsappShareButton url={url} title={fbMessage} separator=":: ">
              <div style={{width: 30}}><WhatsappIcon width={30} height={30} round /></div>
            </WhatsappShareButton>
          </div>

          <div className={styles.btn}>
            <TelegramShareButton url={url} title={fbMessage}>
              <div style={{width: 30}}><TelegramIcon width={30} height={30} round /></div>
            </TelegramShareButton>
          </div>
        </div>
      </div>
      <div className={styles.grid2Cols1Col}>
        <div className={`${styles.officialInfo} ${styles.widget}  ${styles.widgetSp}`}>
          Última actualización oficial:
          {' '}
          {moment(data[0].updatedAt).format('DD/MM HH:mm')}
          <br />
          <big>
            Casos:
            {' '}
            {numeral(data[0].totalCases).format(0, 0)}
            <br />
            Fallecidos:
            {' '}
            {numeral(data[0].totalDeaths).format(0, 0)}
          </big>
        </div>
        <div className={`${styles.officialInfo} ${styles.estimation} ${styles.widget}  ${styles.widgetSp}`}>
          Estimación próxima actualización oficial (
          {moment(data[0].updatedAt).add(1, 'day').format('DD/MM HH:mm')}
          )
          <br />
          <big>
            Casos:
            {' '}
            {numeral(estimationLastOfficialInfoCases).format(0, 0)}
            {' (+'}
            {numeral(estimationLastOfficialInfoCases - data[0].totalCases).format(0, 0)}
            )
            <br />
            Fallecidos:
            {' '}
            {numeral(estimationLastOfficialInfoDeaths).format(0, 0)}
            {' (+'}
            {numeral(estimationLastOfficialInfoDeaths - data[0].totalDeaths).format(0, 0)}
            )
            <div>
              <small style={{fontSize: 10}}>
                * El número de fallecidos se está reportando con varios días de retraso.
                {' '}
                <strong>Estimado 5 días</strong>
              </small>
            </div>
          </big>
        </div>
      </div>
      <div className={`${styles.charts} ${styles.grid3Cols1Col}`}>
        <div className={styles.widget}>
          <RenderLineChart
            data={data.slice(0, 100)}
            colors={["#387"]}
            yAxisScale="linear"
            xAxisType="time"
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
        </div>
        <div className={styles.widget}>
          <RenderLineChart
            data={data.slice(0, 100).map((x) => (
              {
                ...x,
                totalDeaths: x.totalDeaths,
              }
            ))}
            colors={["#387"]}
            yAxisScale="linear"
            title="Total de Fallecidos COVID-19 Chile"
            xAxisType="time"
            xAxisStepSize={isMobile() ? 7 : 4}
            width={100}
            height={isMobile() ? 80 : 60}
            yAxisMin={0}
            xLabelsField="updatedAt"
            yDatasets={{
              'Total Fallecidos': 'totalDeaths',
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
                totalDeaths: x.totalDeaths,
              }
            ))}
            colors={["#387"]}
            yAxisScale="linear"
            title="Letalidad COVID-19 Chile (%)"
            xAxisType="time"
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
            data={simulatedTotalCases}
            colors={["#09c", "#387"]}
            yAxisScale="linear"
            xAxisType="time"
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
            data={simulatedTotalDeaths}
            colors={["#09c", "#387"]}
            yAxisScale="linear"
            xAxisType="time"
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
                <td className="right">{row.newDeaths}</td>
                <td className="right">{row.totalDeaths}</td>
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
