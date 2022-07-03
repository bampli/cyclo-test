import React from 'react';
import './App.css';
import { SunburstChart } from './SunburstChart';
//import { ZoomableSunburst } from './ZoomableSunburst';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* <ZoomableSunburst/> */}
        <SunburstChart/>
      </header>
    </div>
  );
}

export default App;
