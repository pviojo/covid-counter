import React from "react";
import moment from "moment";
import Counter from "./components/Counter";
import numeral from "numeral";
import numerales from "numeral/locales/es";

import styles from "./styles.module.css";

const lastUpdate = "2020-05-31 21:00:00";
const lastCount = 105159;
const prevCount = 90638;

const startTs = moment(lastUpdate)
  .add(4, "hours")
  .format("X");

const delta = (lastCount - prevCount) / (3 * 60 * 60 * 24);
const start = Math.floor(
  lastCount + Math.floor(delta * (moment().format("X") - startTs))
);

console.log("startTs", start, startTs);
numeral.locale("es");
export default function App() {
  return (
    <div className="App">
      <div className={styles.counter}>
        <Counter
          startTs={moment().format("X")}
          start={start}
          delta={delta}
          onChange={n => {}}
        />
        <div className={styles.currentData}>
          <div>Último cómputo real: {numeral(lastCount).format(0, 0)}</div>
          <div>
            Última actualización: {moment(lastUpdate).format("DD/MM HH:mm")}
          </div>
          <div>
            <small>
              Fuente:{" "}
              <a href="https://www.gob.cl/coronavirus/cifrasoficiales/">
                Cifras Oficiales COVID-19, Gobierno de Chile
              </a>
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
