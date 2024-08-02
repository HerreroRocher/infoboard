import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [currentTime, setCurrentTime] = useState('');
  const [currentHour, setCurrentHour] = useState(0);
  const [currentDate, setCurrentDate] = useState("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const date = now.toLocaleDateString("en-GB", { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
      const hours = String(now.getHours()).padStart(2, '0');
      const hoursInt = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
      setCurrentHour(hoursInt);
      setCurrentDate(date)
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="App">
      <Description time={currentTime} date={currentDate} />
      <Weather hour={currentHour} />
      <BusTimeBoxContainer />
      <LineStatusContainer />
    </div>
  );
}

function Description({ time, date }) {
  return (
    <header className="App-header">
      <p className="app-title">Daniel's infoboard using React JS</p>
      <p className="app-time">{time}</p>
      <p className='app-date'>{date}</p>
    </header>
  );
}

function Weather({ hour }) {
  const [forecast, setForecast] = useState([]); // State for weather conditions
  const [preferences, setPreferences] = useState(["Condition icon", "Temperature"])
  const [allPreferences, setAllPreferences] = useState([]);
  const [hoursShowing, setHoursShowing] = useState(10)

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

  function getWeatherInfo() {
    fetch("https://api.weatherapi.com/v1/forecast.json?key=a90a46dca4824a389b735402242907&q=London&days=2&aqi=no")
      .then(response => {
        // console.log("Raw response: ", response)
        return response.json();
      })
      .then(data => {
        // console.log("Forecast Data", data)
        // console.log("Forecast Hourly Data", data.forecast.forecastday[0].hour)

        let forecastFetched = [];
        let preferences = [];
        for (let day = 0; day < 2; day++) {
          const hourlyData = data.forecast.forecastday[day].hour;
          for (let hour = 0; hour < hourlyData.length; hour++) {
            const hourData = hourlyData[hour]

            const hourObject = {
              "time": hourData.time,
              "Condition text": hourData.condition.text,
              "Condition icon": hourData.condition.icon,
              "Chance of rain": hourData.chance_of_rain + "%",
              "Chance of snow": hourData.chance_of_snow + "%",
              "Cloud coverage": hourData.cloud + "%",
              "Feels like": hourData.feelslike_c + "°C",
              "Gust speed": hourData.gust_mph + "mph",
              "Humidity": hourData.humidity + "%",
              "Precipitation": hourData.precip_mm + "mm",
              "Pressure": hourData.pressure_mb + "hPa",
              "Snow levels": hourData.snow_cm + "cm",
              "Temperature": hourData.temp_c + "°C",
              "UV index": hourData.uv,
              "Visibility": hourData.vis_miles + "miles",
              "Wind direction": hourData.wind_degree + "° (" + hourData.wind_dir + ")",
              "Wind speed": hourData.wind_mph + "mph",
            };
            forecastFetched.push(hourObject);

            if (hourObject) {
              preferences = Object.keys(hourObject)
            }
          }
        }

        // console.log("Preferences", preferences)
        // console.log("Forecast: ", forecastFetched)
        setAllPreferences(preferences.filter(preference => preference !== "time"))
        setForecast(forecastFetched);
      });
  }


  function addPreference() {
    if (allPreferences.length > 0) {
      let preference = prompt("Please enter a weather parameter you would like to add:\n" + allPreferences.join(", "))

      if (preference.length === 0) {
        return;
      } else {
        if (preference.toLowerCase() === "uv index") {
          preference = preference.charAt(0).toUpperCase() + preference.charAt(1).toUpperCase() + preference.slice(2);
        } else {
          preference = preference.charAt(0).toUpperCase() + preference.slice(1);
        }
      }


      if (allPreferences.includes(preference)) {
        setPreferences([...preferences, preference])
      } else {
        alert("'" + preference + "' isn't one of our available preferences.")
      }
    }
  }

  useEffect(() => {
    // Initial fetch
    getWeatherInfo();

    // interval to fetch data every 10 minutes
    const intervalId = setInterval(getWeatherInfo, 600000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [preferences]);

  function addHour() {
    const newHoursShowing = hoursShowing + 1
    setHoursShowing(newHoursShowing)
  }


  function removeLastHour() {
    const newHoursShowing = hoursShowing - 1
    setHoursShowing(newHoursShowing)
  }

  function removePreference(specPreference) {
    const updatedPreferences = preferences.filter(preference => preference !== specPreference)
    setPreferences(updatedPreferences)
  }


  return (
    <div className='weather-container'>
      <div className="weather">
        {forecast.slice(hour - 1, hour + hoursShowing).map((forecastHourItem, index) => {

          const last = (index === hoursShowing)

          const first = Boolean(!index);
          return (
            <div key={index} className="weather-box" >
              <div className="weather-box-hour">
                <b>{first ? "Time:" : formatTime(forecastHourItem.time, false)}</b>
                {last && (
                  <button className="remove-weather-button" onClick={removeLastHour}>-</button>
                )}
              </div>

              {/* Loop through their preferences, which will be verified as data that we have, store the value of that key, and then add the divs */}

              {preferences.map((preference, index) => {
                return preference === "Condition icon" ? (
                  <div key={index} className="weather-box-weather">
                    {first ? (
                      <p className='condition-name' style={{ margin: "auto", marginBottom: "auto" }}>
                        Condition <br />Icon:
                        <button className="remove-condition-button" onClick={() => removePreference(preference)}>-</button>
                      </p>
                    ) : (
                      <img
                        className="condition-icon"
                        src={forecastHourItem["Condition icon"]}
                        alt={forecastHourItem["Condition text"]}
                      />
                    )}
                  </div>
                ) : (
                  <div key={index} className="weather-box-conditions">
                    <p className='condition-name'>
                      {first ? preference + ":" : forecastHourItem[preference]}
                      {first && (
                        <button className="remove-condition-button" onClick={() => removePreference(preference)}>-</button>
                      )}
                    </p>


                  </div>
                );
              })}


            </div>
          )

        })}

        {hoursShowing <= 24 && (
          <button className='add-hour-button' onClick={addHour}>+</button>
        )}
      </div >
      <button className='add-preference-button' onClick={addPreference}>+</button>
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

            console.log(`Data received from fetch 2 (${call2}):`, data);


            // CODE TO EXECUTE IF STOPTYPE != naptanonstreetbuscoach:
            // find the NaptanOnstreetBusCoachStop child, and set data to that child

            function iterateChildrenAndReturnStops(data, stopType) {
              let stops = [];
              if (data.stopType === stopType) {
                stops.push(data)
              } else {
                if (data.children && data.children.length > 0) {
                  for (let childIndex = 0; childIndex < data.children.length; childIndex++) {
                    stops = stops.concat(iterateChildrenAndReturnStops(data.children[childIndex], stopType))
                  }
                }
              }

              return stops

            }




            data = iterateChildrenAndReturnStops(data, "NaptanPublicBusCoachTram")
            console.log(`Stops Objects for location ID: ${locID} :`, data)

            let busStops = []
            data.map((child, index) => {
              busStops.push({
                name: child.commonName,
                naptanId: child.naptanId,
                stopLetter: child.stopLetter,
                towards: (child.additionalProperties.length > 0 ? child.additionalProperties[1].value : "Unknown")
              })
            })


            // console.log("Bus Stops:", busStops)

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
      {stopIds.length < 6 && (
        <div className='add-bus-button-container'>
          <button className='add-bus-button' onClick={handleAddBusStop}>+</button>
        </div>
      )}
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

    // interval to fetch data every 10 seconds
    const intervalId = setInterval(fetchBusTimes, 10000);

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
          ) : (busTimes.length === 0 ? <p>No current bus times</p> : <p>Loading bus...</p>)}

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