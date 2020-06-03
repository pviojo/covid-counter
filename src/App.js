import React, { useState, useEffect } from "react";
import moment from "moment";
import Counter from "./components/Counter";
import numeral from "numeral";
// eslint-disable-next-line
import numerales from "numeral/locales/es";

import pjson from '../package.json';
import styles from "./styles.module.css";

import {
  data
} from './data';

const lastUpdate = data[0][0]
const lastCount = data[0][1]
const prevCount = data[3][1]
const lastDeath = data[0][2]
const prevDeath = data[3][2]

const startTs = moment(lastUpdate)
  .add(4, "hours")
  .format("X");

const nowTs = moment().format("X");
const delta = (lastCount - prevCount) / (3 * 60 * 60 * 24);
const start = Math.floor(
  lastCount + Math.floor(delta * (moment().format("X") - startTs))
);
const deltaDeath = (lastDeath - prevDeath) / (3 * 60 * 60 * 24);
const startDeath = Math.floor(
  lastDeath + Math.floor(deltaDeath * (moment().format("X") - startTs))
);

numeral.locale("es");

const App = () => {
  const [now, setNow] = useState(moment());

  useEffect(() => {
    window.setInterval(() => {
      setNow(moment());
    }, 100);
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
