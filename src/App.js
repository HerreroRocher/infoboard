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
      <BusTimeBoxContainer />
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
  const [conditions, setConditions] = useState([]); // State for weather conditions

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

function BusTimeBoxContainer() {
  const [stopIds, setStopIds] = useState(["490003564W", "490003564E", "490015187F"])

  function setStopID(stopName) {

    // expect stop name "muswell hill" "broawdfgs" "pymmes road" etc.  CASE INSENSITIVE, deal with errors

    const call = `https://api.tfl.gov.uk/StopPoint/Search?query=${encodeURIComponent(stopName)}&modes=bus`

    fetch(call)
      .then(response => response.json())
      .then(data => {
        // Assuming the first result is the correct one
        console.log(`Data received from fetch 1 (${call}):`, data);
        // const stopPoint = data.matches[0];
        // console.log('Stop Point:', stopPoint);
        const nameMatches = data.matches;
        // console.log("Name matches:", nameMatches)

        let locID = null;

        if (nameMatches.length > 1) {
          let nameMatchesStr = ""
          for (const nameObj of nameMatches) {
            nameMatchesStr += nameObj.name + ", "
          }
          nameMatchesStr = nameMatchesStr.slice(0, -2)

          // console.log("Name matches string:", nameMatchesStr)

          const name = prompt("Please enter the specific bus stop: " + nameMatchesStr)

          // const name = "Muswell Hill Road"

          // console.log(nameMatches.filter(nameMatch => nameMatch.name === name))
          locID = nameMatches.filter(nameMatch => nameMatch.name === name)[0].id
        } else {
          locID = nameMatches[0].id
        }



        // console.log("LocID:", locID)

        const call2 = `https://api.tfl.gov.uk/StopPoint/${locID}`

        fetch(call2)
          .then(response => response.json())
          .then(data => {

            console.log(`Data received from fetch 2 (${call}):`, data);

            data = data.children
            // console.log("Data:", data)
            let busStops = []
            data.map((child, index) => {
              busStops.push({
                name: child.commonName,
                naptanId: child.naptanId,
                stopLetter: child.stopLetter,
                towards: (child.additionalProperties.length > 0 ? child.additionalProperties[1].value : "Unknown")
              })
            })


            console.log("Bus Stops:", busStops)

            let stopList = ""
            let stopLettersStr = "("

            for (const busStop of busStops) {
              stopList += `\nStop ${busStop.stopLetter} - Towards ${busStop.towards}`
              stopLettersStr += `${busStop.stopLetter}, `
            }

            stopLettersStr = stopLettersStr.slice(0, -2)
            stopLettersStr += ")"

            const indicator = prompt(`Please enter the key ${stopLettersStr} of the bus stop you would like to add:${stopList}`)


            let id = ""
            let chosenBusStopObject = {}

            for (const busStop of busStops) {
              if (busStop.stopLetter.toLowerCase() === indicator.toLowerCase()) {
                id = busStop.naptanId
                chosenBusStopObject = busStop;
              }
            }
            console.log("Id added:", id);

            if (id) {
              if (!stopIds.includes(id)) {
                const newStopIds = [...stopIds, id];
                console.log("New stop IDS:", newStopIds)
                setStopIds(newStopIds)
              } else {
                alert(`'Stop ${chosenBusStopObject.stopLetter}: ${chosenBusStopObject.name}' is already on your infoboard.`)
              }
            }



          })
          .catch(error => {
            console.error('Error fetching stop point naptanID:', error);
          })




      })
      .catch(error => {
        console.error('Error fetching stop point ID:', error);
      })

  }

  function handleAddBusStop() {
    const stopName = prompt("Enter the name of the bus stop you would like to add:")

    if (stopName) {
      setStopID(stopName)
    }
  }

  function removeBusStop(idToRemove) {

    const updatedStopIds = stopIds.filter(id => id !== idToRemove);
    setStopIds(updatedStopIds)
  }


  return (
    <div className="bustimebox-container">
      {stopIds.map((stop, index) => <BusTimeBox stopId={stop} key={index} handleRemoveBusStop={() => removeBusStop(stop)} />)}
      {stopIds.length < 6 && (<div className='add-line'>
        <button className='add-line-button' onClick={handleAddBusStop}>+</button>
      </div>)}
    </div>
  )
}

function BusTimeBox({ stopId, handleRemoveBusStop }) {
  const [busTimes, setBusTimes] = useState([]); // State for bus times
  const contentRef = useRef(null); // Ref to access the bustimebox-content div


  const fetchBusTimes = () => {
    // console.log("Fetching bus times...");

    fetch(`https://api.tfl.gov.uk/StopPoint/${stopId}/Arrivals`)    // Fetch bus times from TfL API

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

    // interval to fetch data every 30 seconds
    const intervalId = setInterval(fetchBusTimes, 15000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [stopId]);

  useEffect(() => {
    const contentHeight = contentRef.current.clientHeight; // Get the height of the bustimebox-content div
    const busTimeHeight = 50; // Set the height of a single BusTime component in px
    const maxBusTimes = Math.floor(contentHeight / busTimeHeight); // Calculate the maximum number of BusTime components that can fit

    setBusTimes(busTimes.slice(0, maxBusTimes + 4)); // Render only the max number of BusTime components
  }, [busTimes.length]);





  return (
    <div className="bustimebox">
      <div className='bustimebox-header'>
        <div className="bustimebox-name">
          {busTimes.length > 0 ? (
            <>
              <p className="bus-stop">Stop {busTimes[0].platformName}: {busTimes[0].stationName} </p>
              <p className="bus-towards"> towards {busTimes[0].towards} </p>
            </>
          ) : <p>Loading bus...</p>}

        </div>
        <button className="remove-bus-button" onClick={handleRemoveBusStop}>-</button>
      </div>
      <div className="bustimebox-content" ref={contentRef}>
        {busTimes.map((bus, index) => (
          <BusTime key={index} busName={bus.lineName} busTime={`${Math.floor(bus.timeToStation / 60)} mins`} destinationName={bus.destinationName} />
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

function LineStatusContainer() {
  const [linesInfo, setLinesInfo] = useState([]);
  /*Array like [{name: "Northern", severityStatusDescription: "Good Service", ...}, 
  {name: "Piccadilly", severityStatusDescription: "Bad Service", ...} ]*/

  const [linesShowing, setLinesShowing] = useState(["piccadilly"]);
  /*Array like ["'Picccadilly', 'Victoria', 'Northern'"]*/

  const [lineList, setLineList] = useState("failed");
  /*Array of approved lines like ["'Picccadilly', 'Victoria', 'Northern'"]*/

  const fetchLineInfo = () => {
    fetch("https://api.tfl.gov.uk/Line/Mode/tube/Status")
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

        let lines = ""

        for (const line of allLineStatuses) {
          lines += line.name + ", "
        }

        lines = lines.slice(0, -2)

        setLineList(lines)
        // console.log("Line LIST", lines)

        // lineOptions = allLineStatuses.map((lineStatus, index) => (

        // ))

        // console.log("All lines statuses:", allLineStatuses);

        // console.log("Line Info fetched and updated!")

      })

      .catch(error => console.error('Error fetching line statuses:', error));

  };




  useEffect(() => {
    // Initial fetch
    fetchLineInfo();

    const intervalId = setInterval(fetchLineInfo, 6000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [lineList]);

  function removeLine(lineName) {
    // console.log("REMOVE BUTTON SUCESSFULLY PRESSED")
    // console.log("Current lines: ", linesShowing)
    // console.log("Line to remove: ", lineName)

    const isConfirmed = window.confirm(`Are you sure you want to remove the ${lineName} line?`);


    const newLinesShowing = linesShowing.filter(lineNameShowing => lineNameShowing.toLowerCase() !== lineName.toLowerCase())
    // console.log("New Lines: ", newLinesShowing )
    if (isConfirmed) {
      setLinesShowing(newLinesShowing)
    }
  }

  function addLine() {
    // console.log("ADD BUTTON SUCESSFULLY PRESSED")
    // console.log("Current lines: ", linesShowing)

    let lineName = prompt("Enter a line name you would like to add (Piccadilly, Victoria, Hammersmith & City, etc.")

    // console.log("Line to add: ", lineName)

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
        const newLinesShowing = [...linesShowing, lineName.toLowerCase()];
        // console.log("New Lines: ", newLinesShowing)
        // console.log("Type: ", typeof (newLinesShowing))
        setLinesShowing(newLinesShowing)
        validLine = true;
      }
    }

    if (!validLine) {
      alert("Please enter a correct lines out of our list of lines: " + lineList)
      addLine()
    }
    // setLinesShowing(["piccadilly", "victoria"])
  }

  return (
    <div className="line-status-container">
      {linesInfo ? (
        linesShowing.map((lineName, index) => {
          const lineObject = linesInfo.find(line => line.name.toLowerCase() === lineName.toLowerCase())
          return (lineObject ? <LineStatusBox lineObject={lineObject} key={index} handleRemoveLine={removeLine} /> : null);
        })
      ) : (
        <p>Loading...</p>
      )}

      {linesShowing.length < 4 && (
        <div className='add-line'>
          <button className='add-line-button' onClick={addLine}>+</button>
        </div>
      )}

    </div>
  )
}

function LineStatusBox({ lineObject, handleRemoveLine }) {
  const [isVisible, setIsVisible] = useState(true);

  const severityBackgroundColor = (lineObject.statusSeverity === 20 ? "black" : (lineObject.statusSeverity >= 10 ? "lightgreen" : (lineObject.statusSeverity > 7 ? "yellow" : "red")))
  const severityTextColour = (lineObject.statusSeverity === 20 ? "white" : "black")


  const toggleVisibility = () => {
    setIsVisible(prevState => !prevState);
  };


  return (
    <div className="line-status-box">
      <div className="line-status-content">
        <div className="line-name">
          {lineObject.name} Line
          <button className="remove-line-button" onClick={() => handleRemoveLine(lineObject.name)}>-</button>
        </div>
        <div className="status" style={{ backgroundColor: severityBackgroundColor, color: severityTextColour }}>
          {lineObject.statusSeverityDescription}
          {lineObject.reason && (<button className='expand-disruption-button' onClick={toggleVisibility}>{isVisible ? 'Hide' : 'Show'}</button>)}

        </div>

      </div>
      {isVisible && (
        <div className="disruption-reason">
          {lineObject.reason}
        </div>
      )}
    </div>
  );
}


export default App;