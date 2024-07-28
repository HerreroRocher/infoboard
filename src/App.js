import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import './App.css';

function App() {
  return (
    <div className="App">
      <Description />
      <Weather />
      <div className="bustimebox-container">
        <BusTimeBox stopId="490003564W" /> {/* Northbound stop ID */}
        <BusTimeBox stopId="490003564E" /> {/* Southbound stop ID */}
        <BusTimeBox stopId="490015187F" /> {/* Eastbound stop ID */}
      </div>
    </div>
  );
}

function Description() {
  return (
    <header className="App-header">
      <p>Daniel's infoboard using ReactJS</p>
    </header>
  )
}

function Weather() {
  const boxes = Array.from({ length: 13 }, (_, index) => (
    <div key={index} className="weather-box">
      <div className="weather-box-hour">
        Hour +{index}
      </div>
      <div className="weather-box-weather">
        Weather
      </div>
    </div>
  ));

  return (
    <div className="weather">
      {boxes}
    </div>
  )
}

function BusTimeBox({ stopId }) {
  const [busTimes, setBusTimes] = useState([]); // State for bus times
  const contentRef = useRef(null); // Ref to access the bustimebox-content div


  useEffect(() => {
    console.log("Fetching bus times...");

    // Log the initial fetch request (Note: This will log the Promise, not the actual data)
    console.log("Initial fetch request:", fetch(`https://api.tfl.gov.uk/StopPoint/${stopId}/Arrivals`).then(response => response.json()));

    // Fetch bus times from TfL API
    fetch(`https://api.tfl.gov.uk/StopPoint/${stopId}/Arrivals`)
      .then(response => {
        // Log the raw response
        console.log("Raw response:", response);
        return response.json();
      })
      .then(data => {
        // Log the parsed JSON data
        console.log("Parsed data:", data);

        // Sort the bus times by arrival time
        const sortedData = data.sort((a, b) => a.timeToStation - b.timeToStation);

        // Log the sorted data
        console.log("Sorted data:", sortedData);

        // Set the sorted bus times into state
        setBusTimes(sortedData);

        // Log the updated busTimes state
        console.log("Updated busTimes state:", sortedData);
      })
      .catch(error => {
        // Log any errors that occur during the fetch
        console.error('Error fetching bus times:', error);
      });
  }, [stopId]); // Dependency array, runs the effect when stopId changes

  useEffect(() => {
    const contentHeight = contentRef.current.clientHeight; // Get the height of the bustimebox-content div
    const busTimeHeight = 50; // Set the height of a single BusTime component in px
    const maxBusTimes = Math.floor(contentHeight / busTimeHeight); // Calculate the maximum number of BusTime components that can fit

    setBusTimes(busTimes.slice(0, maxBusTimes + 4)); // Render only the max number of BusTime components
  }, [busTimes.length]);

  return (
    <div className="bustimebox">
      <div className="bustimebox-name">
        {busTimes.length > 0 ? (
          <>
            <p className="bus-stop">Stop {busTimes[0].platformName}: {busTimes[0].stationName} </p>
            <p className="bus-towards"> towards {busTimes[0].towards} </p>
          </>
        ) : <p>Loading bus...</p>}

      </div>
      <div className="bustimebox-content" ref={contentRef}>
        {busTimes.map((bus, index) => (
          <BusTime key={index} busName={bus.lineName} busTime={`${Math.round(bus.timeToStation / 60)} mins`} destinationName={bus.destinationName} />
        ))}
      </div>
    </div>
  )
}

function BusTime({ busName, busTime, destinationName }) {
  return (
    <div className='bustime-one'>
      <div className='busName'>{busName} to {destinationName} </div>
      <div className='busTime'>{busTime === "0 mins" ? "due" : busTime}</div>
    </div>
  )
}

export default App;
