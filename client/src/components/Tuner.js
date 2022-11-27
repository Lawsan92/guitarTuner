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

const standard = {
  E: 82.41,
  A: 110,
  D: 146.8,
  G: 196,
  B: 246.9,
  e: 329.6
}

const dropD = {
  D: 73.42,
  A: 110,
  D: 146.8,
  G: 196,
  B: 246.9,
  E: 329.6
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


/*Low E String */
  const [ENote, setENote] = useState("E");
  const [Epitch, setEPitchScale] = useState("2");
  const [findingE, startFindingE] = useState(false);
  const [onKey, isOnKey] = useState('Good');

  const isE = () => {
    let pitchValue  = Number(pitch.split('').slice(0, -3).join(''));
    // console.log('isE{pitch}:', pitchValue)
    if (standard.E - 5 <= pitchValue && pitchValue <= standard.E + 5) {
      isOnKey('GOOD');
    } else if (pitchValue <= standard.E - .2) {
      isOnKey('b');
    } else if (pitchValue >= standard.E - .2) {
      isOnKey('#');
    }
  }
  if (findingE) {setInterval(isE, 100)};




/*////UPDATES PITCH////*/
const updatePitch = (time) => {
  analyserNode.getFloatTimeDomainData(buf);
  var ac = autoCorrelate(buf, audioCtx.sampleRate);
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
    console.log(note, sym, scl, dtune, ac);
  }
};

// repeatedly updates the pitch every 1ms
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
            style={ (findingE && onKey === 'b' || findingE && onKey === '#' ) ? {color: 'red'} : (findingE && onKey === 'GOOD' ? {color: 'lightgreen'} :{color: 'black'} )}>
              {!findingE ? (pitchNote) : (ENote)}
              </span>
            <span className='note-number'>{!findingE ? (pitchScale) : (Epitch)}</span>
          </div>
          <div className='bottom-half'>
            <span className='meter-left' style={{
              width: (detune < 0 ? getDetunePercent(detune) : "50") + "%",
            }}></span>
            <span className='dial'>|</span>
            <span className='meter-right' style={{
              width: (detune > 0 ? getDetunePercent(detune) : "50") + "%",
            }}></span>
          </div>
          <div className='pitch-text'>
            <span>{!findingE ? (pitch) : (onKey)}</span>
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

    <div className='E-btn'>
    {!findingE ?
      (<button onClick={() => {startFindingE(true)}}>E</button>)
        :
      (<button onClick={() => {startFindingE(false)}}>E</button>)
      }
    </div>

    </div>
  )
}

export default Tuner;