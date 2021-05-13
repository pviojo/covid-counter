/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable max-len */
/* eslint-disable no-shadow */
import React, { useState, useEffect } from 'react';
import moment from 'moment';
import numeral from 'numeral';
// eslint-disable-next-line
import numerales from "numeral/locales/es";
import ReactLoading from 'react-loading';
import {
  BrowserRouter as Router,
  useHistory,
  useLocation,
} from 'react-router-dom';
import pjson from '../package.json';

import GeneralModule from './modules/GeneralModule';
import DeathsModule from './modules/DeathsModule';
import ByRegionModule from './modules/ByRegionModule';
import CompareComunasModule from './modules/CompareComunasModule';
import QuarantinesModule from './modules/QuarantinesModule';

import { getData } from './logic/data';
import './global.scss';
import styles from './index.module.scss';

const App = () => {
  const location = useLocation();
  const history = useHistory();
  const [currentLocation, setCurrentLocation] = useState('');

  useEffect(() => {
    setCurrentLocation(location.pathname);
    window.scrollTo(0, 0);
  }, [location]);

  numeral.locale('es');

  const [theme] = useState('light');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [comunasData, setComunasData] = useState(null);
  const [vaccinesData, setVaccinesData] = useState(null);
  const [regionesData, setRegionesData] = useState(null);
  const [newCasesRegionData, setNewCasesRegionData] = useState(null);
  useEffect(() => {
    const tsParam = (new URLSearchParams(window.location.search.slice(1))).get('ts');
    const initData = (covidData) => {
      const filteredCovidData = !tsParam
        ? covidData
        : covidData.filter((x) => {
          const tsFormated = moment(tsParam).format('YYYY-MM-DD H:mm:ss');
          return x.updatedAt < tsFormated;
        });

      setData(filteredCovidData);
    };

    const loadData = async () => {
      const {
        dailyData: loadedData,
        comunasData,
        regionesData,
        vaccinesData,
        newCasesRegionData,
      } = await getData();
      initData(loadedData);
      setComunasData(comunasData);
      setVaccinesData(vaccinesData);
      setRegionesData(regionesData);
      setNewCasesRegionData(newCasesRegionData);
      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className={`${styles.app} ${styles[`theme-${theme}`]}`}>
        <div className={styles.loading}>
          <ReactLoading
            type="spin"
            color="#96c"
          />
        </div>
      </div>
    );
  }
  if (!data) {
    return null;
  }

  const onChangeLocation = () => {
    setCurrentLocation(window.location.pathname);
  };
  console.log('currentLocation', currentLocation);
  return (
    <Router>
      <div className={`${styles.app} ${styles[`theme-${theme}`]}`}>
        <div className={`${styles.navbar}`}>
          <div className={`${styles.option} ${currentLocation === '/' ? styles.selected : ''}`}>
            <a onClick={() => history.push('/')}>Todo el país</a>
          </div>
          <div className={`${styles.option} ${currentLocation.startsWith('/por-region') ? styles.selected : ''}`}>
            <a onClick={() => history.push('/por-region')}>Por Región</a>
          </div>
          <div className={`${styles.option} ${currentLocation.startsWith('/comparar-comunas') ? styles.selected : ''}`}>
            <a onClick={() => history.push('/comparar-comunas')}>Comparar comunas</a>
          </div>
          <div className={`${styles.option} ${currentLocation.startsWith('/cuarentenas') ? styles.selected : ''}`}>
            <a onClick={() => history.push('/cuarentenas')}>Cuarentenas</a>
          </div>

        </div>
        <div className={`${styles.main}`}>
          {currentLocation === '/deaths'
          && (
            <DeathsModule />
          )}
          {currentLocation === '/'
            && (
            <GeneralModule
              data={data}
              vaccinesData={vaccinesData}
              regionesData={regionesData}
              theme={theme}
            />
            )}
          {currentLocation.startsWith('/por-region')
            && (
            <ByRegionModule
              comunasData={comunasData}
              regionesData={regionesData}
              newCasesRegionData={newCasesRegionData}
              theme={theme}
            />
            )}
          {currentLocation.startsWith('/comparar-comunas')
            && (
            <CompareComunasModule
              comunasData={comunasData}
              theme={theme}
            />
            )}
          {currentLocation.startsWith('/cuarentenas')
            && (
            <QuarantinesModule
              onChangeLocation={onChangeLocation}
              comunasData={comunasData}
              theme={theme}
            />
            )}
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
              <br />
              <a href="https://github.com/juancri/covid19-vaccination">COVID-19 Vaccination (JC Olivares)</a>
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
    </Router>
  );
};

App.propTypes = {

};
export default App;
