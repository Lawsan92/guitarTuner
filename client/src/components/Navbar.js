import React,  { useState } from 'react';

export const Navbar = ({ isOpen, setNavbar }) => {

  const toggleNavbar = () => {
    setNavbar(prevState => !prevState);
  };

 if (!isOpen) {
  return (
    <div className='navbar_button' onClick={toggleNavbar}>
      <div className='navbar_bar'/>
      <div className='navbar_bar'/>
      <div className='navbar_bar'/>
    </div>
  )
 } else {
  return (
    <div className='navbar_body'>
      <ul>
        <li>Standard</li>
        <li>1/2 step down</li>
        <li>Drop D</li>
        <li>Esus2</li>
      </ul>
    </div>
  )
 }
};

