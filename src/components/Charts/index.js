/* eslint-disable no-nested-ternary */
/* eslint-disable react/no-danger */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Line, Bar, Scatter } from 'react-chartjs-2';

import {
  pluck,
} from '../../helpers/utils';

import styles from './index.module.scss';

const dataset = ({
  label,
  color,
  data,
  pointRadius,
}) => {
  const localDataset = {
    label,
    lineTension: 0,
    fill: false,
    borderWidth: 2,
    borderColor: color,
    backgroundColor: color,
    pointRadius,
    pointHitRadius: 20,
    data,
  };

  return localDataset;
};
export const chartColorsTheme = {
  light: {
    gridLines: {
      color: '#eee',
      zeroLineColor: '#916CB5',
    },
    series: [
      '#28b4c8',
      '#ff6358',
      '#78d237',
      '#ffd246',
      '#2d73f5',
      '#aa46be',
      '#29682C',
      '#484848',
      '#b85252',
      '#fd5ea5',
    ],
  },
  dark: {
    gridLines: {
      color: '#222',
      zeroLineColor: '#333',
    },
    series: [
      '#3498DB',
      '#CB4335',
      '#F1C40F',
      '#16A085',
      '#673AB7',
      '#8E44AD',
      '#53a318',
    ],
  },
};

export const RenderChart = ({
  data,
  chartType,
  stack,
  xLabelsField,
  pointRadius,
  yDatasets,
  colors,
  labels,
  theme,
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
  const chartReference = useRef();
  const [selectedYAxisScale, setSelectedYAxisScale] = useState(yAxisScale);
  const processedData = typeof data === 'function' ? data() : data;
  let localLabels = null;
  if (!labels && xLabelsField) {
    localLabels = pluck(processedData, xLabelsField);
  }
  let localDatasets = datasets;
  if (!datasets && yDatasets && chartType !== 'scatter') {
    localDatasets = Object.entries(yDatasets).map(([label, field]) => {
      let datasetData = pluck(processedData, field);
      if (yAxisType === 'percentage') {
        datasetData = datasetData.map((v) => v * 100);
      }
      const ds = dataset({
        label,
        pointRadius,
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
    gridLines: chartColorsTheme[theme].gridLines,
  }];

  chartOptions.scales.yAxes = [{
    ticks: {},
    gridLines: chartColorsTheme[theme].gridLines,
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

  const colorsUse = colors || chartColorsTheme[theme].series;
  localDatasets = localDatasets && localDatasets.map((ds, index) => ({
    ...ds,
    borderColor: colorsUse[index % colorsUse.length],
    backgroundColor: colorsUse[index % colorsUse.length],
  }));
  let chartData = {};
  chartOptions.tooltips = {
    mode: 'index',
  };

  chartOptions.legend = {
    onClick: (e, legendItem) => {
      const index = legendItem.datasetIndex;
      const ci = chartReference.current.chartInstance;
      const meta = ci.getDatasetMeta(index);

      if (e.metaKey || e.ctrlKey) {
        const n = ci.data.datasets.length;
        [...Array(n).keys()].map((i) => {
          (ci.getDatasetMeta(i)).hidden = (i !== index ? true : null);
          return null;
        });
      } else {
        meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
      }

      // We hid a dataset ... rerender the chart
      ci.update();
    },
  };

  if (chartType !== 'scatter') {
    chartData = {
      labels: localLabels,
      datasets: localDatasets,
    };
  } else {
    chartData = {
      datasets: [{
        data,
        borderColor: 'transparent',
        pointBackgroundColor(context) {
          const index = context.dataIndex;
          const value = context.dataset.data[index].y;
          return value > 0 ? '#c30' : '#093';
        },
      }],
      labels: data.map((x) => x.label),
    };
    chartOptions.tooltips = {
      callbacks: {
        label(tooltipItem, xdata) {
          return xdata.labels[tooltipItem.index] || `(${tooltipItem.xLabel}, ${tooltipItem.yLabel})`;
        },
      },
    };
  }
  if (chartType !== 'scatter') {
    chartOptions.legend = {
      ...chartOptions.legend,
      position: legend || 'bottom',
      labels: {
        padding: 5,
      },
    };
  } else {
    chartOptions.legend = { display: false };
  }
  return (
    <div className={`${styles.cnt} ${styles[`theme-${theme}`]}`}>
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
        {chartType === 'line'
          && (
            <Line
              ref={chartReference}
              data={chartData}
              height={height || 250}
              width={width || 100}
              options={chartOptions}
            />
          )}
        {chartType === 'bar'
          && (
            <Bar
              ref={chartReference}
              data={chartData}
              height={height || 250}
              width={width || 100}
              options={chartOptions}
            />
          )}
        {chartType === 'scatter'
          && (
            <Scatter
              ref={chartReference}
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
  colors: null,
  xAxisType: 'default',
  yAxisType: 'default',
  yAxisScale: 'linear',
  xAxisStepSize: 1,
  title: null,
  labels: null,
  datasets: null,
  stack: false,
  theme: null,
  pointRadius: 0,
  showYAxisSelector: false,
};

RenderChart.propTypes = {
  data: PropTypes.array.isRequired,
  chartType: PropTypes.string,
  xLabelsField: PropTypes.string.isRequired,
  yDatasets: PropTypes.object.isRequired,
  colors: PropTypes.array,
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
  theme: PropTypes.string,
  stack: PropTypes.bool,
  pointRadius: PropTypes.number,
  showYAxisSelector: PropTypes.bool,
};

export const RenderLineChart = (props) => <RenderChart {...props} chartType="line" />;

export const RenderBarChart = (props) => <RenderChart {...props} chartType="bar" />;

export const RenderScatterChart = (props) => <RenderChart {...props} chartType="scatter" />;

export default {
  chartColorsTheme,
  RenderLineChart,
  RenderBarChart,
  RenderChart,
  RenderScatterChart,
};
