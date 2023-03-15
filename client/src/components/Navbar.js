import React,  { useState } from 'react';
import { animated, useSpring } from '@react-spring/web';

export const Navbar = ({ isOpen, setNavbar }) => {

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
        <li>Standard</li>
        <li>1/2 step down</li>
        <li>Drop D</li>
        <li>Esus2</li>
      </ul>
    </animated.div>
  )
 }
};

