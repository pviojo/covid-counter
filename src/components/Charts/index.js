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
  xLabelsField,
  yDatasets,
  colors,
  labels,
  datasets,
  height,
  width,
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
      return dataset({
        label,
        data: datasetData,
      });
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
      <div className={styles.title}>{title}</div>
      <div className={styles.tools}>
        <span
          className={`${styles.btn} ${selectedYAxisScale === 'linear' ? styles.selected : ''}`}
          onClick={() => setSelectedYAxisScale('linear')}
        >
          Lineal
        </span>
        <span
          className={`${styles.btn} ${selectedYAxisScale === 'log' ? styles.selected : ''}`}
          onClick={() => setSelectedYAxisScale('log')}
        >
          Logarítmico
        </span>
      </div>
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
};

RenderChart.propTypes = {
  data: PropTypes.object.isRequired,
  chartType: PropTypes.string,
  xLabelsField: PropTypes.array.isRequired,
  yDatasets: PropTypes.array.isRequired,
  colors: PropTypes.array.isRequired,
  labels: PropTypes.array.isRequired,
  datasets: PropTypes.object.isRequired,
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
};

export const RenderLineChart = (props) => <RenderChart {...props} chartType="line" />;

export const RenderBarChart = (props) => <RenderChart {...props} chartType="bar" />;

export default {
  chartColors,
  RenderLineChart,
  RenderBarChart,
  RenderChart,
};