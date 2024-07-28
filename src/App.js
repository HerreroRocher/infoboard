import logo from './logo.svg'; // Import the logo and styles
import './App.css'; // Import the CSS for styling

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
  return (
    <div className="weather">
      <p>
        This is where the weather will go {/* Placeholder for weather info */}
      </p>
    </div>
  )
}

function BusTimeBox({ float }) {
  return (
    <div className="bustimebox" style={{ float: { float } }}>
      <p>
        This is where a specific bus time will go {/* Placeholder for bus times */}
      </p>
    </div>
  )
}

export default App;
