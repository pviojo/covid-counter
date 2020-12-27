import moment from 'moment';

export const maxWeekly = (data, field) => {
  const rsp = {};
  data.map((r) => {
    const w = moment(r.updatedAt).format('YYYY-WW');
    if (!rsp[w]) {
      rsp[w] = {
        updatedAt: w,
        [field]: r[field],
      };
    } else if (r[field] > rsp[w][field]) {
      rsp[w][field] = r[field];
    }
    return null;
  });
  return Object.values(rsp);
};

export const delta = (data, offset, field) => {
  const rsp = data.map((r, i) => {
    if (i < offset) {
      return null;
    }
    return {
      ...r,
      [field]: r[field] / data[i - offset][field] - 1,
    };
  }).filter((x) => !!x);
  return rsp;
};

export default {
  maxWeekly,
};
