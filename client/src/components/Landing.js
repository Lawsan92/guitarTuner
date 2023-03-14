import React, { useState } from 'react';
import {Logo} from './Logo.js';

const Landing = ({ logoClicked, setPage }) => {

  return (
    <div className='landing'>
      <Logo logoClicked={logoClicked} setPage={setPage}/>
    </div>
  );
};

export default Landing;