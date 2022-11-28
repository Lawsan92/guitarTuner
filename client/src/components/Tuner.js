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
  const [onKey, isOnKey] = useState('Play');

  const isE = () => {
    let ac = autoCorrelate(buf, audioCtx.sampleRate); // <- cponverts buffers data into a single pitch value
    if (ac > -1) { // <- this is what triggers the tuner only if a certain sound level is reached
      let pitchValue  = Number(pitch.split('').slice(0, -3).join(''));
      // log('buf:', buf);
      // log('audioCtx.sampleRate', audioCtx.sampleRate);
      log('ac:', ac);
      log('pitchValue:', pitchValue);
      if (standard.E - .75 <= pitchValue && pitchValue <= standard.E + .75) {
        isOnKey('GOOD');
      } else if (pitchValue <= standard.E - .75) {
        isOnKey('b');
      } else if (pitchValue >= standard.E - .75) {
        isOnKey('#');
      }
    }
  }
  if (findingE) {setInterval(isE, 100)};


//   /*A String */
//   const [ANote, setANote] = useState("E");
//   const [Apitch, setAPitchScale] = useState("2");
//   const [findingA, startFindingA] = useState(false);

//   const isA = () => {
//     let ac = autoCorrelate(buf, audioCtx.sampleRate); // <- cponverts buffers data into a single pitch value
//     if (ac > -1) { // <- this is what triggers the tuner only if a certain sound level is reached
//       let pitchValue  = Number(pitch.split('').slice(0, -3).join(''));
//       log('buf:', buf);
//       log('audioCtx.sampleRate', audioCtx.sampleRate);
//       log('ac:', ac);
//       log('isA{pitch}:', pitchValue);
//       if (standard.A - .75 <= pitchValue && pitchValue <= standard.A + .75) {
//         isOnKey('GOOD');
//       } else if (pitchValue <= standard.A - .75) {
//         isOnKey('b');
//       } else if (pitchValue >= standard.A - .75) {
//         isOnKey('#');
//       }
//     }
//   }
//   if (findingA) {setInterval(isA, 100)};

/*////STANDARD TUNING////*/
const [standardNote, setStandardNote] = useState('');
const [standardPitch, setStandardPitch] = useState('');
const [findingStandard, startFindingStandard] = useState({finding: false, note: 'note'});

let pitchValue  = Number(pitch.split('').slice(0, -3).join(''));
log('pitchValue:', pitchValue);
  const standardTuning = (note) => {
    const standard = {
      E: [82.41, 2],
      A: [110, 2],
      D: [146.8, 3],
      G: [196, 3],
      B: [246.9, 3],
      e: [329.6, 4]
    }
    log('standardTuning{note}:', note);
    log('standard.note:', standard[note])

    let ac = autoCorrelate(buf, audioCtx.sampleRate);
    if (ac > -1) {
      if (standard.A - .75 <= pitchValue && pitchValue <= standard.A + .75) {
        isOnKey('GOOD');
      } else if (pitchValue <= standard.A - .75) {
        isOnKey('b');
      } else if (pitchValue >= standard.A - .75) {
        isOnKey('#');
      }
    }
  }
  if (findingStandard.finding) {setInterval(standardTuning(findingStandard.note), 100)};

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
            style={ (findingE && onKey === 'b' || findingE && onKey === '#' ) ? {color: 'red'} : (findingE && onKey === 'GOOD' ? {color: 'lightgreen'} : {color: 'black'} )}>
              {!findingE ? (pitchNote) : (ENote)}
              </span>
            <span style={ (findingE && onKey === 'b' || findingE && onKey === '#' ) ? {color: 'red'} : (findingE && onKey === 'GOOD' ? {color: 'lightgreen'} : {color: 'black'} )}className='note-number'>{!findingE ? (pitchScale) : (Epitch)}</span>
          </div>
          <div className='bottom-half'>
            <span className='meter-left' style={{
              width: (detune < 0 ? getDetunePercent(detune) : "50") + "%",
            }}></span>
            <span style={ (findingE && onKey === 'b' || findingE && onKey === '#' ) ? {color: 'red'} : (findingE && onKey === 'GOOD' ? {color: 'lightgreen'} : {color: 'black'} )} className='dial'>|</span>
            <span className='meter-right' style={{
              width: (detune > 0 ? getDetunePercent(detune) : "50") + "%",
            }}></span>
          </div>
          <div className='pitch-text'>
            <span style={ (findingE && onKey === 'b' || findingE && onKey === '#' ) ? {color: 'red'} : (findingE && onKey === 'GOOD' ? {color: 'lightgreen'} : {color: 'black'} )}>{!findingE ? (pitch) : (onKey)}</span>
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
      <div className='note-btn'>
      {!findingE ?
        (<button onClick={() => {startFindingE(true)}}>E</button>)
          :
        (<button onClick={() => {startFindingE(false)}}>E</button>)
        }
      </div>

      <div className='note-btn'>
      {!findingStandard.finding ?
        (<button onClick={(e) => {startFindingStandard({...findingStandard, finding: true, note: e.target.innerHTML})}}>A</button>)
          :
        (<button onClick={() => {startFindingStandard({...findingStandard, finding: false, note: 'note' })}}>A</button>)
        }
      </div>


      <div className='note-btn'>
      {!findingStandard.finding ?
        (<button onClick={(e) => {startFindingStandard({...findingStandard, finding: true, note: e.target.innerHTML})}}>D</button>)
          :
        (<button onClick={() => {startFindingStandard({...findingStandard, finding: false, note: 'note' })}}>D</button>)
        }
      </div>

      <div className='note-btn'>
      {!findingStandard.finding ?
        (<button onClick={(e) => {startFindingStandard({...findingStandard, finding: true, note: e.target.innerHTML})}}>G</button>)
          :
        (<button onClick={() => {startFindingStandard({...findingStandard, finding: false, note: 'note' })}}>G</button>)
        }
      </div>

      <div className='note-btn'>
      {!findingStandard.finding ?
        (<button onClick={(e) => {startFindingStandard({...findingStandard, finding: true, note: e.target.innerHTML})}}>B</button>)
          :
        (<button onClick={() => {startFindingStandard({...findingStandard, finding: false, note: 'note' })}}>B</button>)
        }
      </div>
      <div className='note-btn'>
      {!findingStandard.finding ?
        (<button onClick={(e) => {startFindingStandard({...findingStandard, finding: true, note: e.target.innerHTML})}}>e</button>)
          :
        (<button onClick={() => {startFindingStandard({...findingStandard, finding: false, note: 'note' })}}>e</button>)
        }
      </div>

    </div>
    </div>
  )
}

export default Tuner;
