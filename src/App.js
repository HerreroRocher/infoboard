import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [currentTime, setCurrentTime] = useState('');
  const [currentHour, setCurrentHour] = useState(0);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const hoursInt = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
      setCurrentHour(hoursInt);
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="App">
      <Description time={currentTime} />
      <Weather hour={currentHour} />
      <div className="bustimebox-container">
        <BusTimeBox stopId="490003564W" />
        <BusTimeBox stopId="490003564E" />
        <BusTimeBox stopId="490015187F" />
      </div>
      <LineStatusContainer />
    </div>
  );
}

function Description({ time }) {
  return (
    <header className="App-header">
      <p className="app-title">Daniel's infoboard using React JS</p>
      <p className="app-time">{time}</p>
    </header>
  );
}

function Weather({ hour }) {
  const [conditions, setConditions] = useState([]);

  const boxes = conditions.slice(hour, hour + 18).map((condition, index) => (
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
    const localTimeFull = datehourmin;
    // console.log("localTimeFull: ", localTimeFull)
    const spaceIndex = localTimeFull.indexOf(' ');
    const localTimeHourMin = localTimeFull.slice(spaceIndex + 1);
    // console.log("localTimeHourMin: ", localTimeHourMin)
    const colonIndex = localTimeHourMin.indexOf(':');
    const localTimeHour = localTimeHourMin.slice(0, colonIndex);
    // console.log("localTimeHour: ", localTimeHour)

    const localTimeHourStr = (localTimeHour.length === 1 ? "0" + localTimeHour : localTimeHour);
    const localTimeHourInt = parseInt(localTimeHourStr[0] === "0" ? localTimeHourStr[1] : localTimeHourStr);
    // console.log(localTimeHour[0] === "0")
    // console.log(localTimeHour)
    // console.log(localTimeHour[1])

    // console.log("localTimeHourStr", localTimeHourStr)
    // console.log("localTimeHourInt", localTimeHourInt)

    return (int ? localTimeHourInt : localTimeHourStr);
  }

  useEffect(() => {
    fetch("https://api.weatherapi.com/v1/forecast.json?key=a90a46dca4824a389b735402242907&q=London&days=2&aqi=no")
      .then(response => {
        // console.log("Raw response: ", response)
        return response.json();
      })
      .then(data => {
        // console.log("Parsed Response", data)
        let conditions = [];
        for (let x = 0; x < 2; x++) {
          const hourlyData = data.forecast.forecastday[x].hour;
          for (let i = 0; i < hourlyData.length; i++) {
            const time = hourlyData[i].time;
            const conditionText = hourlyData[i].condition.text;
            const conditionIcon = hourlyData[i].condition.icon;

            const hourObject = {
              "time": time,
              "conditionText": conditionText,
              "conditionIcon": conditionIcon
            };

            conditions.push(hourObject);
          }
        }

        // console.log("Conditions: ", conditions)
        setConditions(conditions);
      });
  }, []);

  return (
    <div className="weather">
      {boxes}
    </div>
  );
}

function BusTimeBox({ stopId }) {
  const [busTimes, setBusTimes] = useState([]);
  const contentRef = useRef(null);

  const fetchBusTimes = () => {
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

    // console.log("Bus times updated!")
  };

  useEffect(() => {
    // Initial fetch
    fetchBusTimes();

    // Set up an interval to fetch data every 15 seconds
    const intervalId = setInterval(fetchBusTimes, 15000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [stopId]);

  useEffect(() => {
    const contentHeight = contentRef.current.clientHeight;
    const busTimeHeight = 50;
    const maxBusTimes = Math.floor(contentHeight / busTimeHeight);

    setBusTimes(busTimes.slice(0, maxBusTimes + 4));
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
          <BusTime key={index} busName={bus.lineName} busTime={`${Math.floor(bus.timeToStation / 60)} mins`} destinationName={bus.destinationName} />
        ))}
      </div>
    </div>
  );
}

function BusTime({ busName, busTime, destinationName }) {
  return (
    <div className='bustime-one'>
      <div className='busName'>{busName} to {destinationName} </div>
      <div className='busTime'>{busTime === "0 mins" ? "due" : (busTime === "1 mins" ? "1 min" : busTime)}</div>
    </div>
  );
}

function LineStatusContainer() {
  const [linesInfo, setLinesInfo] = useState([]);
  /*Array like [{name: "Northern", severityStatusDescription: "Good Service", ...}, 
  {name: "Piccadilly", severityStatusDescription: "Bad Service", ...} ]*/

  const [linesShowing, setLinesShowing] = useState(["piccadilly"]);
  /*Array like ["'Picccadilly', 'Victoria', 'Northern'"]*/

  const [lineList, setLineList] = useState("failed");
  /*Array of approved lines like ["'Picccadilly', 'Victoria', 'Northern'"]*/

  const fetchLineInfo = () => {
    fetch(`https://api.tfl.gov.uk/Line/Mode/tube/Status`)
      .then((response) => {
        // console.log("Unparsed response: ", response)
        return response.json();
      })
      .then((data) => {
        // console.log("JSON Parsed response: ", data)

        let allLineStatuses = [];

        data.map((datum, index) => {
          if (datum) {
            const updatedLineStatus = {
              name: datum.name,
              id: datum.id,
              statusSeverity: datum.lineStatuses[0].statusSeverity,
              statusSeverityDescription: datum.lineStatuses[0].statusSeverityDescription,
              reason: datum.lineStatuses[0].reason
            };

            allLineStatuses.push(updatedLineStatus);
          }
        });

        // console.log("allLineStatuses: ", allLineStatuses)
        setLinesInfo(allLineStatuses);

        let lines = "";

        for (const line of allLineStatuses) {
          lines += line.name + ", ";
        }

        lines = lines.slice(0, -2);

        setLineList(lines);
      })
      .catch(error => console.error('Error fetching line statuses:', error));
  };

  useEffect(() => {
    fetchLineInfo();

    const intervalId = setInterval(fetchLineInfo, 6000);

    return () => clearInterval(intervalId);
  }, [lineList]);

  function removeLine(lineName) {
    const isConfirmed = window.confirm(`Are you sure you want to remove the ${lineName} line?`);

    const newLinesShowing = linesShowing.filter(lineNameShowing => lineNameShowing.toLowerCase() !== lineName.toLowerCase());
    if (isConfirmed) {
      setLinesShowing(newLinesShowing);
    }
  }

  function addLine() {
    let lineName = prompt("Enter a line name you would like to add (Piccadilly, Victoria, Hammersmith & City, etc.");

    if (lineName == null || lineName.trim() === "") {
      return;
    }

    const normalizedLineName = lineName.toLowerCase().trim();
    if (linesShowing.includes(normalizedLineName)) {
      alert("This line is already showing.");
      return;
    }

    let validLine = false;
    for (let lineIndex = 0; lineIndex < linesInfo.length; lineIndex++) {
      if (linesInfo[lineIndex].name.toLowerCase() === lineName.toLowerCase()) {
        const newLinesShowing = [...linesShowing, normalizedLineName];
        setLinesShowing(newLinesShowing);
        validLine = true;
        break;
      }
    }

    if (!validLine) {
      alert("Invalid line name.");
    }
  }

  return (
    <div className="line-status-container">
      <div className="line-status-header">
        <h2>Tube Line Status</h2>
        <button onClick={addLine}>Add Line</button>
      </div>
      <div className="line-status-list">
        {linesInfo.filter(line => linesShowing.includes(line.name.toLowerCase())).map((line, index) => (
          <div key={index} className={`line-status-item ${line.statusSeverity.toLowerCase()}`}>
            <div className="line-name">{line.name}</div>
            <div className="line-status">{line.statusSeverityDescription}</div>
            <button onClick={() => removeLine(line.name)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
