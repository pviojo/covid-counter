/* eslint-disable prefer-destructuring */
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
      avg = (prev.reduce((a, b) => a + parseFloat(b, 10), 0)) / n;
      prev.shift();
    }
    return {
      ...item,
      [averagedKey]: avg,
    };
  });
  return rsp;
};

const getDataCovid = async () => {
  const rows = await readCsv('https://raw.githubusercontent.com/MinCiencia/Datos-COVID19/master/output/producto5/TotalesNacionales.csv');
  const pcrRows = await readCsv('https://raw.githubusercontent.com/MinCiencia/Datos-COVID19/master/output/producto7/PCR_T.csv');
  const casesPcr = pcrRows.slice(3).map((row) => ({
    updatedAt: moment(row[0]).subtract(3, 'hours').format(),
    testsPCR: row.slice(1).reduce((a, i) => a + (parseInt(i, 10) || 0), 0),
  }));
  const dates = (rows[0]).slice(1);
  const dataNewCases = (rows[7]).slice(1);
  const rsp = dates.map((date, index) => {
    const d = moment(date).subtract(3, 'hours').format();
    const newCases = parseInt(dataNewCases[index] || 0, 10);
    const testsPCR = parseInt(
      (casesPcr.find((x) => x.updatedAt === d) || { testsPCR: 0 }).testsPCR,
      10,
    );
    const positivity = testsPCR > 0 ? newCases / testsPCR : null;
    return {
      updatedAt: d,
      newCases,
      testsPCR,
      positivity,
    };
  });
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

const getComunasData = async () => {
  const rows = await readCsv('https://raw.githubusercontent.com/MinCiencia/Datos-COVID19/master/output/producto19/CasosActivosPorComuna.csv');
  const dates = rows[0].slice(5);
  const rsp = {};
  rows.slice(1).map((row) => {
    if (!row[3]) {
      return null;
    }
    const r = {};
    r.label = `${row[0]} - ${row[2]}`;
    r.region = row[0];
    r.regionCode = row[1];
    r.comuna = row[2];
    r.comunaCode = row[3];
    r.population = parseInt(row[4], 10);
    r.data = [];
    // let prevCases = 0;
    dates.map((d, i) => {
      // const t = parseInt(row[i + 5], 10);
      r.data.push({
        updatedAt: d,
        // totalCases: t,
        // newCases: t - prevCases,
        activeCases: parseInt(row[i + 5], 10),
      });
      // prevCases = t;
      return null;
    });
    rsp[r.comunaCode] = r;
    return null;
  });
  return rsp;
};

const getRegionesData = (comunasData) => {
  const rsp = {};
  Object.values(comunasData).map((comuna) => {
    const { regionCode } = comuna;
    if (!rsp[regionCode]) {
      rsp[regionCode] = {
        regionCode,
        region: comuna.region,
        data: {},
      };
    }
    comuna.data.map((r) => {
      const d = r.updatedAt;
      if (!rsp[regionCode].data[d]) {
        rsp[regionCode].data[d] = {
          updatedAt: d,
          activeCases: 0,
        };
      }
      rsp[regionCode].data[d].activeCases += r.activeCases;
      return null;
    });
    return null;
  });
  Object.keys(rsp).map((k) => {
    rsp[k].data = Object.values(rsp[k].data);
    return null;
  });
  return rsp;
};

const getDataDeathsCovid = async () => {
  const rows = await readCsv('https://raw.githubusercontent.com/MinCiencia/Datos-COVID19/master/output/producto37/Defunciones_deis.csv');
  const confirmedRows = rows.filter((r) => r[0] === 'confirmados');
  // const dates = confirmedRows.map((x) => x[1]);
  const deathsCovid = confirmedRows.map((row) => ({
    updatedAt: moment(row[1]).subtract(3, 'hours').format(),
    newDeathsCovid: parseInt(row.slice(3).reduce((acc, current) => acc + current, 0) || 0, 10),
  }));
  const deathsCovidByReportDay = [];
  return {
    deathsCovid,
    deathsCovidByReportDay,
  };
  /*
  deathsCovidByReportDay = dates.map((date, index) => {
    const data = {
      updatedAt: moment(date).format(),
    };
    let prevAccReported = 0;
    allRows.slice(-6).map((r) => {
      const accReported = parseInt(r[index + 1] || 0, 10) + 0;
      data[`reported_${r[0].replace('Defunciones_', '').replace(/-/gi, '')}`] = accReported;
      data[`new_reported_${r[0].replace('Defunciones_', '').replace(/-/gi, '')}`] =
        accReported - prevAccReported;
      prevAccReported = accReported;
      return null;
    });
    return data;
  });
  return {
    deathsCovid,
    deathsCovidByReportDay,
  }; */
};

export const getData = async () => {
  let data = await getDataCovid();
  const {
    deathsCovid: dataDeaths,
    deathsCovidByReportDay: dataDeathsCovidByReportDay,
  } = await getDataDeathsCovid();
  const dataDeaths2020 = await getDataDeaths2020();

  data = merge(data, dataDeaths, 'updatedAt');
  data = merge(data, dataDeaths2020, 'updatedAt');
  data = accumulate(data, 'newCases', 'totalCases');
  data = data.map((x) => (
    {
      ...x,
      totalCases: x.totalCases + 31784,
    }
  ));
  data = accumulate(data, 'newDeathsCovid', 'totalDeathsCovid');
  data = accumulate(data, 'testsPCR', 'totalTestsPCR');
  data = avgLast(data, 7, 'newDeathsCovid', 'avg7DayDeathsCovid');
  data = avgLast(data, 7, 'positivity', 'avg7DPositivity');

  let totalCasesSinceApr9 = 0;
  data = data.map((row) => {
    if (row.updatedAt <= '2020-04-09') {
      return {
        ...row,
        totalCasesSinceApr9: 0,
      };
    }

    totalCasesSinceApr9 += parseInt(row.newCases, 10);

    return {
      ...row,
      totalCasesSinceApr9,
    };
  });

  data = data.reverse();
  data = data.map((row) => ({
    ...row,
    accumulatedPositivity: row.updatedAt > '2020-04-09' ? row.totalCasesSinceApr9 / row.totalTestsPCR : null,
    lethality: Math.round(
      (row.totalDeathsCovid ? row.totalDeathsCovid / row.totalCases : 0) * 100 * 100,
    ) / 100 / 100,
  }));

  const comunasData = await getComunasData();

  return {
    dailyData: data,
    comunasData,
    regionesData: getRegionesData(comunasData),
    dataDeathsCovidByReportDay,
    probableDeaths: {
      n: 3069,
      updatedAt: '2020-06-19',
    },
  };
};

export default {
  getData,
};
