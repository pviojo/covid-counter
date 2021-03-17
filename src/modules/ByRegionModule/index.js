/* eslint-disable max-len */
/* eslint-disable no-shadow */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';
import styled from 'styled-components';
// eslint-disable-next-line
import numerales from "numeral/locales/es";

import Select from 'react-select';
import isMobile from 'is-mobile';

import { VectorMap } from '@south-paw/react-vector-maps';
import { maxWeekly, delta, mergeByUpdatedAt } from '../../helpers/data';

import { RenderLineChart, RenderBarChart } from '../../components/Charts';
import ComunasByStep from '../../components/ComunasByStep';

import chileMap from '../../data/chile.json';
import {
  faseData,
} from '../../helpers/utils';

import '../../global.scss';
import styles from './index.module.scss';

const getLayerCss = (l, regionData) => (`&[id="${l.id}"] { fill: ${regionData && faseData[regionData.modeFase].color}}  &[id="${l.id}", aria-checked='true'] {fill: #916CB5 !important;}`);

const ByRegionModule = ({
  comunasData,
  regionesData,
  newCasesRegionData,
  theme,
}) => {
  const [selectedRegion, setSelectedRegion] = useState(localStorage.getItem('selectedRegion') || '13');

  const mapData = chileMap;
  const layerProps = {};
  const MapStyle = styled.div`
    svg{
      path {
        ${mapData.layers.map((l) => getLayerCss(l, regionesData[l.id.substring(2)]))}
      }
    }
  `;

  useEffect(() => {
    localStorage.setItem('selectedRegion', selectedRegion);
  }, [selectedRegion]);

  const setSelectedInMap = (region) => {
    if (!region) {
      return;
    }
    const regionCode = `${region.toString().substring(2)}`;
    setSelectedRegion(regionCode);
    window.scrollTo(0, 0);
  };
  numeral.locale('es');
  return (
    <div className={`${styles.cnt} ${styles[`theme-${theme}`]}`}>
      <div className={styles.map}>
        <MapStyle>
          <VectorMap
            {...mapData}
            layerProps={layerProps}
            onClick={({ target }) => setSelectedInMap(target.attributes.id && target.attributes.id.value)}
            checkedLayers={[`r-${parseInt(selectedRegion, 10).toString()}`]}
          />
        </MapStyle>
      </div>
      <div clasName={styles.main}>
        <div className={styles.select}>
          <div className={styles.label}>
            Elige una región para ver detalles
          </div>
          <Select
            className="select"
            classNamePrefix="select"
            isSearchable
            name="color"
            value={{
              value: regionesData[selectedRegion].regionCode,
              label: regionesData[selectedRegion].region,
            }}
            defaultValue={{
              value: regionesData[selectedRegion].regionCode,
              label: regionesData[selectedRegion].region,
            }}
            onChange={(e) => setSelectedRegion(e.value)}
            options={
            Object.values(regionesData).sort(
              (a, b) => ((a.region > b.region) ? 1 : -1),
            ).map((r) => ({
              value: r.regionCode,
              label: r.region,
            }))
          }
          />
        </div>
        <ComunasByStep fases={regionesData[selectedRegion].fases} fasesData={regionesData[selectedRegion].byFase} />
        <div className={styles.widget}>
          <RenderLineChart
            theme={theme}
            data={regionesData[selectedRegion].data}
            yAxisScale="linear"
            xAxisType="linear"
            showYAxisSelector
            yAxisMin={0}
            title={`Casos activos - ${regionesData[selectedRegion].region}`}
            width={100}
            height={isMobile() ? 60 : 25}
            xAxisStepSize={isMobile() ? 7 : 1}
            xLabelsField="updatedAt"
            yDatasets={{
              'Casos activos': 'activeCases',
            }}
          />
        </div>
        <div className={styles.widget}>
          <RenderBarChart
            theme={theme}
            data={
            delta(
              maxWeekly(regionesData[selectedRegion].data, 'activeCases'),
              2,
              'activeCases',
            )
          }
            yAxisScale="linear"
            yAxisType="percentage"
            xAxisType="linear"
            title={`Variación Casos activos - ${regionesData[selectedRegion].region} (2 semanas)`}
            width={100}
            height={isMobile() ? 60 : 25}
            xAxisStepSize={isMobile() ? 7 : 1}
            xLabelsField="updatedAt"
            yDatasets={{
              'Var Casos activos (2 sem)': 'activeCases',
            }}
          />
        </div>
        <div className={styles.widget}>
          <RenderBarChart
            theme={theme}
            data={newCasesRegionData[selectedRegion].data}
            yAxisScale="linear"
            xAxisType="linear"
            showYAxisSelector
            yAxisMin={0}
            title={`Casos nuevos - ${regionesData[selectedRegion].region}`}
            width={100}
            stack
            height={isMobile() ? 60 : 25}
            xAxisStepSize={isMobile() ? 7 : 1}
            xLabelsField="updatedAt"
            yDatasets={{
              'Con síntomas': 'newCaseWithSymptoms',
              'Sin síntomas': 'newCaseWithoutSymptoms',
            }}
          />
        </div>
        <div className={styles.widget}>
          <RenderLineChart
            theme={theme}
            data={newCasesRegionData[selectedRegion].data}
            yAxisScale="linear"
            xAxisType="linear"
            showYAxisSelector
            yAxisMin={0}
            title={`Test PCR - ${regionesData[selectedRegion].region}`}
            width={100}
            height={isMobile() ? 60 : 25}
            xAxisStepSize={isMobile() ? 7 : 1}
            xLabelsField="updatedAt"
            yDatasets={{
              'Test PCR': 'pcr',
              'Test PCR (Media Móvil 7D)': 'avg7DPCR',
            }}
          />
        </div>
        <div className={styles.widget}>
          <RenderLineChart
            theme={theme}
            data={newCasesRegionData[selectedRegion].data.map((x) => ({
              ...x,
              positivityPercent: x.positivity * 100,
              avg7DPositivityPercent: x.avg7DPositivity * 100,
            }))}
            yAxisScale="linear"
            xAxisType="linear"
            showYAxisSelector
            yAxisMin={0}
            title={`% Positividad - ${regionesData[selectedRegion].region}`}
            width={100}
            height={isMobile() ? 60 : 25}
            xAxisStepSize={isMobile() ? 7 : 1}
            xLabelsField="updatedAt"
            yDatasets={{
              '% Positividad': 'positivityPercent',
              '% Positividad (Media Móvil 7D)': 'avg7DPositivityPercent',
            }}
          />
        </div>
        <div className={styles.widget}>
          <RenderBarChart
            theme={theme}
            data={newCasesRegionData[selectedRegion].data}
            yAxisScale="linear"
            xAxisType="linear"
            showYAxisSelector
            yAxisMin={0}
            stack
            title={`Casos nuevos (% del total)- ${regionesData[selectedRegion].region}`}
            width={100}
            height={isMobile() ? 60 : 25}
            xAxisStepSize={isMobile() ? 7 : 1}
            xLabelsField="updatedAt"
            yDatasets={{
              'Con síntomas': 'percentNewCaseWithSymptoms',
              'Sin síntomas': 'percentNewCaseWithoutSymptoms',
            }}
          />
        </div>

        <div className={styles.grid3Cols1Col}>
          {Object.keys(comunasData).map((c) => (
            comunasData[c].regionCode === selectedRegion
            && (
              <div className={styles.widget} key={c}>
                <RenderLineChart
                  theme={theme}
                  data={comunasData[c].data}
                  yAxisScale="linear"
                  xAxisType="time"
                  showYAxisSelector
                  yAxisMin={0}
                  title={`${comunasData[c].label}<br/><small>Incidencia Casos activos</small><br/><small>(pob: ${numeral(comunasData[c].population).format('0,0')} hab, <span style="color:${faseData[comunasData[c].fase] && faseData[comunasData[c].fase].color}">Fase: ${comunasData[c].fase}, ${faseData[comunasData[c].fase] && faseData[comunasData[c].fase].name})<span></small>`}
                  width={33}
                  height={isMobile() ? 25 : 25}
                  xAxisStepSize={isMobile() ? 14 : 1}
                  xLabelsField="updatedAt"
                  yDatasets={{
                    'Incidencia 100.000 hab': 'prevalenceActiveCases',
                  }}
                />
              </div>
            )
          ))}
        </div>
        {selectedRegion === '05s' && (
        <>
          <div className={styles.widget} key="comp">
            <RenderLineChart
              theme={theme}
              data={mergeByUpdatedAt(comunasData['Valparaiso - Valparaiso'].data, comunasData['Valparaiso - Vina del Mar'].data).map((x) => ({
                updatedAt: x.a.updatedAt,
                prevalenceActiveCases1: x.a.prevalenceActiveCases,
                prevalenceActiveCases2: x.b.prevalenceActiveCases,
              }))}
              yAxisScale="linear"
              xAxisType="time"
              showYAxisSelector
              yAxisMin={0}
              title="Comparación Viña del Mar vs Valparaiso"
              width={33}
              height={isMobile() ? 15 : 15}
              xAxisStepSize={isMobile() ? 14 : 1}
              xLabelsField="updatedAt"
              yDatasets={{
                'Incidencia Viña del Mar': 'prevalenceActiveCases1',
                'Incidencia Valparaiso': 'prevalenceActiveCases2',
              }}
            />
          </div>
        </>
        )}
      </div>

    </div>
  );
};

ByRegionModule.defaultProps = {
  theme: 'light',
};

ByRegionModule.propTypes = {
  comunasData: PropTypes.object.isRequired,
  regionesData: PropTypes.object.isRequired,
  newCasesRegionData: PropTypes.object.isRequired,
  theme: PropTypes.string,
};

export default ByRegionModule;
