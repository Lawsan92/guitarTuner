const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
// a method of the BaseAudioContext that creates an Analysernode, which can be used to expose audio time and frequency data and create data visualizations.
let analyser = audioCtx.createAnalyser();

analyser.fftSize = 2048;

const AudioContext = {
  getAudioContext: () => {
    return audioCtx;
  },
  getAnalyser: () => {
    return analyser;
  },
  resetAnalyser: () => {
    analyser = audioCtx.createAnalyser();
  },
  decodeAudioData: (audioData) => {
    audioCtx.decodeAudioData(audioData)
    .then((decodedData) => {
      // use the decoded data here
    });
  }
};

export { AudioContext };