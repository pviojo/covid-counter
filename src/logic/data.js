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

const merge = (array1, array2, key) => {
  const rsp = array1.map((row) => ({
    ...row,
    ...(array2.find((x) => x[key] === row[key]) || null),
  }));
  return rsp;
};

const accumulate = (array, key, accKey) => {
  let acc = 0;
  const rsp = array.map((item) => {
    acc += (item[key] || 0);
    return {
      ...item,
      [accKey]: acc,
    };
  });
  return rsp;
};

const avgLast = (array, n, key, averagedKey) => {
  const prev = [];
  let avg = 0;
  const rsp = array.map((item, index) => {
    prev.push(item[key]);
    if (index >= (n - 1)) {
      avg = Math.round((prev.reduce((a, b) => a + parseInt(b, 10), 0)) / n);
      prev.shift();
    }
    return {
      ...item,
      [averagedKey]: avg,
    };
  });
  return rsp;
};

const getDataCasesCovid = async () => {
  const rows = await readCsv('https://raw.githubusercontent.com/MinCiencia/Datos-COVID19/master/output/producto5/TotalesNacionales.csv');
  const dates = (rows[0]).slice(1);
  const newCases = (rows[7]).slice(1);
  const rsp = dates.map((date, index) => ({
    updatedAt: moment(date).subtract(3, 'hours').format(),
    newCases: parseInt(newCases[index] || 0, 10),
  }));
  return rsp;
};

const getDataDeaths2020 = async () => {
  const rows = await readCsv('https://raw.githubusercontent.com/MinCiencia/Datos-COVID19/master/output/producto32/2020-Defunciones_T.csv');
  const dates = rows.slice(4);
  let rsp = dates.map((row) => ({
    updatedAt: moment(row[0]).add(21, 'hours').format(),
    allDeaths: row.slice(1).reduce((a, b) => a + parseInt(b, 10), 0),
  }));
  rsp = avgLast(rsp, 7, 'allDeaths', 'avg7DayAllDeaths');
  return rsp;
};

const getDataDeathsCovid = async () => {
  const rows = await readCsv('https://raw.githubusercontent.com/MinCiencia/Datos-COVID19/master/output/producto37/Defunciones.csv');
  const dates = (rows[0]).slice(1);
  const allRows = rows.slice(1);
  const newDeathsCovid = (rows[rows.length - 1]).slice(1);
  const deathsCovid = dates.map((date, index) => ({
    updatedAt: moment(date).subtract(3, 'hours').format(),
    newDeathsCovid: parseInt(newDeathsCovid[index] || 0, 10),
  }));
  const deathsCovidByReportDay = dates.map((date, index) => {
    const data = {
      updatedAt: moment(date).format(),
    };
    let prevAccReported = 0;
    allRows.slice(-6).map((r) => {
      const accReported = parseInt(r[index + 1] || 0, 10) + 0;
      data[`reported_${r[0].replace('Defunciones_', '').replace(/-/gi, '')}`] = accReported;
      data[`new_reported_${r[0].replace('Defunciones_', '').replace(/-/gi, '')}`] = accReported - prevAccReported;
      prevAccReported = accReported;
      return null;
    });
    return data;
  });
  return {
    deathsCovid,
    deathsCovidByReportDay,
  };
};

export const getData = async () => {
  const dataCases = await getDataCasesCovid();
  const {
    deathsCovid: dataDeaths,
    deathsCovidByReportDay: dataDeathsCovidByReportDay,
  } = await getDataDeathsCovid();
  const dataDeaths2020 = await getDataDeaths2020();

  let data = dataCases;
  data = merge(dataCases, dataDeaths, 'updatedAt');
  data = merge(data, dataDeaths2020, 'updatedAt');
  data = accumulate(data, 'newCases', 'totalCases');
  data = accumulate(data, 'newDeathsCovid', 'totalDeathsCovid');
  data = avgLast(data, 7, 'newDeathsCovid', 'avg7DayDeathsCovid');

  data = data.reverse();
  data = data.map((row) => ({
    ...row,
    lethality: Math.round(
      (row.totalDeathsCovid ? row.totalDeathsCovid / row.totalCases : 0) * 100 * 100,
    ) / 100 / 100,
  }));
  return {
    dailyData: data,
    dataDeathsCovidByReportDay,
  };
};

export default {
  getData,
};
