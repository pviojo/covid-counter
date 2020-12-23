/* eslint-disable react/no-danger */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Line, Bar } from 'react-chartjs-2';

import {
  pluck,
} from '../../helpers/utils';

import styles from './index.module.scss';

const dataset = ({
  label,
  color,
  data,
}) => {
  const localDataset = {
    label,
    lineTension: 0,
    fill: false,
    borderWidth: 2,
    borderColor: color,
    backgroundColor: color,
    pointRadius: 0,
    pointHitRadius: 20,
    data,
  };

  return localDataset;
};

export const chartColors = [
  '#3498DB',
  '#CB4335',
  '#F1C40F',
  '#16A085',
  '#673AB7',
  '#8E44AD',
  '#53a318',
];

export const RenderChart = ({
  data,
  chartType,
  stack,
  xLabelsField,
  yDatasets,
  colors,
  labels,
  datasets,
  height,
  width,
  showYAxisSelector,
  legend,
  yAxisMin,
  title,
  yAxisMax,
  xAxisType,
  xAxisStepSize,
  yAxisType,
  yAxisScale,
}) => {
  const [selectedYAxisScale, setSelectedYAxisScale] = useState(yAxisScale);

  let localLabels = null;
  if (!labels && xLabelsField) {
    localLabels = pluck(data, xLabelsField);
  }
  let localDatasets = datasets;
  if (!datasets && yDatasets) {
    localDatasets = Object.entries(yDatasets).map(([label, field]) => {
      let datasetData = pluck(data, field);
      if (yAxisType === 'percentage') {
        datasetData = datasetData.map((v) => v * 100);
      }
      const ds = dataset({
        label,
        data: datasetData,
      });
      if (stack) {
        ds.stack = 'stackKey';
      }
      return ds;
    });
  }
  const chartOptions = {};
  chartOptions.scales = {};

  chartOptions.scales.xAxes = [{
    ticks: {},
    gridLines: {
      color: '#222',
      zeroLineColor: '#333',
    },
  }];

  chartOptions.scales.yAxes = [{
    ticks: {},
    gridLines: {
      color: '#222',
      zeroLineColor: '#333',
    },
  }];

  if (selectedYAxisScale === 'log') {
    chartOptions.scales.yAxes[0].type = 'logarithmic';
  } else {
    chartOptions.scales.yAxes[0].type = selectedYAxisScale;
  }

  if (xAxisType === 'time') {
    chartOptions.scales.xAxes[0].type = 'time';
    chartOptions.scales.xAxes[0].time = {
      unit: 'day',
      stepSize: xAxisStepSize,
      displayFormats: {
        day: 'MMM D H:mm',
      },
    };
  }

  if (yAxisMin !== null) {
    chartOptions.scales.yAxes[0].ticks.min = yAxisMin;
  }
  if (yAxisMax !== null) {
    chartOptions.scales.yAxes[0].ticks.max = yAxisMax;
  }

  localDatasets = localDatasets.map((ds, index) => ({
    ...ds,
    borderColor: colors
      ? colors[index % colors.length]
      : chartColors[index % chartColors.length],
    backgroundColor: colors
      ? colors[index % colors.length]
      : chartColors[index % chartColors.length],
  }));

  const chartData = {
    labels: localLabels,
    datasets: localDatasets,
  };
  chartOptions.legend = {
    position: legend || 'bottom',
    labels: {
      padding: 5,
    },
  };
  return (
    <div className={styles.cnt}>
      <div className={styles.title} dangerouslySetInnerHTML={{ __html: title }} />
      {showYAxisSelector
        && (
          <div className={styles.tools}>
            <span
              className={`btn ${selectedYAxisScale === 'linear' ? styles.selected : ''}`}
              onClick={() => setSelectedYAxisScale('linear')}
            >
              Lineal
            </span>
            <span
              className={`btn ${selectedYAxisScale === 'log' ? styles.selected : ''}`}
              onClick={() => setSelectedYAxisScale('log')}
            >
              Logarítmico
            </span>
          </div>
        )}
      <div style={{ width: '100%' }}>
        { chartType === 'line'
          && (
          <Line
            data={chartData}
            height={height || 250}
            width={width || 100}
            options={chartOptions}
          />
          )}
        { chartType === 'bar'
          && (
          <Bar
            data={chartData}
            height={height || 250}
            width={width || 100}
            options={chartOptions}
          />
          )}
      </div>
    </div>
  );
};

RenderChart.defaultProps = {
  chartType: 'line',
  legend: 'bottom',
  yAxisMin: null,
  yAxisMax: null,
  xAxisType: 'default',
  yAxisType: 'default',
  yAxisScale: 'linear',
  xAxisStepSize: 1,
  title: null,
  labels: null,
  datasets: null,
  stack: false,
  showYAxisSelector: false,
};

RenderChart.propTypes = {
  data: PropTypes.array.isRequired,
  chartType: PropTypes.string,
  xLabelsField: PropTypes.string.isRequired,
  yDatasets: PropTypes.object.isRequired,
  colors: PropTypes.array.isRequired,
  labels: PropTypes.array,
  datasets: PropTypes.object,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  legend: PropTypes.string,
  title: PropTypes.string,
  yAxisMin: PropTypes.number,
  yAxisMax: PropTypes.number,
  xAxisType: PropTypes.string,
  xAxisStepSize: PropTypes.number,
  yAxisType: PropTypes.string,
  yAxisScale: PropTypes.string,
  stack: PropTypes.bool,
  showYAxisSelector: PropTypes.bool,
};

export const RenderLineChart = (props) => <RenderChart {...props} chartType="line" />;

export const RenderBarChart = (props) => <RenderChart {...props} chartType="bar" />;

export default {
  chartColors,
  RenderLineChart,
  RenderBarChart,
  RenderChart,
};
