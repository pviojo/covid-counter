/* eslint-disable prefer-destructuring */
import axios from 'axios';
import moment from 'moment';

import {
  mode,
  avgLast,
} from '../helpers/data';

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

const getDataCovid = async () => {
  const rows = await readCsv('https://raw.githubusercontent.com/MinCiencia/Datos-COVID19/master/output/producto5/TotalesNacionales.csv');
  const pcrRows = await readCsv('https://raw.githubusercontent.com/MinCiencia/Datos-COVID19/master/output/producto7/PCR_T.csv');
  const casesPcr = pcrRows.slice(3).map((row) => ({
    updatedAt: moment(row[0]).subtract(3, 'hours').format(),
    testsPCR: row.slice(1).reduce((a, i) => a + (parseInt(i, 10) || 0), 0),
  }));
  const dates = (rows[0]).slice(1);
  const dataNewCasesWithSymptoms = (rows[1]).slice(1);
  const dataTotalCases = (rows[2]).slice(1);
  const dataNewCasesWithoutSymptoms = (rows[6]).slice(1);
  const dataNewCases = (rows[7]).slice(1);
  const dataDeaths = (rows[4]).slice(1);
  const dataActiveCases = (rows[9]).slice(1);
  const dataActiveCasesFD = (rows[8]).slice(1);
  let prevDeaths = 0;

  const ventiladoresRow = (await readCsv('https://raw.githubusercontent.com/MinCiencia/Datos-COVID19/master/output/producto20/NumeroVentiladores_T.csv')).slice(1);
  const ventiladores = {};
  ventiladoresRow.map((r) => {
    ventiladores[r[0]] = {
      total: parseInt(r[1], 10),
      available: parseInt(r[2], 10),
      busy: parseInt(r[3], 10),
    };
    return null;
  });

  const camasRow = (await readCsv('https://raw.githubusercontent.com/MinCiencia/Datos-COVID19/master/output/producto58/Camas_UCI_diarias_std.csv')).filter((x) => x[0] === 'Total');
  const camas = {};
  camasRow.map((x) => {
    if (!camas[x[2]]) {
      camas[x[2]] = {
        total: 0,
        available: 0,
        busy: 0,
        busy_covid19: 0,
        busy_noncovid19: 0,
      };
    }
    if (x[1] === 'Camas UCI habilitadas') {
      camas[x[2]].total = parseInt(x[3], 10);
    }
    if (x[1] === 'Camas UCI ocupadas COVID-19') {
      camas[x[2]].busy_covid19 = parseInt(x[3], 10);
    }
    if (x[1] === 'Camas UCI ocupadas no COVID-19') {
      camas[x[2]].busy_noncovid19 = parseInt(x[3], 10);
    }
    if (x[1] === 'Camas UCI ocupadas') {
      camas[x[2]].busy = parseInt(x[3], 10);
    }
    camas[x[2]].busy = camas[x[2]].busy_noncovid19 + camas[x[2]].busy_covid19;
    camas[x[2]].available = camas[x[2]].total - camas[x[2]].busy;
    return null;
  });

  let agesRow = (await readCsv('https://raw.githubusercontent.com/MinCiencia/Datos-COVID19/master/output/producto16/CasosGeneroEtario_T.csv')).slice(2);
  agesRow = agesRow.map((row, i) => {
    if (i === 0) {
      return row.map((col, k) => (k === 0 ? col : parseInt(col, 10)));
    }
    const delta = row.map((col, k) => (k === 0 ? col : (col - agesRow[i - 1][k])));
    return delta;
  });
  const byAges = {};
  agesRow.map((r) => {
    byAges[r[0]] = {
      M: {
        '0-4': parseInt(r[1], 10),
        '5-9': parseInt(r[2], 10),
        '10-14': parseInt(r[3], 10),
        '15-19': parseInt(r[4], 10),
        '20-24': parseInt(r[5], 10),
        '25-29': parseInt(r[6], 10),
        '30-34': parseInt(r[7], 10),
        '35-39': parseInt(r[8], 10),
        '40-44': parseInt(r[9], 10),
        '45-49': parseInt(r[10], 10),
        '50-54': parseInt(r[11], 10),
        '55-59': parseInt(r[12], 10),
        '60-64': parseInt(r[13], 10),
        '65-69': parseInt(r[14], 10),
        '70-74': parseInt(r[15], 10),
        '75-79': parseInt(r[16], 10),
        '80+': parseInt(r[17], 10),
      },
      F: {
        '0-4': parseInt(r[18], 10),
        '5-9': parseInt(r[19], 10),
        '10-14': parseInt(r[20], 10),
        '15-19': parseInt(r[21], 10),
        '20-24': parseInt(r[22], 10),
        '25-29': parseInt(r[23], 10),
        '30-34': parseInt(r[24], 10),
        '35-39': parseInt(r[25], 10),
        '40-44': parseInt(r[26], 10),
        '45-49': parseInt(r[27], 10),
        '50-54': parseInt(r[28], 10),
        '55-59': parseInt(r[29], 10),
        '60-64': parseInt(r[30], 10),
        '65-69': parseInt(r[31], 10),
        '70-74': parseInt(r[32], 10),
        '75-79': parseInt(r[33], 10),
        '80+': parseInt(r[34], 10),
      },
      total: 0,
      general: {},
      pct: {},
    };
    Object.keys(byAges[r[0]].M).map((k) => {
      const x = byAges[r[0]].M[k] + byAges[r[0]].F[k];
      byAges[r[0]].general[k] = x;
      byAges[r[0]].total += x;
      return null;
    });
    Object.keys(byAges[r[0]].M).map((k) => {
      byAges[r[0]].pct[k] = Math.round(
        ((byAges[r[0]].general[k] / byAges[r[0]].total) * 100) * 100,
      ) / 100;
      return null;
    });
    return null;
  });
  const hospitalizadosRow = (await readCsv('https://raw.githubusercontent.com/MinCiencia/Datos-COVID19/master/output/producto9/HospitalizadosUCIEtario_T.csv')).slice(1);
  const hospitalizados = {};
  hospitalizadosRow.map((r) => {
    hospitalizados[r[0]] = {
      '0-39': parseInt(r[1], 10),
      '40-49': parseInt(r[2], 10),
      '50-59': parseInt(r[3], 10),
      '60-69': parseInt(r[4], 10),
      '70+': parseInt(r[5], 10),
      total: parseInt(r[1], 10)
        + parseInt(r[2], 10)
        + parseInt(r[3], 10)
        + parseInt(r[4], 10)
        + parseInt(r[5], 10),
    };
    hospitalizados[r[0]] = {
      ...hospitalizados[r[0]],
      ...{
        'pct0-39': (hospitalizados[r[0]]['0-39'] / hospitalizados[r[0]].total) * 100,
        'pct40-49': (hospitalizados[r[0]]['40-49'] / hospitalizados[r[0]].total) * 100,
        'pct50-59': (hospitalizados[r[0]]['50-59'] / hospitalizados[r[0]].total) * 100,
        'pct60-69': (hospitalizados[r[0]]['60-69'] / hospitalizados[r[0]].total) * 100,
        'pct70+': (hospitalizados[r[0]]['70+'] / hospitalizados[r[0]].total) * 100,
      },
    };
    return null;
  });
  let ventiladoresAvailable = 0;
  let ventiladoresBusy = 0;
  let ventiladoresTotal = 0;
  let camasAvailable = 0;
  let camasBusy = 0;
  let camasBusyCovid19 = 0;
  let camasBusyNonCovid19 = 0;
  let camasTotal = 0;
  const rsp = dates.map((date, index) => {
    const d = moment(date).subtract(3, 'hours').format();
    const newCases = parseInt(dataNewCases[index] || 0, 10);
    const newCasesWithSymptoms = parseInt(dataNewCasesWithSymptoms[index] || 0, 10);
    const newCasesWithoutSymptoms = parseInt(dataNewCasesWithoutSymptoms[index] || 0, 10);
    const totalCases = parseInt(dataTotalCases[index] || 0, 10);
    const accDeaths = parseInt(dataDeaths[index] || prevDeaths, 10);
    const deaths = accDeaths - prevDeaths;
    prevDeaths = accDeaths;

    const activeCases = parseInt(dataActiveCases[index] || 0, 10);
    const activeCasesFIS = activeCases;
    const activeCasesFD = parseInt(dataActiveCasesFD[index] || 0, 10);
    const testsPCR = parseInt(
      (casesPcr.find((x) => x.updatedAt === d) || { testsPCR: 0 }).testsPCR,
      10,
    );
    const positivity = testsPCR > 0 ? newCases / testsPCR : null;
    if (date !== '2020-09-30') {
      // eslint-disable-next-line max-len
      ventiladoresAvailable = ventiladores[date] ? ventiladores[date].available : ventiladoresAvailable;
      ventiladoresBusy = ventiladores[date] ? ventiladores[date].busy : ventiladoresBusy;
      ventiladoresTotal = ventiladores[date] ? ventiladores[date].total : ventiladoresTotal;
    }

    camasAvailable = camas[date] ? camas[date].available : camasAvailable;
    camasBusy = camas[date] ? camas[date].busy : camasBusy;
    camasBusyCovid19 = camas[date] ? camas[date].busy_covid19 : camasBusyCovid19;
    camasBusyNonCovid19 = camas[date] ? camas[date].busy_noncovid19 : camasBusyNonCovid19;
    camasTotal = camasAvailable + camasBusy;
    const agesRowDate = byAges[date] || {};
    const hosp = hospitalizados[date] || {
      '0-39': 0,
      '40-49': 0,
      '50-59': 0,
      '60-69': 0,
      '70+': 0,
    };
    return {
      date,
      updatedAt: d,
      newCases,
      totalCases,
      totalDeaths: accDeaths,
      deaths,
      newCasesWithSymptoms,
      activeCases,
      activeCasesFIS,
      activeCasesFD,
      newCasesWithoutSymptoms,
      testsPCR,
      positivity,
      ventiladoresAvailable,
      ventiladoresBusy,
      ventiladoresTotal,
      pctVentiladoresAvailable: (ventiladoresAvailable / ventiladoresTotal) * 100,
      pctVentiladoresBusy: (ventiladoresBusy / ventiladoresTotal) * 100,
      camasAvailable,
      camasBusy,
      camasBusyCovid19,
      camasBusyNonCovid19,
      camasTotal,
      pctCamasAvailable: (camasAvailable / camasTotal) * 100,
      pctCamasBusy: (camasBusy / camasTotal) * 100,
      pctCamasBusyCovid19: (camasBusyCovid19 / camasTotal) * 100,
      pctCamasBusyNonCovid19: (camasBusyNonCovid19 / camasTotal) * 100,
      hospitalizados: hosp,
      agesRow: agesRowDate,
    };
  });

  return rsp;
};
const getDataVaccines = async () => {
  const rows = await readCsv('https://raw.githubusercontent.com/juancri/covid19-vaccination/master/output/chile-vaccination.csv');
  const dates = (rows[0]).slice(2);
  const dataFirstDose = (rows[1]).slice(2);
  const dataSecondDose = (rows[2]).slice(2);
  let firstDose = 0;
  let secondDose = 0;
  const rsp = dates.map((date, index) => {
    const newFirstDose = parseInt(dataFirstDose[index] || 0, 10) - firstDose;
    const newSecondDose = parseInt(dataSecondDose[index] || 0, 10) - secondDose;
    firstDose = parseInt(dataFirstDose[index] || 0, 10);
    secondDose = parseInt(dataSecondDose[index] || 0, 10);
    return {
      date,
      firstDose,
      secondDose,
      total: firstDose + secondDose,
      newFirstDose,
      newSecondDose,
      newTotal: newFirstDose + newSecondDose,
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

  const currentFasesRows = await readCsv('https://raw.githubusercontent.com/pviojo/covid-fases/main/output/current_fases.csv');
  const currentFasePerComuna = currentFasesRows.slice(1).reduce((f, r) => {
    // eslint-disable-next-line no-param-reassign
    f[r[2]] = {
      fase: parseInt(r[5], 10),
      start: r[6],
      end: r[7],
      active_cases_start: r[8],
      active_cases_end: r[9],
      delta_active_cases: r[10],
      pct_delta_active_cases: r[11] / 100,
    };
    return f;
  }, {});

  const fasesRows = await readCsv('https://raw.githubusercontent.com/MinCiencia/Datos-COVID19/master/output/producto74/paso_a_paso.csv');
  const fasePerComuna = fasesRows.slice(1).reduce((f, r) => {
    // eslint-disable-next-line no-param-reassign
    f[r[2]] = parseInt(r[r.length - 1], 10);
    return f;
  }, {});

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
    r.fase = fasePerComuna[parseInt(r.comunaCode, 10)] || '';

    const cf = currentFasePerComuna[parseInt(r.comunaCode, 10)] || {};
    if (cf.active_cases_start) {
      cf.prevalence_active_cases_start = (cf.active_cases_start / r.population) * 100000;
    }
    if (cf.active_cases_end) {
      cf.prevalence_active_cases_end = (cf.active_cases_end / r.population) * 100000;
    }

    r.currentFase = cf;
    r.data = [];
    // let prevCases = 0;
    dates.map((d, i) => {
      // const t = parseInt(row[i + 5], 10);
      r.data.push({
        updatedAt: d,
        // totalCases: t,
        // newCases: t - prevCases,
        activeCases: parseInt(row[i + 5], 10),
        prevalenceActiveCases: Math.round(
          (parseInt(row[i + 5], 10) / (r.population / 100000)) * 10,
        ) / 10,
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
        minFase: 100,
        fases: [],
        byFase: {
          1: { population: 0 },
          2: { population: 0 },
          3: { population: 0 },
          4: { population: 0 },
          5: { population: 0 },
        },
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
    rsp[regionCode].minFase = Math.min(rsp[regionCode].minFase, parseInt(comuna.fase, 10));
    rsp[regionCode].fases.push(parseInt(comuna.fase, 10));
    rsp[regionCode].byFase[comuna.fase].population += parseInt(comuna.population, 10);

    return null;
  });

  Object.keys(rsp).map((k) => {
    rsp[k].data = Object.values(rsp[k].data).sort((a, b) => (a.updatedAt < b.updatedAt ? -1 : 1));
    rsp[k].avgFase = Math.round(
      rsp[k].fases.reduce((a, b) => a + b, 0) / rsp[k].fases.length,
    );
    rsp[k].modeFase = Math.min(...mode(rsp[k].fases));
    rsp[k].re = {};
    return null;
  });

  let rows = await readCsv('https://raw.githubusercontent.com/MinCiencia/Datos-COVID19/master/output/producto54/r.provincial_n.csv');
  rows = rows.slice(1);
  const re = {};
  rows.map((r) => {
    const provinciaCode = r[3];
    const d = r[4];
    if (!re[provinciaCode]) {
      const region = r[0];
      const regionCode = `${r[1] < 10 ? '0' : ''}${r[1]}`;
      const provincia = r[2];
      re[provinciaCode] = {
        region,
        regionCode,
        provincia,
        provinciaCode,
        data: [],
      };
    }
    const estimado = r[5];
    const liminf = r[6];
    const limsup = r[7];
    const liminf80 = r[8];
    const limsup80 = r[9];
    re[provinciaCode].data.push({
      updatedAt: d,
      estimado,
      b: 1,
      liminf,
      limsup,
      liminf80,
      limsup80,
    });
    return null;
  });
  Object.keys(re).map((k) => {
    const regionCode = re[k].regionCode;
    const provinciaCode = re[k].provinciaCode;
    rsp[regionCode].re[provinciaCode] = re[k];
    return null;
  });

  const camasRow = (await readCsv('https://raw.githubusercontent.com/MinCiencia/Datos-COVID19/master/output/producto58/Camas_UCI_diarias_std.csv')).filter((x) => x[0] !== 'Total' && x[0] !== 'Region');
  const camasRegion = {};
  camasRow.map((x) => {
    if (x[0] === 'Total') {
      return;
    }
    if (!camasRegion[x[0]]) {
      camasRegion[x[0]] = {};
    }
    if (!camasRegion[x[0]][x[2]]) {
      camasRegion[x[0]][x[2]] = {
        updatedAt: x[2],
        total: 0,
        available: 0,
        busy: 0,
        busyCovid19: 0,
        busyNonCovid19: 0,
      };
    }
    if (x[1] === 'Camas UCI habilitadas') {
      camasRegion[x[0]][x[2]].total = parseInt(x[3], 10);
    }
    if (x[1] === 'Camas UCI ocupadas COVID-19') {
      camasRegion[x[0]][x[2]].busyCovid19 = parseInt(x[3], 10);
    }
    if (x[1] === 'Camas UCI ocupadas no COVID-19') {
      camasRegion[x[0]][x[2]].busyNonCovid19 = parseInt(x[3], 10);
    }
    if (x[1] === 'Camas UCI ocupadas') {
      camasRegion[x[0]][x[2]].busy = parseInt(x[3], 10);
    }

    camasRegion[x[0]][x[2]].busy = camasRegion[x[0]][x[2]].busyNonCovid19
      + camasRegion[x[0]][x[2]].busyCovid19;
    camasRegion[x[0]][x[2]].available = camasRegion[x[0]][x[2]].total
      - camasRegion[x[0]][x[2]].busy;
    // eslint-disable-next-line consistent-return
    return null;
  });

  Object.keys(camasRegion).map((k) => {
    const regionCode = nameCodeRegion[k];
    rsp[regionCode].camas = Object.values(camasRegion[k]);
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
          pcr: 0,
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

  rows = await readCsv('https://raw.githubusercontent.com/MinCiencia/Datos-COVID19/master/output/producto7/PCR.csv');
  dates = rows[0].slice(3);
  rows = rows.slice(1);
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
          pcr: 0,
          newCaseWithSymptoms: 0,
          newCaseWithoutSymptoms: 0,
        };
      }
      rsp[regionCode].data[d].pcr = parseInt(row[i + 3], 10);
      // eslint-disable-next-line max-len
      rsp[regionCode].data[d].positivity = (rsp[regionCode].data[d].pcr && rsp[regionCode].data[d].newCases)
        ? rsp[regionCode].data[d].newCases / rsp[regionCode].data[d].pcr
        : 0;
      return null;
    });
    return null;
  });

  Object.keys(rsp).map((k) => {
    rsp[k].data = Object.values(rsp[k].data).sort((a, b) => (a.updatedAt < b.updatedAt ? -1 : 1));
    rsp[k].data = avgLast(rsp[k].data, 7, 'pcr', 'avg7DPCR');
    rsp[k].data = avgLast(rsp[k].data, 7, 'newCases', 'avg7DNewCases');
    rsp[k].data = rsp[k].data.map((x) => ({
      ...x,
      avg7DPositivity: (x.avg7DNewCases && x.avg7DPCR)
        ? x.avg7DNewCases / x.avg7DPCR
        : 0,
    }));
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
  data = avgLast(data, 21, 'newCases', 'avg21DNewCases');
  data = avgLast(data, 28, 'newCases', 'avg28DNewCases');
  data = avgLast(data, 35, 'newCases', 'avg35DNewCases');
  data = avgLast(data, 42, 'newCases', 'avg42DNewCases');

  data = avgLast(data, 7, 'newCasesWithSymptoms', 'avg7DNewCasesWithSymptoms');
  data = avgLast(data, 14, 'newCasesWithSymptoms', 'avg14DNewCasesWithSymptoms');

  data = avgLast(data, 7, 'newCasesWithoutSymptoms', 'avg7DNewCasesWithoutSymptoms');
  data = avgLast(data, 14, 'newCasesWithoutSymptoms', 'avg14DNewCasesWithoutSymptoms');

  data = avgLast(data, 7, 'newDeathsCovid', 'avg7DayDeathsCovid');
  data = avgLast(data, 7, 'positivity', 'avg7DPositivity');
  data = avgLast(data, 14, 'positivity', 'avg14DPositivity');
  data = avgLast(data, 7, 'testsPCR', 'avg7DtestsPCR');
  data = avgLast(data, 14, 'testsPCR', 'avg14DtestsPCR');

  data = avgLast(data, 7, 'deaths', 'avg7DDeaths');
  data = avgLast(data, 14, 'deaths', 'avg14DDeaths');

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
  let vaccinesData = await getDataVaccines();
  vaccinesData = avgLast(vaccinesData, 7, 'newFirstDose', 'avg7DNewFirstDose');
  vaccinesData = avgLast(vaccinesData, 7, 'newSecondDose', 'avg7DNewSecondDose');
  vaccinesData = avgLast(vaccinesData, 7, 'newTotal', 'avg7DNewTotal');
  return {
    dailyData: data,
    vaccinesData,
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
