/* eslint-disable no-shadow */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';
// eslint-disable-next-line
import numerales from "numeral/locales/es";
import isMobile from 'is-mobile';
import Select from 'react-select';
// eslint-disable-next-line no-unused-vars
import {
  useHistory,
  useLocation,
} from 'react-router-dom';

import { RenderLineChart } from '../../components/Charts';

import {
  // eslint-disable-next-line no-unused-vars
  faseData,
} from '../../helpers/utils';

import '../../global.scss';
import styles from './index.module.scss';

const CompareComunasModule = ({
  comunasData,
  theme,
}) => {
  const history = useHistory();
  const location = useLocation();
  const [selectedComunas, setSelectedComunas] = useState([]);
  const changeComunas = (e) => {
    setSelectedComunas(e);
    history.replace(`/comparar-comunas/${(e || []).map((x) => x.value)}`);
  };

  useEffect(() => {
    if (location) {
      let ids = location.pathname.replace('/comparar-comunas/', '');
      if (ids) {
        ids = ids.split(',');
        const selected = [];
        ids.map((id) => {
          const c = Object.values(comunasData).find((x) => x.comunaCode === id.trim());
          if (c) {
            selected.push({
              label: c.label,
              value: c.comunaCode,
            });
          }
          return null;
        });
        setSelectedComunas(selected);
      }
    }
  }, [location]);

  let data = null;
  let dataLast10 = null;
  const yDatasets = [];
  if (selectedComunas && selectedComunas.length > 0) {
    data = comunasData[selectedComunas[0].label].data;

    selectedComunas.map((c, i) => {
      const k = `prevalenceActiveCases${i + 1}`;
      data = data.map((x) => ({
        ...x,
        [k]: (comunasData[c.label].data.find(
          (y) => y.updatedAt === x.updatedAt,
        ) || {}).prevalenceActiveCases,
      }));
      dataLast10 = data.slice(-10);
      yDatasets[`Incidencia ${c.label} (pob: ${numeral(comunasData[c.label].population).format('0,0')} hab)`] = k;
      return null;
    });
  }

  return (
    <div className={`${styles.cnt} ${styles[`theme-${theme}`]}`}>

      <div className={styles.main}>
        <div className={styles.select}>
          <div className={styles.label}>
            Elige comunas para compararlas
          </div>
          <Select
            className="select"
            classNamePrefix="select"
            isSearchable
            isMulti
            value={selectedComunas}
            onChange={changeComunas}
            options={
            Object.values(comunasData).sort(
              (a, b) => ((a.region > b.region) ? 1 : -1),
            ).map((r) => ({
              value: r.comunaCode,
              label: r.label,
            }))
          }
          />
        </div>
        {selectedComunas && selectedComunas.length > 0
        && (
          <>
            <div className={styles.widget} key="comp">
              <RenderLineChart
                theme={theme}
                data={data}
                yAxisScale="linear"
                xAxisType="time"
                showYAxisSelector
                yAxisMin={0}
                title="Comparación Incidencia Casos activos cada 100.000 hab"
                width={100}
                height={isMobile() ? 75 : 50}
                xAxisStepSize={isMobile() ? 14 : 1}
                xLabelsField="updatedAt"
                yDatasets={yDatasets}
              />
            </div>
            <div className={styles.widget} key="comp">
              <RenderLineChart
                theme={theme}
                data={dataLast10}
                yAxisScale="linear"
                xAxisType="time"
                showYAxisSelector
                yAxisMin={0}
                title="Comparación Incidencia Casos activos cada 100.000 hab (últimos 10 reportes)"
                width={100}
                height={isMobile() ? 75 : 50}
                xAxisStepSize={isMobile() ? 14 : 1}
                xLabelsField="updatedAt"
                yDatasets={yDatasets}
              />
            </div>

          </>
        )}
      </div>
    </div>
  );
};

CompareComunasModule.defaultProps = {
  theme: 'light',
};

CompareComunasModule.propTypes = {
  comunasData: PropTypes.object.isRequired,
  theme: PropTypes.string,
};

export default CompareComunasModule;
