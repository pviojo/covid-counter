import axios from 'axios';
import moment from 'moment';

const readCsv = async (url) => {
  const rows = await axios.get(url)
    .then((rsp) => rsp.data)
    .then((data) => data.trim().split('\n').map((row) => row.split(',')).filter((x) => !!x))
    .catch(() => (
      []
    ));
  return rows;
};

const getDataCases = async () => {
  const rows = await readCsv('https://raw.githubusercontent.com/MinCiencia/Datos-COVID19/master/output/producto5/TotalesNacionales.csv');
  const dates = (rows[0]).slice(1);
  const newCases = (rows[7]).slice(1);
  let totalCases = 0;
  const rsp = dates.map((date, index) => {
    totalCases += parseInt(newCases[index] || 0, 10);
    return {
      updatedAt: moment(dates[index]).subtract(3, 'hours').format(),
      newCases: parseInt(newCases[index] || 0, 10),
      totalCases,
    };
  }).reverse();
  return rsp;
};

const getDataDeaths = async () => {
  const rows = await readCsv('https://raw.githubusercontent.com/MinCiencia/Datos-COVID19/master/output/producto37/Defunciones.csv');
  const dates = (rows[0]).slice(1);
  const newDeaths = (rows[rows.length - 1]).slice(1);
  let totalDeaths = 0;
  const rsp = dates.map((date, index) => {
    totalDeaths += newDeaths[index] ? parseInt(newDeaths[index], 10) : 0;
    return {
      updatedAt: moment(dates[index]).subtract(3, 'hours').format(),
      newDeaths: parseInt(newDeaths[index] || 0, 10),
      totalDeaths,
    };
  }).reverse();
  return rsp;
};

const merge = (array1, array2, key) => {
  const rsp = array1.map((row) => ({
    ...row,
    ...(array2.find((x) => x[key] === row[key]) || null),
  }));
  return rsp;
};

export const getData = async () => {
  const dataCases = await getDataCases();
  const dataDeaths = await getDataDeaths();
  let data = merge(dataCases, dataDeaths, 'updatedAt');
  data = data.map((row) => ({
    ...row,
    lethality: Math.round(
      (row.totalDeaths ? row.totalDeaths / row.totalCases : 0) * 100 * 100,
    ) / 100 / 100,
  }));
  return data;
};

export default {
  getData,
};
