import moment from 'moment';

export const maxWeekly = (data, processFields) => {
  const rsp = {};
  let fields = processFields;
  if (!Array.isArray(fields)) {
    fields = [fields];
  }
  data.map((r) => {
    const w = moment(r.updatedAt).format('YYYY-WW');
    if (!rsp[w]) {
      rsp[w] = {
        updatedAt: w,
      };
      fields.map((field) => {
        rsp[w][field] = r[field];
        return null;
      });
    } else {
      fields.map((field) => {
        if (r[field] > rsp[w][field]) {
          rsp[w][field] = r[field];
        }
        return null;
      });
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

export const avgLast = (array, n, key, averagedKey) => {
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

export const convertRowsToComunaDataObj = (rows, startColIndex, colComunaCodeIndex) => {
  const dates = rows[0].slice(startColIndex);
  const rsp = {};
  rows.map((r) => {
    if (!rsp[r[colComunaCodeIndex]]) {
      rsp[r[colComunaCodeIndex]] = {};
    }
    dates.map((d, i) => {
      rsp[r[colComunaCodeIndex]][d] = parseInt(r[startColIndex + i], 10);
      return null;
    });
    return null;
  });
  return rsp;
};
export default {
  maxWeekly,
};
