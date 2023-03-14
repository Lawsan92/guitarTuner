import React, { useState } from 'react';
import Landing from './Landing.js';
import Tuner from './Tuner.js';
import '../../dist/scss/styles.scss';

const App = () => {

  const [logoClicked, setPage] = useState(false);

  if (logoClicked) {
    return (
      <div className='app'>
        <Tuner/>
      </div>
    );
  } else {
    return (
      <div className='app'>
        <Landing logoClicked={logoClicked} setPage={setPage}/>
      </div>
    );
  }
}

export default App;