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
    color: '#338AD1',
    name: 'Apertura Avanzada',
  },
};

export default {
  pluck,
  faseData,
};
