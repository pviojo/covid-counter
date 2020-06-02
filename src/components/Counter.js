import React, { useState, useEffect } from "react";
import moment from "moment";
import numeral from "numeral";

import styles from "./index.module.css";

const Counter = ({ startTs, start, delta, onChange }) => {
  const [n, setN] = useState(start);
  const [now, setNow] = useState(start);
  useEffect(() => {
    onChange && onChange(n);
  }, [n, onChange]);

  window.setInterval(() => {
    const nowTs = Date.now() / 1000;
    const cases = Math.floor(start + delta * (nowTs - startTs));
    setNow(moment().format("DD/MM HH:mm:ss"));
    if (cases !== n && cases > n) {
      setN(cases);
    }
  }, 100);

  return (
    <div className={styles.cnt}>
      <div className={styles.counter}>{numeral(n).format("0,0")}</div>
      <div className={styles.subtitle}>
        Casos totales estimados en Chile<br/>{now}
        <br /><br />
        <small>* Estimación en base a cantidad de casos últ 3 días</small>
      </div>
    </div>
  );
};

export default Counter;
