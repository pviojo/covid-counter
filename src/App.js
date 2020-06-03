import React, { useState, useEffect } from "react";
import moment from "moment";
import Counter from "./components/Counter";
import numeral from "numeral";
import axios from 'axios';
// eslint-disable-next-line
import numerales from "numeral/locales/es";

import pjson from '../package.json';
import styles from "./styles.module.css";

const App = () => {

  numeral.locale("es");

  const [now, setNow] = useState(moment());
  
  const [nowTs, setNowTs] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(0);
  const [lastCount, setLastCount] = useState(0);
  const [lastDeath, setLastDeath] = useState(0);
  const [start, setStart] = useState(0);
  const [startDeath, setStartDeath] = useState(0);
  const [deltaDeath, setDeltaDeath] = useState(0);
  const [delta, setDelta] = useState(0);


  useEffect(() => {
    window.setInterval(() => {
      setNow(moment());
    }, 100);

    const initData = (data) => {

      const _lastUpdate = data[0].updatedAt;
      const _lastCount = data[0].totalCases;
      const _prevCount = data[3].totalCases;
      const _lastDeath = data[0].totalDeaths;
      const _prevDeath = data[3].totalDeaths;
      
      const startTs = moment(_lastUpdate)
        .add(4, "hours")
        .format("X");
      
      const _nowTs = moment().format("X");
      const _delta = (_lastCount - _prevCount) / (3 * 60 * 60 * 24);
      const start = Math.floor(
        _lastCount + Math.floor(_delta * (moment().format("X") - startTs))
      );
      const _deltaDeath = (_lastDeath - _prevDeath) / (3 * 60 * 60 * 24);
      const startDeath = Math.floor(
        _lastDeath + Math.floor(_deltaDeath * (moment().format("X") - startTs))
      );

      setNowTs(_nowTs);
      setLastUpdate(_lastUpdate);
      setLastCount(_lastCount);
      setLastDeath(_lastDeath);
      setStart(start);
      setStartDeath(startDeath);
      setDeltaDeath(_deltaDeath)
      setDelta(_delta)
    } 
    const loadData = async () => {
      const { data } = await axios.get('https://raw.githubusercontent.com/pviojo/covid-counter/master/data/resume_by_day.json')
      initData(data)
    }
    
    loadData()
  }, [])

  return (
    <div className="App">
      <div>
        <div className={styles.counters}>
          <Counter
            startTs={nowTs}
            start={start}
            delta={delta}
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
      <div className={styles.calculatedAt}>
        Calculado: {now.format("DD/MM HH:mm:ss")}
      </div>
      <div className={styles.currentData}>
        <div>* Estimaciones en base a datos de últ 3 días</div>
        <div>Último cómputo oficial: {numeral(lastCount).format(0, 0)} ({numeral(lastDeath).format(0, 0)} fallecidos)</div>
        <div>
          Última actualización oficial: {moment(lastUpdate).format("DD/MM HH:mm")}
        </div>
        <div>
          <small>
            Fuente:{" "}
            <a href="https://www.gob.cl/coronavirus/cifrasoficiales/">
              Cifras Oficiales COVID-19, Gobierno de Chile
            </a>
          </small>
        </div>
        <br/>
        <div>
          <small>Código: <a href="https://github.com/pviojo/covid-counter">https://github.com/pviojo/covid-counter</a></small>
          <br/>
          <small><small>v: {pjson.version}</small></small>
          </div>
      </div>
    </div>
  );
}

export default App;
