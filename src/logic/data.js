import axios from 'axios';
import moment from 'moment';

export const getData = async () => {
  let data = await (axios.get('https://covid.tiopaul.io/data/resume_by_day.json').then((rsp) => rsp.data));
  const deathsCsv = await (axios.get('https://raw.githubusercontent.com/MinCiencia/Datos-COVID19/master/output/producto37/Defunciones.csv').then((rsp) => rsp.data));
  const rows = deathsCsv.trim().split('\n').map((row) => row.split(',')).filter((x) => !!x);
  const deathsByDay = (rows.pop()).slice(1);
  const dates = (rows[0]).slice(1);
  const deaths = {};
  let acc = 0;
  data = data.map((row, index) => ({
    ...row,
    ...{
      newCases: row.totalCases - (data[index + 1] ? data[index + 1].totalCases : 0),
    },
  }));
  deathsByDay.map((value, index) => {
    acc += parseInt(value || 0, 10);
    deaths[moment(dates[index]).add(21, 'hours').format()] = {
      newDeathsRC: parseInt(value || 0, 10),
      totalDeathsRC: acc,
    };
    return null;
  });

  data = data.map((row) => {
    if (deaths[row.updatedAt]) {
      return {
        ...{
          updatedAt: row.updatedAt,
          totalCases: row.totalCases,
          newCases: row.newCases,
        },
        ...deaths[row.updatedAt],
      };
    }
    return {
      updatedAt: row.updatedAt,
      totalCases: row.totalCases,
      newCases: row.newCases,
    };
  });
  data = data.map((row) => ({
    ...row,
    totalDeaths: row.totalDeathsRC,
    lethality: row.totalDeathsRC / row.totalCases,
  }));
  return data;
};

export default {
  getData,
};
