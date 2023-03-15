export const tunings = {
  'Standard': {
    module: {
      E: 82.41,
      A: 110,
      D: 146.8,
      G: 196,
      B: 246.9,
      e: 329.6
    },
    name: 'Standard',
    strings: [['E', 2], ['A', 2], ['D', 3], ['G', 3], ['B', 3], ['e', 4]]
  },
  '1/2 step down': {
    module: {
      Eb: 77.78,
      Ab: 103.83,
      Db: 138.59,
      Gb: 185,
      Bb: 233.08,
      eb: 311.13
    },
    name: '1/2 step down',
    strings: [['Eb', 2], ['Ab', 2], ['Db', 3], ['Gb', 3], ['Bb', 3], ['eb', 4]]
  },
  'Drop D': {
    module: {
      D: 73.42,
    A: 110,
    D: 146.8,
    G: 196,
    B: 246.9,
    e: 329.6
    },
    name: 'Drop D',
    strings: [['D', 2], ['A', 2], ['D', 3], ['G', 3], ['B', 3], ['e', 4]]
  }
};
