export const pluck = (data, field) => data.map((i) => i[field]);

export const faseData = {
  1: {
    color: '#F75C5C',
    name: 'Cuarentena',
  },
  2: {
    color: '#FFBF01',
    name: 'Transición',
  },
  3: {
    color: '#A69B01',
    name: 'Preparación',
  },
  4: {
    color: '#338AD1',
    name: 'Apertura Inicial',
  },
  5: {
    color: '#082C5A',
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
