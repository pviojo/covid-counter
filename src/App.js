/* eslint-disable object-curly-spacing */
/* eslint-disable quote-props */
/* eslint-disable quotes */
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import numeral from 'numeral';
import axios from 'axios';
import ReactLoading from 'react-loading';

// eslint-disable-next-line
import numerales from "numeral/locales/es";
import Counter from './components/Counter';

import { generatePolynomialRegression } from './logic/parameters';

import pjson from '../package.json';
import styles from './styles.module.css';

const App = () => {
  numeral.locale('es');
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(moment());
  const [data, setData] = useState(null);
  const [modelCases, setModelCases] = useState(null);
  const [modelDeaths, setModelDeaths] = useState(null);

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

      const pointsTotalCases = filteredCovidData.slice(0, 3).map((item) => (
        {
          x: moment(item.updatedAt).format('X'),
          y: item.totalCases,
        }
      ));

      const pointsTotalDeaths = filteredCovidData.slice(0, 3).map((item) => (
        {
          x: moment(item.updatedAt).format('X'),
          y: item.totalDeaths,
        }
      ));

      const localModelCases = generatePolynomialRegression(
        pointsTotalCases, pointsTotalCases.length,
      );
      const localModelDeaths = generatePolynomialRegression(
        pointsTotalDeaths, pointsTotalDeaths.length,
      );
      setModelCases(localModelCases);
      setModelDeaths(localModelDeaths);
    };

    const loadData = async () => {
      const { data: loadedData } = await axios.get('https://covid.tiopaul.io/data/resume_by_day.json');
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

  return (
    <div className="App">
      <div>
        <div className={styles.calculatedAt}>
          Situación en Chile. Estimada en tiempo real.
          <br />
          <small>
            Actualizado:
            {now.format('DD/MM HH:mm:ss')}
          </small>
        </div>
        <div className={styles.counters}>
          <Counter
            model={modelCases}
            now={now}
            subtitle="Casos totales estimados en Chile"
          />
          <Counter
            model={modelDeaths}
            now={now}
            subtitle="Fallecidos estimados en Chile"
          />
        </div>
      </div>


      <div className={styles.currentData}>
        <div>* Estimaciones en base a datos de últ 3 días</div>
        <div className={styles.officialInfo}>
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
        <div className={`${styles.officialInfo} ${styles.estimation}`}>
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
          </big>
        </div>
        <div>
          <small>
            Fuente:
            {' '}
            <a href="https://www.gob.cl/coronavirus/cifrasoficiales/">
              Cifras Oficiales COVID-19, Gobierno de Chile
            </a>
          </small>
        </div>
        <br />
        <div>
          <small>
            Código:
            <a href="https://github.com/pviojo/covid-counter">https://github.com/pviojo/covid-counter</a>
          </small>
          <br />
          <small>
            <small>
              v:
              {pjson.version}
            </small>
          </small>
        </div>
      </div>
    </div>
  );
};

export default App;
