import React, { useState, useEffect } from 'react';
import { AudioContext }from '../contexts/AudioContext.js';
import autoCorrelate from "../libs/AutoCorrelate.js";
import { Navbar } from './Navbar.js';
import { tunings } from '../data/tunings.js';
import {
  noteFromPitch,
  centsOffFromPitch,
  getDetunePercent,
} from "../libs/Helpers.js";

//  WEB AUDIO API functions
const audioCtx = AudioContext.getAudioContext();
const analyserNode = AudioContext.getAnalyser();
const bufferlength = 2048;
let buf = new Float32Array(bufferlength);
let log = console.log.bind(console);


const noteStrings = [ "C", "C#","D", "D#", "E", "F", "F#", "G", "G#","A", "A#", "B" ];

const strings = [['E', 2], ['A', 2], ['D', 3], ['G', 3], ['B', 3], ['e', 4]];

const Tuner = () => {

/*////AUDIO STATE////*/
  const [source, setSource] = useState(null);
  const [started, setStart] = useState(false);
  const [pitchNote, setPitchNote] = useState("-");
  const [pitchScale, setPitchScale] = useState("");
  const [pitch, setPitch] = useState("-");
  const [detune, setDetune] = useState("0");
  const [notification, setNotification] = useState(false);


  const [note, setNote] = useState("C");
  const [Epitch, setEPitchScale] = useState("4");
  const [findingPitch, startFindingPitch] = useState(false);
  const [onKey, isOnKey] = useState('Play');

  const [isOpen, setNavbar] = useState(false);

  const [tuningHeader, setHeader] = useState();

  const styles = {
    neutral: {
      color: 'white',
      filter: 'drop-shadow(rgba(255, 255, 255, 0.4) 0px 4px 4px)'
    },
    offKey: {
      color: 'red',
      filter: 'drop-shadow(rgba(255, 0, 0, 0.4) 0px 4px 4px)'
    },
    onKey: {
      color: 'lightgreen',
      filter: 'drop-shadow(rgba(0, 255, 0, 0.4) 0px 4px 4px)'
    },
    dial: {
      neutral: '40px solid white',
      offKey: '40px solid red',
      onKey: '40px solid lightgreen',
    }
  }

  const isStandard = () => {
    let ac = autoCorrelate(buf, audioCtx.sampleRate);
    if (ac > -1) {
      let pitchValue  = Number(pitch.split('').slice(0, -3).join(''));
      // log('buf:', buf);
      // log('audioCtx.sampleRate', audioCtx.sampleRate);
      // log('ac:', ac);
      // log('pitchValue:', pitchValue);
      if (tunings.Standard.module[note] - 2 <= pitchValue && pitchValue <= tunings.Standard.module[note] + 2) {
        isOnKey('GOOD');
      } else if (pitchValue <= tunings.Standard.module[note] - 2) {
        isOnKey('b');
      } else if (pitchValue >= tunings.Standard.module[note] - 2) {
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
    setdialPos();
  }
}, [source]);

//======== BUTTON ========
const TunerButton = () => {

  const styles = {
    on: {
      backgroundColor: '#fff',
      color: '#5D81A3',
      opacity: 1
    },
    off: {
      backgroundColor: '#5D81A3',
      color: '#fff',
      opacity: 0.4
    }
  }

  return (
    <>
      {!started ?
        (<button className='tuner_btn' onClick={start} style={styles.off}>Start</button>)
          :
        (<button className='tuner_btn' onClick={stop} style={styles.on}>Stop</button>)
      }
    </>
  );
};

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

const pitchStyle = () => {
  if (started) {
    return (findingPitch && onKey === 'b' || findingPitch && onKey === '#' ) ? styles.offKey : (findingPitch && onKey === 'GOOD' ? styles.onKey : styles.neutral );
  } else {
    return styles.neutral;
  }
};

const [dialPos, getPos] = useState(0);

const setdialPos = () => {
  if (!started) {
    return 0
  };
  let ac = autoCorrelate(buf, audioCtx.sampleRate);
  let pitchValue  = Number(pitch.split('').slice(0, -3).join(''));
  if (ac > -1) {
    return (tunings.Standard.module[note] - 2 <= pitchValue && pitchValue <= tunings.Standard.module[note] + 2) ? 0 : (pitchValue <= tunings.Standard.module[note] - 2 ? 200 : -200);
  }
};

const dialStyles = () => {
  if (!started) {
    return styles.dial.neutral;
  }
  return (findingPitch && onKey === 'b' || findingPitch && onKey === '#' ) ? styles.dial.offKey : (findingPitch && onKey === 'GOOD' ? styles.dial.onKey : styles.dial.neutral );
};

  return (
    <div className='tuner'>
      <div className='tuner_navbar'>
        <div className='tuner_tuning'>
          {tuningHeader}
        </div>
        <Navbar isOpen={isOpen} setNavbar={setNavbar} tuningHeader={tuningHeader} setHeader={setHeader} />
      </div>
      <div className='notification' style={ notification ? {color:'white', backgroundColor: 'lightgrey'} : {color: 'white'}}>
      Please, bring your instrument near to the microphone!
      </div>
      <div className ='tuner-container'>
        <div className='tuner_screen'>
          <div className='top-half'>
            <span className='note-letter'
            style={pitchStyle()}>
              {!findingPitch ? (pitchNote) : (note)}
              </span>
            <span style={pitchStyle()}className='note-number'>{pitchScale}</span>
          </div>
          <div className='bottom-half'>
            <div className='dial' style={{ right: `${setdialPos()}px`, borderBottom: dialStyles(), }}>
            </div>
          </div>
          <div className='pitch-text'>
            <span style={pitchStyle()}>{!findingPitch ? (pitch) : (<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}} ><span>{onKey}</span><span>{pitch}</span></div>)}</span>
          </div>
        </div>
      </div>
      <TunerButton/>
      <div className='tuner_strings'>
        {strings.map((string) => {
          return (
            <div>
            {!findingPitch ?
              (<button className='tuner_string' onClick={(e) => {startFindingPitch(true); setNote(string[0]); setPitchScale(string[1])}}> {string[0]} </button>)
                :
              (<button className='tuner_string' onClick={() => {startFindingPitch(false)}}>{string[0]}</button>)
              }
            </div>
            )
        })}
      </div>
    </div>
  );
}

export default Tuner;

