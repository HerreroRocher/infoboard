import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <Description /> {/* Description component for the header */}
      <Weather /> {/* Weather component to display weather info */}
      <div className="bustimebox-container"> {/* Container for the bus time boxes */}
        <BusTimeBox /> {/* First bus time box */}
        <BusTimeBox /> {/* Second bus time box */}
        <BusTimeBox /> {/* Third bus time box */}
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

function BusTimeBox() {

  return (
    <div className="bustimebox">
      <div className="bustimebox-name">
        <p>Pymmes Road </p>
        <p>towards Arnos Grove Or Bounds Green</p>
      </div>
      <div className="bustimebox-content" >
        <BusTime />
        <BusTime />
        <BusTime />
        <BusTime />
        <BusTime />
        <BusTime />


      </div>
    </div>
  )
}

function BusTime() {
  const busTime = [["34"], ["2 mins"]];

  return (
    <div className='bustime-one'>
      <div className='busName'>{busTime[0]}</div>
      <div className='busTime'>{busTime[1]}</div>
    </div>
  )

}

export default App;
