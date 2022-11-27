const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
// a method of the BaseAudiContext that creates an Analysernode, which can be used to expose audio time and frequency data and create data visualizations.
let analyser = audioCtx.createAnalyser();

analyser.fftSize = 2048;

const AudioContext = {

  getAudioContext () {
    return audioCtx;
  },
  getAnalyser () {
    return analyser;
  },
  resetAnalyser() {
    analyser = audioCtx.createAnalyser();
  },

  decodeAudioData(audioData) {
    audioCtx.decodeAudioData(audioData).then(function (decodedData) {
      // use the decoded data here
    });
  },

}

module.exports = AudioContext;