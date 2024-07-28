import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <Description /> {/* Description component for the header */}
      <Weather /> {/* Weather component to display weather info */}
      <div className="bustimebox-container"> {/* Container for the bus time boxes */}
        <BusTimeBox float="left" /> {/* First bus time box */}
        <BusTimeBox float="center" /> {/* Second bus time box */}
        <BusTimeBox float="right" /> {/* Third bus time box */}
      </div>
    </div>
  );
}

function Description() {
  return (
    <header className="App-header">
      <p>
        Daniel's infoboard using ReactJS {/* The main header text */}
      </p>
    </header>
  )
}

function Weather() {
  const boxes = Array.from({ length: 13 }, (_, index) => (
    <div key={index} className="weather-box">
      <div className="weather-box-hour">
        Hour +{index} {/* Label each box */}
      </div>
      <div className="weather-box-weather">
        Weather
      </div>
    </div>
  ));

  return (
    <div className="weather">
      {boxes} {/* Render the 24 boxes */}
    </div>
  )
}

function BusTimeBox({ float }) {
  const busTimes = Array(8).fill("This is where the bus times will go"); // Create an array of placeholders

  return (
    <div className="bustimebox" style={{ float: { float } }}>
      <div className="bustimebox-name">
        <p>where a specific bus stop name will go</p>
      </div>
      <ul className="bustimebox-content">
        {busTimes.map((time, index) => (
          <li key={index}>{time} {/* Placeholder for bus times */}</li>
        ))}
      </ul>
    </div>
  )
}

export default App;
