import React, { useState, useEffect } from 'react';
import AudioContext from '../contexts/AudioContext.js';
import autoCorrelate from "../libs/AutoCorrelate.js";
import {
  noteFromPitch,
  centsOffFromPitch,
  getDetunePercent,
} from "../libs/Helpers.js";

const audioCtx = AudioContext.getAudioContext();
const analyserNode = AudioContext.getAnalyser();
const bufferlength = 2048;
let buf = new Float32Array(bufferlength);
let log = console.log.bind(console);

const noteStrings = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

const strings = [['E', 2], ['A', 2], ['D', 3], ['G', 3], ['B', 3], ['e', 4]];

const standard = {
  E: 82.41,
  A: 110,
  D: 146.8,
  G: 196,
  B: 246.9,
  e: 329.6
}

const Tuner = () => {

/*////AUDIO STATE////*/
  const [source, setSource] = useState(null);
  const [started, setStart] = useState(false);
  const [pitchNote, setPitchNote] = useState("C");
  const [pitchScale, setPitchScale] = useState("4");
  const [pitch, setPitch] = useState("0 Hz");
  const [detune, setDetune] = useState("0");
  const [notification, setNotification] = useState(false);


  const [note, setNote] = useState("C");
  const [Epitch, setEPitchScale] = useState("4");
  const [findingPitch, startFindingPitch] = useState(false);
  const [onKey, isOnKey] = useState('Play');

  const isStandard = () => {
    let ac = autoCorrelate(buf, audioCtx.sampleRate);
    if (ac > -1) {
      let pitchValue  = Number(pitch.split('').slice(0, -3).join(''));
      log('buf:', buf);
      log('audioCtx.sampleRate', audioCtx.sampleRate);
      log('ac:', ac);
      log('pitchValue:', pitchValue);
      if (standard[note] - .75 <= pitchValue && pitchValue <= standard[note] + .75) {
        isOnKey('GOOD');
      } else if (pitchValue <= standard[note] - .75) {
        isOnKey('b');
      } else if (pitchValue >= standard[note] - .75) {
        isOnKey('#');
      }
    }
  }
  if (findingPitch) {setInterval(isStandard, 100)};

const updatePitch = (time) => {
  analyserNode.getFloatTimeDomainData(buf);
  let ac = autoCorrelate(buf, audioCtx.sampleRate);
  if (ac > -1) {
    let note = noteFromPitch(ac);
    let sym = noteStrings[note % 12];
    let scl = Math.floor(note / 12) - 1;
    let dtune = centsOffFromPitch(ac, note);
    setPitch(parseFloat(ac).toFixed(2) + " Hz");
    setPitchNote(sym);
    setPitchScale(scl);
    setDetune(dtune);
    setNotification(false);
    // console.log(note, sym, scl, dtune, ac);
  }
};

setInterval(updatePitch, 1);

useEffect(() => {
  if (source) {
    source.connect(analyserNode);
  }
}, [source]);

const start = async () => {
  const input = await getMicInput();

  if (audioCtx.state === "suspended") {
    await audioCtx.resume();
  }
  setStart(true);
  setNotification(true);
  setTimeout(() => setNotification(false), 5000);
  setSource(audioCtx.createMediaStreamSource(input));
};

const stop = () => {
  source.disconnect(analyserNode);
  setStart(false);
};

const getMicInput = () => {
  return navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      autoGainControl: false,
      noiseSuppression: false,
      latency: 0,
    },
  });
};

  return (
    <div className='tuner'>
      <div className='notification' style={ notification ? {color:'white', backgroundColor: 'lightgrey'} : {color: 'white'}}>
      Please, bring your instrument near to the microphone!
      </div>
      <div className ='tuner-container'>
        <div className='screen'>
          <div className='top-half'>
            <span className='note-letter'
            style={ (findingPitch && onKey === 'b' || findingPitch && onKey === '#' ) ? {color: 'red'} : (findingPitch && onKey === 'GOOD' ? {color: 'lightgreen'} : {color: 'black'} )}>
              {!findingPitch ? (pitchNote) : (note)}
              </span>
            <span style={ (findingPitch && onKey === 'b' || findingPitch && onKey === '#' ) ? {color: 'red'} : (findingPitch && onKey === 'GOOD' ? {color: 'lightgreen'} : {color: 'black'} )}className='note-number'>{!findingPitch ? (pitchScale) : (Epitch)}</span>
          </div>
          <div className='bottom-half'>
            <span className='meter-left' style={{
              width: (detune < 0 ? getDetunePercent(detune) : "50") + "%",
            }}></span>
            <span style={ (findingPitch && onKey === 'b' || findingPitch && onKey === '#' ) ? {color: 'red'} : (findingPitch && onKey === 'GOOD' ? {color: 'lightgreen'} : {color: 'black'} )} className='dial'>|</span>
            <span className='meter-right' style={{
              width: (detune > 0 ? getDetunePercent(detune) : "50") + "%",
            }}></span>
          </div>
          <div className='pitch-text'>
            <span style={ (findingPitch && onKey === 'b' || findingPitch && onKey === '#' ) ? {color: 'red'} : (findingPitch && onKey === 'GOOD' ? {color: 'lightgreen'} : {color: 'black'} )}>{!findingPitch ? (pitch) : (onKey)}</span>
          </div>
        </div>
      </div>
      <div className='tuning-btn'>
        {!started ?
        (<button onClick={() => {start()}}>Start</button>)
          :
        (<button onClick={() => {stop()}}>Stop</button>)
        }
      </div>
      <div>
      {strings.map((string) => {
        return (
          <div className='string'>
          {!findingPitch ?
            (<button onClick={(e) => {startFindingPitch(true); setNote(string[0]); setPitchScale(string[1])}}> {string[0]} </button>)
              :
            (<button onClick={() => {startFindingPitch(false)}}>{string[0]}</button>)
            }
          </div>
          )
        })}
      </div>
    </div>
  )


}

export default Tuner;

