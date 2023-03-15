import React,  { useState } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { tunings } from '../data/tunings.js';

export const Navbar = ({ isOpen, setNavbar, tuningHeader, setHeader, strings, setStrings }) => {

  const toggleNavbar = () => {
    setNavbar(prevState => !prevState);
  };

  const[springs, api] = useSpring(() => ({
    from: { x: 200 }
  }))

  const handleSpring = () => {
    api.start({
      from: { x: 200 },
      to: { x: 0}
    })
  }

  const mapTuningNames = () => {
    return Object.keys(tunings).map((tuning) => {
      return (
        <li onClick={(e) => { setHeader(e.target.innerText); setStrings(tunings[tuning].strings)}}>
          {tuning}
        </li>
      );
    })
  }

 if (!isOpen) {
  return (
    <div className='navbar_button' onClick={() => {handleSpring(); toggleNavbar()}} >
      <div className='navbar_bar'/>
      <div className='navbar_bar'/>
      <div className='navbar_bar'/>
    </div>
  )
 } else {
  return (
    <animated.div className='navbar_body' style={{...springs}}>
      <ul>
        {mapTuningNames()}
      </ul>
    </animated.div>
  )
 }
};

