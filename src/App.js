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
  const [simulateTs, setSimultaeTs] = useState(null);


  useEffect(() => {
    window.setInterval(() => {
      setNow(moment());
    }, 100);

    const initData = (covidData) => {
      const localLastUpdate = covidData[0].updatedAt;
      const localLastCases = covidData[0].totalCases;
      const localLastDeath = covidData[0].totalDeaths;

      const startTs = moment(localLastUpdate)
        .add(4, 'hours')
        .format('X');


      const localNowTs = moment().add(4, 'hours').format('X');
      setSimultaeTs(localNowTs);

      const localDeltaCases = (
        (covidData[0].totalCases - covidData[1].totalCases) * 0.4
        + (covidData[1].totalCases - covidData[2].totalCases) * 0.2
        + (covidData[2].totalCases - covidData[3].totalCases) * 0.2
        + (covidData[3].totalCases - covidData[4].totalCases) * 0.1
        + (covidData[4].totalCases - covidData[5].totalCases) * 0.1
      ) / (60 * 60 * 24);

      const localDeltaDeaths = (
        (covidData[0].totalDeaths - covidData[1].totalDeaths) * 0.4
        + (covidData[1].totalDeaths - covidData[2].totalDeaths) * 0.2
        + (covidData[2].totalDeaths - covidData[3].totalDeaths) * 0.2
        + (covidData[3].totalDeaths - covidData[4].totalDeaths) * 0.1
        + (covidData[4].totalDeaths - covidData[5].totalDeaths) * 0.1
      ) / (60 * 60 * 24);

      const localStartCases = Math.floor(
        localLastCases + Math.floor(localDeltaCases * (localNowTs - startTs)),
      );
      const localStartDeath = Math.floor(
        localLastDeath + Math.floor(localDeltaDeaths * (localNowTs - startTs)),
      );

      setNowTs(localNowTs);
      setStartCases(localStartCases);
      setStartDeath(localStartDeath);
      setDeltaDeath(localDeltaDeaths);
      setDeltaCases(localDeltaCases);
    };
    const loadData = async () => {
      let { data: loadedData } = await axios.get('https://raw.githubusercontent.com/pviojo/covid-counter/master/data/resume_by_day.json');
      loadedData = [
        {"updatedAt": "2020-06-05 21:00:00", "totalCases": 127745, "totalDeaths": 1541},
        {"updatedAt": "2020-06-04 21:00:00", "totalCases": 122499, "totalDeaths": 1448},
        {"updatedAt": "2020-06-03 21:00:00", "totalCases": 118292, "totalDeaths": 1356},
        {"updatedAt": "2020-06-02 21:00:00", "totalCases": 113628, "totalDeaths": 1275},
        {"updatedAt": "2020-06-01 21:00:00", "totalCases": 108686, "totalDeaths": 1188},
        {"updatedAt": "2020-05-31 21:00:00", "totalCases": 105159, "totalDeaths": 1113},
        {"updatedAt": "2020-05-30 21:00:00", "totalCases": 99688, "totalDeaths": 1054},
        {"updatedAt": "2020-05-30 21:00:00", "totalCases": 99688, "totalDeaths": 1054},
        {"updatedAt": "2020-05-29 21:00:00", "totalCases": 94858, "totalDeaths": 997},
        {"updatedAt": "2020-05-28 21:00:00", "totalCases": 90638, "totalDeaths": 944},
        {"updatedAt": "2020-05-27 21:00:00", "totalCases": 86943, "totalDeaths": 890},
        {"updatedAt": "2020-05-26 21:00:00", "totalCases": 82289, "totalDeaths": 841},
        {"updatedAt": "2020-05-25 21:00:00", "totalCases": 77961, "totalDeaths": 806},
        {"updatedAt": "2020-05-24 21:00:00", "totalCases": 73997, "totalDeaths": 761},
        {"updatedAt": "2020-05-23 21:00:00", "totalCases": 69102, "totalDeaths": 718},
        {"updatedAt": "2020-05-22 21:00:00", "totalCases": 65393, "totalDeaths": 673},
        {"updatedAt": "2020-05-21 21:00:00", "totalCases": 61857, "totalDeaths": 630},
        {"updatedAt": "2020-05-20 21:00:00", "totalCases": 57581, "totalDeaths": 589},
        {"updatedAt": "2020-05-19 21:00:00", "totalCases": 53617, "totalDeaths": 544},
        {"updatedAt": "2020-05-18 21:00:00", "totalCases": 49579, "totalDeaths": 509},
        {"updatedAt": "2020-05-17 21:00:00", "totalCases": 46059, "totalDeaths": 478},
        {"updatedAt": "2020-05-16 21:00:00", "totalCases": 43781, "totalDeaths": 450},
        {"updatedAt": "2020-05-15 21:00:00", "totalCases": 41428, "totalDeaths": 421},
        {"updatedAt": "2020-05-14 21:00:00", "totalCases": 39542, "totalDeaths": 394},
        {"updatedAt": "2020-05-13 21:00:00", "totalCases": 37040, "totalDeaths": 368},
        {"updatedAt": "2020-05-12 21:00:00", "totalCases": 34381, "totalDeaths": 346},
        {"updatedAt": "2020-05-11 21:00:00", "totalCases": 31721, "totalDeaths": 335},
        {"updatedAt": "2020-05-10 21:00:00", "totalCases": 30063, "totalDeaths": 323},
        {"updatedAt": "2020-05-09 21:00:00", "totalCases": 28866, "totalDeaths": 312},
        {"updatedAt": "2020-05-08 21:00:00", "totalCases": 27219, "totalDeaths": 304},
        {"updatedAt": "2020-05-07 21:00:00", "totalCases": 25972, "totalDeaths": 294},
        {"updatedAt": "2020-05-06 21:00:00", "totalCases": 24581, "totalDeaths": 285},
        {"updatedAt": "2020-05-05 21:00:00", "totalCases": 23048, "totalDeaths": 281},
        {"updatedAt": "2020-05-04 21:00:00", "totalCases": 22016, "totalDeaths": 275},
        {"updatedAt": "2020-05-03 21:00:00", "totalCases": 20643, "totalDeaths": 270},
        {"updatedAt": "2020-05-02 21:00:00", "totalCases": 19663, "totalDeaths": 260},
        {"updatedAt": "2020-05-01 21:00:00", "totalCases": 18435, "totalDeaths": 247},
        {"updatedAt": "2020-04-30 21:00:00", "totalCases": 17008, "totalDeaths": 234},
        {"updatedAt": "2020-04-29 21:00:00", "totalCases": 16023, "totalDeaths": 227},
        {"updatedAt": "2020-04-28 21:00:00", "totalCases": 15135, "totalDeaths": 216},
        {"updatedAt": "2020-04-27 21:00:00", "totalCases": 14365, "totalDeaths": 207},
        {"updatedAt": "2020-04-26 21:00:00", "totalCases": 13813, "totalDeaths": 198},
        {"updatedAt": "2020-04-25 21:00:00", "totalCases": 13331, "totalDeaths": 189},
        {"updatedAt": "2020-04-24 21:00:00", "totalCases": 12858, "totalDeaths": 181},
        {"updatedAt": "2020-04-23 21:00:00", "totalCases": 12306, "totalDeaths": 174},
        {"updatedAt": "2020-04-22 21:00:00", "totalCases": 11812, "totalDeaths": 168},
        {"updatedAt": "2020-04-21 21:00:00", "totalCases": 11296, "totalDeaths": 160},
        {"updatedAt": "2020-04-20 21:00:00", "totalCases": 10832, "totalDeaths": 147},
        {"updatedAt": "2020-04-19 21:00:00", "totalCases": 10507, "totalDeaths": 139},
        {"updatedAt": "2020-04-18 21:00:00", "totalCases": 10088, "totalDeaths": 133},
        {"updatedAt": "2020-04-17 21:00:00", "totalCases": 9730, "totalDeaths": 126},
        {"updatedAt": "2020-04-16 21:00:00", "totalCases": 9252, "totalDeaths": 116},
        {"updatedAt": "2020-04-15 21:00:00", "totalCases": 8807, "totalDeaths": 105},
        {"updatedAt": "2020-04-14 21:00:00", "totalCases": 8273, "totalDeaths": 94},
        {"updatedAt": "2020-04-13 21:00:00", "totalCases": 7917, "totalDeaths": 92},
        {"updatedAt": "2020-04-12 21:00:00", "totalCases": 7525, "totalDeaths": 82},
        {"updatedAt": "2020-04-11 21:00:00", "totalCases": 7213, "totalDeaths": 80},
        {"updatedAt": "2020-04-10 21:00:00", "totalCases": 6927, "totalDeaths": 73},
        {"updatedAt": "2020-04-09 21:00:00", "totalCases": 6501, "totalDeaths": 65},
        {"updatedAt": "2020-04-08 21:00:00", "totalCases": 5972, "totalDeaths": 57},
        {"updatedAt": "2020-04-07 21:00:00", "totalCases": 5546, "totalDeaths": 0},
        {"updatedAt": "2020-04-06 21:00:00", "totalCases": 5116, "totalDeaths": 0},
        {"updatedAt": "2020-04-05 21:00:00", "totalCases": 4815, "totalDeaths": 0},
        {"updatedAt": "2020-04-04 21:00:00", "totalCases": 4471, "totalDeaths": 0},
        {"updatedAt": "2020-04-03 21:00:00", "totalCases": 4161, "totalDeaths": 0},
        {"updatedAt": "2020-04-02 21:00:00", "totalCases": 3737, "totalDeaths": 0},
        {"updatedAt": "2020-04-01 21:00:00", "totalCases": 3404, "totalDeaths": 0},
        {"updatedAt": "2020-03-31 21:00:00", "totalCases": 3031, "totalDeaths": 0},
        {"updatedAt": "2020-03-30 21:00:00", "totalCases": 2738, "totalDeaths": 0},
        {"updatedAt": "2020-03-29 21:00:00", "totalCases": 2449, "totalDeaths": 0},
        {"updatedAt": "2020-03-28 21:00:00", "totalCases": 2139, "totalDeaths": 0},
        {"updatedAt": "2020-03-27 21:00:00", "totalCases": 1909, "totalDeaths": 0},
        {"updatedAt": "2020-03-26 21:00:00", "totalCases": 1610, "totalDeaths": 0},
        {"updatedAt": "2020-03-25 21:00:00", "totalCases": 1306, "totalDeaths": 0},
        {"updatedAt": "2020-03-24 21:00:00", "totalCases": 1142, "totalDeaths": 0},
        {"updatedAt": "2020-03-23 21:00:00", "totalCases": 922, "totalDeaths": 0},
        {"updatedAt": "2020-03-22 21:00:00", "totalCases": 746, "totalDeaths": 0},
        {"updatedAt": "2020-03-21 21:00:00", "totalCases": 632, "totalDeaths": 0},
        {"updatedAt": "2020-03-20 21:00:00", "totalCases": 537, "totalDeaths": 0},
        {"updatedAt": "2020-03-19 21:00:00", "totalCases": 434, "totalDeaths": 0},
        {"updatedAt": "2020-03-18 21:00:00", "totalCases": 342, "totalDeaths": 0},
        {"updatedAt": "2020-03-17 21:00:00", "totalCases": 238, "totalDeaths": 0},
        {"updatedAt": "2020-03-16 21:00:00", "totalCases": 156, "totalDeaths": 0},
        {"updatedAt": "2020-03-15 21:00:00", "totalCases": 75, "totalDeaths": 0},
        {"updatedAt": "2020-03-14 21:00:00", "totalCases": 61, "totalDeaths": 0},
        {"updatedAt": "2020-03-13 21:00:00", "totalCases": 43, "totalDeaths": 0},
        {"updatedAt": "2020-03-12 21:00:00", "totalCases": 33, "totalDeaths": 0},
        {"updatedAt": "2020-03-11 21:00:00", "totalCases": 23, "totalDeaths": 0},
        {"updatedAt": "2020-03-10 21:00:00", "totalCases": 17, "totalDeaths": 0},
        {"updatedAt": "2020-03-09 21:00:00", "totalCases": 12, "totalDeaths": 0},
        {"updatedAt": "2020-03-08 21:00:00", "totalCases": 9, "totalDeaths": 0},
        {"updatedAt": "2020-03-07 21:00:00", "totalCases": 7, "totalDeaths": 0},
      ];

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
            simulateTs={simulateTs}
            start={startCases}
            delta={deltaCases}
            subtitle="Casos totales estimados en Chile"
          />
          <Counter
            startTs={nowTs}
            simulateTs={simulateTs}
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
          Última actualización oficial:
          {' '}
          {moment(data[0].updatedAt).format('DD/MM HH:mm')}
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
