export const pluck = (data, field) => data.map((i) => i[field]);

export const faseData = {
  1: {
    color: '#F75C5C',
    colortr: '#F75C5C22',
    name: 'Cuarentena',
  },
  2: {
    color: '#FFBF01',
    colortr: '#FFBF0111',
    name: 'Transición',
  },
  3: {
    color: '#A69B01',
    colortr: '#A69B0122',
    name: 'Preparación',
  },
  4: {
    color: '#338AD1',
    colortr: '#338AD122',
    name: 'Apertura Inicial',
  },
  5: {
    color: '#082C5A',
    colortr: '#082C5A22',
    name: 'Apertura Avanzada',
  },
};

export const roundMillionOrThousands = (s) => {
  if (s > 1000000) {
    return `${parseInt(((s / 1000000) * 10), 10) / 10}M`;
  }
  return `${parseInt(((s / 1000)), 10)}K`;
};
export default {
  pluck,
  faseData,
};
