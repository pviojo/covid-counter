/* eslint-disable prefer-destructuring */
import axios from 'axios';
import moment from 'moment';

const nameCodeRegion = {
  'Arica y Parinacota': '15',
  Tarapacá: '01',
  Antofagasta: '02',
  Atacama: '03',
  Coquimbo: '04',
  Valparaíso: '05',
  Metropolitana: '13',
  'O’Higgins': '06',
  Maule: '07',
  Ñuble: '16',
  Biobío: '08',
  Araucanía: '09',
  'Los Ríos': '14',
  'Los Lagos': '10',
  Aysén: '11',
  Magallanes: '12',
};

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
  const dataNewCasesWithSymptoms = (rows[1]).slice(1);
  const dataNewCasesWithoutSymptoms = (rows[6]).slice(1);
  const dataNewCases = (rows[7]).slice(1);
  const rsp = dates.map((date, index) => {
    const d = moment(date).subtract(3, 'hours').format();
    const newCases = parseInt(dataNewCases[index] || 0, 10);
    const newCasesWithSymptoms = parseInt(dataNewCasesWithSymptoms[index] || 0, 10);
    const newCasesWithoutSymptoms = parseInt(dataNewCasesWithoutSymptoms[index] || 0, 10);
    const testsPCR = parseInt(
      (casesPcr.find((x) => x.updatedAt === d) || { testsPCR: 0 }).testsPCR,
      10,
    );
    const positivity = testsPCR > 0 ? newCases / testsPCR : null;
    return {
      updatedAt: d,
      newCases,
      newCasesWithSymptoms,
      newCasesWithoutSymptoms,
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
        prevalenceActiveCases: parseInt(row[i + 5], 10) / (r.population / 100000),
      });
      // prevCases = t;
      return null;
    });
    rsp[r.label] = r;
    return null;
  });
  return rsp;
};

const getRegionesData = async (comunasData) => {
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
    rsp[k].data = Object.values(rsp[k].data).sort((a, b) => (a.updatedAt < b.updatedAt ? -1 : 1));
    return null;
  });
  return rsp;
};

const getNewCasesRegionData = async () => {
  const rsp = {};
  let rows = await readCsv('https://raw.githubusercontent.com/MinCiencia/Datos-COVID19/master/output/producto27/CasosNuevosSinSintomas.csv');
  let dates = rows[0].slice(1);
  rows = rows.slice(1, -1);
  rows.map((row) => {
    dates.map((d, i) => {
      const regionCode = nameCodeRegion[row[0]];
      if (!rsp[regionCode]) {
        rsp[regionCode] = { data: {} };
        return null;
      }
      if (!rsp[regionCode].data[d]) {
        rsp[regionCode].data[d] = {
          updatedAt: d,
          newCases: 0,
          newCaseWithSymptoms: 0,
          newCaseWithoutSymptoms: 0,
        };
      }
      rsp[regionCode].data[d].newCaseWithoutSymptoms = parseInt(row[i + 1], 10);
      rsp[regionCode].data[d].newCases += parseInt(row[i + 1], 10);
      return null;
    });
    return null;
  });

  rows = await readCsv('https://raw.githubusercontent.com/MinCiencia/Datos-COVID19/master/output/producto26/CasosNuevosConSintomas.csv');
  dates = rows[0].slice(1);
  rows = rows.slice(1, -1);
  rows.map((row) => {
    dates.map((d, i) => {
      const regionCode = nameCodeRegion[row[0]];
      if (!rsp[regionCode]) {
        rsp[regionCode] = { data: {} };
        return null;
      }
      if (!rsp[regionCode].data[d]) {
        rsp[regionCode].data[d] = {
          updatedAt: d,
          newCases: 0,
          newCaseWithSymptoms: 0,
          newCaseWithoutSymptoms: 0,
        };
      }
      rsp[regionCode].data[d].newCaseWithSymptoms = parseInt(row[i + 1], 10);
      rsp[regionCode].data[d].newCases += parseInt(row[i + 1], 10);
      // eslint-disable-next-line max-len
      rsp[regionCode].data[d].percentNewCaseWithoutSymptoms = rsp[regionCode].data[d].newCaseWithoutSymptoms / rsp[regionCode].data[d].newCases;
      // eslint-disable-next-line max-len
      rsp[regionCode].data[d].percentNewCaseWithSymptoms = rsp[regionCode].data[d].newCaseWithSymptoms / rsp[regionCode].data[d].newCases;
      return null;
    });
    return null;
  });

  Object.keys(rsp).map((k) => {
    rsp[k].data = Object.values(rsp[k].data).sort((a, b) => (a.updatedAt < b.updatedAt ? -1 : 1));
    return null;
  });
  return rsp;
};

const getDataDeathsCovid = async () => {
  const rows = await readCsv('https://raw.githubusercontent.com/MinCiencia/Datos-COVID19/master/output/producto37/Defunciones_deis.csv');
  const confirmedRows = rows.filter((r) => r[0] === 'confirmados');
  const deathsCovid = confirmedRows.map((row) => ({
    updatedAt: moment(row[1]).subtract(3, 'hours').format(),
    newDeathsCovid: parseInt(row.slice(3).reduce((acc, current) => acc + current, 0) || 0, 10),
  }));
  const deathsCovidByReportDay = [];
  return {
    deathsCovid,
    deathsCovidByReportDay,
  };
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
  data = avgLast(data, 7, 'newCases', 'avg7DNewCases');
  data = avgLast(data, 14, 'newCases', 'avg14DNewCases');

  data = avgLast(data, 7, 'newCasesWithSymptoms', 'avg7DNewCasesWithSymptoms');
  data = avgLast(data, 14, 'newCasesWithSymptoms', 'avg14DNewCasesWithSymptoms');

  data = avgLast(data, 7, 'newCasesWithoutSymptoms', 'avg7DNewCasesWithoutSymptoms');
  data = avgLast(data, 14, 'newCasesWithoutSymptoms', 'avg14DNewCasesWithoutSymptoms');

  data = avgLast(data, 7, 'newDeathsCovid', 'avg7DayDeathsCovid');
  data = avgLast(data, 7, 'positivity', 'avg7DPositivity');
  data = avgLast(data, 7, 'testsPCR', 'avg7DtestsPCR');
  data = avgLast(data, 14, 'positivity', 'avg14DPositivity');

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

  data = data.reverse();
  const comunasData = await getComunasData();
  const regionesData = await getRegionesData(comunasData);
  const newCasesRegionData = await getNewCasesRegionData();

  return {
    dailyData: data,
    comunasData,
    regionesData,
    newCasesRegionData,
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
