import React, { useState, useEffect } from 'react';
import moment from 'moment';
import numeral from 'numeral';
import axios from 'axios';
import ReactLoading from 'react-loading';

// eslint-disable-next-line
import numerales from "numeral/locales/es";
import Counter from './components/Counter';

import pjson from '../package.json';
import styles from './styles.module.css';

const App = () => {
  numeral.locale('es');
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(moment());
  const [data, setData] = useState(null);
  const [nowTs, setNowTs] = useState(0);
  const [startCases, setStartCases] = useState(0);
  const [startDeath, setStartDeath] = useState(0);
  const [deltaDeath, setDeltaDeath] = useState(0);
  const [deltaCases, setDeltaCases] = useState(0);


  useEffect(() => {
    window.setInterval(() => {
      setNow(moment());
    }, 100);

    const initData = (covidData) => {
      const localLastUpdate = covidData[0].updatedAt;
      const localLastCases = covidData[0].totalCases;
      const localLastDeath = covidData[0].totalDeaths;
      const localPrevDeath = covidData[3].totalDeaths;

      const startTs = moment(localLastUpdate)
        .add(4, 'hours')
        .format('X');

      const localNowTs = moment().format('X');
      const localDeltaCases = (
        (covidData[0].totalCases - covidData[1].totalCases) * 0.5
        + (covidData[1].totalCases - covidData[2].totalCases) * 0.3
        + (covidData[2].totalCases - covidData[3].totalCases) * 0.2
      ) / (60 * 60 * 24);
      const localStartCases = Math.floor(
        localLastCases + Math.floor(localDeltaCases * (moment().format('X') - startTs)),
      );
      const localDeltaDeath = (localLastDeath - localPrevDeath) / (3 * 60 * 60 * 24);
      const localStartDeath = Math.floor(
        localLastDeath + Math.floor(localDeltaDeath * (moment().format('X') - startTs)),
      );

      setNowTs(localNowTs);
      setStartCases(localStartCases);
      setStartDeath(localStartDeath);
      setDeltaDeath(localDeltaDeath);
      setDeltaCases(localDeltaCases);
    };
    const loadData = async () => {
      const { data: loadedData } = await axios.get('https://raw.githubusercontent.com/pviojo/covid-counter/master/data/resume_by_day.json');
      setData(loadedData);
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
            startTs={nowTs}
            start={startCases}
            delta={deltaCases}
            subtitle="Casos totales estimados en Chile"
          />
          <Counter
            startTs={nowTs}
            start={startDeath}
            delta={deltaDeath}
            subtitle="Fallecidos estimados en Chile"
          />
        </div>
      </div>


      <div className={styles.currentData}>
        <div>* Estimaciones en base a datos de últ 3 días</div>
        <div>
          Último cómputo oficial:
          {numeral(data[0].totalCases).format(0, 0)}
          {' '}
          {numeral(data[0].totalDeaths).format(0, 0)}
          {' '}
          fallecidos
        </div>
        <div>
          Última actualización oficianpm sl:
          {' '}
          {moment(data[0].lastUpdate).format('DD/MM HH:mm')}
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
