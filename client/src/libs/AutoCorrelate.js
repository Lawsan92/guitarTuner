const autoCorrelate = (buf, sampleRate) => {
 const log = console.log.bind(console);
  let [SIZE, rms] = [buf.length, 0];
  for (let i = 0; i < SIZE; i++) {
    let val = buf[i];
    rms += val * val;
  }

  rms = Math.sqrt(rms / SIZE);

  if (rms < 0.01) {
    // not enough signal
    return -1;
  }

  let [r1, r2, thres] = [0, SIZE - 1, 0.2];

  for (let i = 0; i < SIZE / 2; i++)
    if (Math.abs(buf[i]) < thres) {
      r1 = i;
      break;
    }

  for (let i = 1; i < SIZE / 2; i++)
    if (Math.abs(buf[SIZE - i]) < thres) {
      r2 = SIZE - i;
      break;
    }



  buf = buf.slice(r1, r2);
  SIZE = buf.length;

  let c = new Array(SIZE).fill(0);
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE - i; j++) {
      c[i] = c[i] + buf[j] * buf[j + i];
    }
  }

  let d = 0;
  while (c[d] > c[d + 1]) {
    d++;
  }



  let [maxval, maxpos] = [-1, -1];

  for (let i = d; i < SIZE; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }

  let T0 = maxpos;

  let [x1, x2, x3] = [c[T0 - 1], c[T0], c[T0 + 1]];
  let [a, b] =[ (x1 + x3 - 2 * x2) / 2,  (x3 - x1) / 2]

  if (a) {
    T0 = T0 - b / (2 * a)
  };


  console.group("FFT group")
    log('buf:', buf)
    log('sampleRate:', sampleRate)
    log('rms:', rms)
    log('[r1, r2, thres]:', [r1, r2, thres])
    log('[c, d]:', [c, d])
    log('[maxval, maxpos]:', [maxval, maxpos])
    log('[x1, x2, x3]:', [x1, x2, x3]);
    log('[a, b]:', [a, b]);
    log('T0:', T0)
    log('sampleRate / T0:', sampleRate / T0)
  console.groupEnd();

  return sampleRate / T0;
};

module.exports = autoCorrelate;