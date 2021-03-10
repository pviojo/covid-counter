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
      [field]: Math.round((r[field] / data[i - offset][field] - 1) * 100) / 100,
    };
  }).filter((x) => !!x);
  return rsp;
};

export const mergeByUpdatedAt = (a, b) => {
  const rsp = a.map((x) => {
    const f = b.find((y) => y.updatedAt === x.updatedAt);
    if (f) {
      return {
        a: x,
        b: f,
      };
    }
    return {
      a: x,
      b: {},
    };
  });
  return rsp;
};

export const mode = (arr) => [...new Set(arr)]
  .map((value) => [value, arr.filter((v) => v === value).length])
  .sort((a, b) => b[1] - a[1])
  .filter((v, i, a) => v[1] === a[0][1])
  .map((v) => v[0]);

export default {
  maxWeekly,
};
