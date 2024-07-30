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
      <LineStatusContainer />
    </div>
  );
}

function LineStatusContainer() {
  const [linesInfo, setLinesInfo] = useState([]);
  /*Array like [{name: "Northern", severityStatusDescription: "Good Service", ...}, 
  {name: "Piccadilly", severityStatusDescription: "Bad Service", ...} ]*/

  const [linesShowing, setLinesShowing] = useState(["piccadilly"]);
  /*Array like ["'Picccadilly', 'Victoria', 'Northern'"]*/



  useEffect(() => {

    fetch(`https://api.tfl.gov.uk/Line/Mode/tube/Status`)
      .then((response) => {
        // console.log("Unparsed response: ", response)
        return response.json()
      })
      .then((data) => {
        // console.log("JSON Parsed response: ", data)

        let allLineStatuses = [];

        data.map((datum, index) => {
          if (datum) {
            const updatedLineStatus = {
              name: datum.name,
              // crowding: datum.crowding,
              // disruptions: datum.disruptions,
              id: datum.id,
              statusSeverity: datum.lineStatuses[0].statusSeverity,
              statusSeverityDescription: datum.lineStatuses[0].statusSeverityDescription,
              reason: datum.lineStatuses[0].reason
            };

            // console.log(updatedLineStatus.name, "Line status:", updatedLineStatus)
            allLineStatuses.push(updatedLineStatus)
          }
        })

        setLinesInfo(allLineStatuses);

        // console.log("All lines statuses:", allLineStatuses);

      })

  }, [])

  function removeLine(lineName) {
    // console.log("REMOVE BUTTON SUCESSFULLY PRESSED")
    // console.log("Current lines: ", linesShowing)
    // console.log("Line to remove: ", lineName)
    const newLinesShowing = linesShowing.filter(lineNameShowing => lineNameShowing.toLowerCase() !== lineName.toLowerCase())
    // console.log("New Lines: ", newLinesShowing )
    setLinesShowing(newLinesShowing)
  }

  function addLine(lineName) {
    console.log("ADD BUTTON SUCESSFULLY PRESSED")
    // console.log("Current lines: ", linesShowing)
    console.log("Line to remove: ", lineName)
    const newLinesShowing = linesShowing.filter(lineNameShowing => lineNameShowing.toLowerCase() !== lineName.toLowerCase())
    console.log("New Lines: ", newLinesShowing )
    setLinesShowing(newLinesShowing)
  }

  return (
    <div className="line-status-container">
      {linesInfo ? (
        linesInfo.map((lineObject, index) => (
          (linesShowing.includes(lineObject.name.toLowerCase()) ?
            <LineStatusBox lineObject={lineObject} key={index} handleRemoveLine={removeLine} />
            : null)
        ))
      ) : (
        <p>Loading...</p>
      )}

      <div className='add-line'>
        <button className='add-line-button'>+</button>
      </div>
    </div>
  )
}

function LineStatusBox({ lineObject, handleRemoveLine }) {

  return (
    <div className="line-status-box">
      <div className="line-status-content">
        <div className="line-name">
          {lineObject.name} Line
          <button className="remove-line-button" onClick={() => handleRemoveLine(lineObject.name)}>-</button>
        </div>
        <div className="status">{lineObject.statusSeverityDescription}</div>
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
  const [conditions, setConditions] = useState([]); // State for bus times
  const [localTime, setLocalTime] = useState(0)


  const boxes = conditions.slice(localTime, localTime + 13).map((condition, index) => (
    <div key={index} className="weather-box">
      <div className="weather-box-hour">
        <b>{formatTime(condition.time, false)}</b>
      </div>
      <div className="weather-box-weather">
        <img className='condition-icon' src={condition.conditionIcon} alt={condition.conditionText}></img>
      </div>
    </div>
  ));

  function formatTime(datehourmin, int) {
    const localTimeFull = datehourmin
    // console.log("localTimeFull: ", localTimeFull)
    const spaceIndex = localTimeFull.indexOf(' ');
    const localTimeHourMin = localTimeFull.slice(spaceIndex + 1)
    // console.log("localTimeHourMin: ", localTimeHourMin)
    const colonIndex = localTimeHourMin.indexOf(':');
    const localTimeHour = localTimeHourMin.slice(0, colonIndex)
    // console.log("localTimeHour: ", localTimeHour)  

    const localTimeHourStr = (localTimeHour.length == 1 ? "0" + localTimeHour : localTimeHour)
    const localTimeHourInt = parseInt(localTimeHourStr[0] == "0" ? localTimeHourStr[1] : localTimeHourStr)
    // console.log(localTimeHour[0] == "0")
    // console.log(localTimeHour)
    // console.log(localTimeHour[1])

    // console.log("localTimeHourStr", localTimeHourStr)
    // console.log("localTimeHourInt", localTimeHourInt)

    return (int ? localTimeHourInt : localTimeHourStr)
  }


  useEffect(() => {
    fetch("https://api.weatherapi.com/v1/forecast.json?key=a90a46dca4824a389b735402242907&q=London&days=2&aqi=no")
      .then(response => {
        // console.log("Raw response: ", response)
        return response.json()
      })
      .then(data => {

        // console.log("TIME:", formatTime(data.location.localtime, true), "TYPE", typeof (formatTime(data.location.localtime, true)))

        setLocalTime(formatTime(data.location.localtime, true))
        // setLocalTime(7)



        // console.log("Parsed Response", data)
        let conditions = [];
        for (let x = 0; x < 2; x++) {
          const hourlyData = data.forecast.forecastday[x].hour
          for (let i = 0; i < hourlyData.length; i++) {
            const time = hourlyData[i].time
            const conditionText = hourlyData[i].condition.text
            const conditionIcon = hourlyData[i].condition.icon

            const hourObject = {
              "time": time,
              "conditionText": conditionText,
              "conditionIcon": conditionIcon
            }

            conditions.push(hourObject)

          }

        }

        // console.log("Conditions: ", conditions)
        setConditions(conditions)

      })
  }, []);

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
    // console.log("Fetching bus times...");

    // Log the initial fetch request (Note: This will log the Promise, not the actual data)
    // console.log("Initial fetch request:", fetch(`https://api.tfl.gov.uk/StopPoint/${stopId}/Arrivals`).then(response => response.json()));

    // Fetch bus times from TfL API
    fetch(`https://api.tfl.gov.uk/StopPoint/${stopId}/Arrivals`)
      .then(response => {
        // Log the raw response
        // console.log("Raw response:", response);
        return response.json();
      })
      .then(data => {
        // Log the parsed JSON data
        // console.log("Parsed data:", data);

        // Sort the bus times by arrival time
        const sortedData = data.sort((a, b) => a.timeToStation - b.timeToStation);

        // Log the sorted data
        // console.log("Bus Times:", sortedData);

        // Set the sorted bus times into state
        setBusTimes(sortedData);

        // Log the updated busTimes state
        // console.log("Updated busTimes state:", sortedData);
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
      <div className='busTime'>{busTime === "0 mins" ? "due" : (busTime === "1 mins" ? "1 min" : busTime)}</div>
    </div>
  )
}



export default App;
