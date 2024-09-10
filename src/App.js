import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [currentTime, setCurrentTime] = useState('');
  const [currentTimeISO, setCurrentTimeISO] = useState('');
  const [currentHour, setCurrentHour] = useState(0);
  const [currentDate, setCurrentDate] = useState("")
  const [location, setCurrentLocation] = useState(JSON.parse(localStorage.getItem('location')) ? JSON.parse(localStorage.getItem('location')) : "London");
  const [locationStr, setLocationStr] = useState("")
  const [localTime, setLocalTime] = useState("")
  const [offset, setOffset] = useState(0)
  const [editMode, setEditMode] = useState(false)
  const [savePending, setSavePending] = useState(false)

  useEffect(() => {
    // console.log("Offset = ", offset)
    // console.log("currentTimeISO = ", currentTimeISO)
    const date = new Date(currentTimeISO)
    date.setHours(date.getHours() + (offset ? offset : 0))

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    const localTimeStr = `${hours}:${minutes}:${seconds}`;
    setLocalTime(localTimeStr)

  }, [currentTime, offset])


  useEffect(() => {
    localStorage.setItem('location', JSON.stringify(location));
  }, [savePending]);

  function getUserLocation() {

    let preference = prompt("Enter a city name you would like to check the weather for, or enter 'Current location'")

    if (preference === null || preference === "") {
      return;
    }

    if (preference.toLowerCase() === "current location") {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            // console.log('Latitude:', latitude, 'Longitude:', longitude);
            // Use the coordinates to get weather information
            setCurrentLocation(latitude + "," + longitude);
          },
          (error) => {
            console.error('Error getting location:', error);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
          }
        );
      } else {
        console.error('Geolocation is not supported by this browser.');
      }
    } else {
      setCurrentLocation(preference)
    }



  }




  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      // Format the date as YYYY-MM-DD
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const datePart = `${year}-${month}-${day}`;

      // Format the time as HH:MM:SS
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const timePart = `${hours}:${minutes}:${seconds}`;

      // Combine date and time to ISO 8601 format
      const isoFormatDate = `${datePart}T${timePart}`;

      setCurrentTimeISO(isoFormatDate);
      // console.log("currentTimeISO set to", isoFormatDate)
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
      setCurrentHour(now.getHours());
      setCurrentDate(now.toLocaleDateString("en-GB", { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }));
    };

    // Update the time immediately and then every second
    updateTime();
    const intervalId = setInterval(updateTime, 1000);

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  return (
    <div className="App">
      <Description setSavePending={setSavePending} editMode={editMode} setEditMode={setEditMode} time={currentTime} localTime={localTime} date={currentDate} location={locationStr} handleLocClick={getUserLocation} offset={offset} />
      <Weather savePending={savePending} editMode={editMode} hour={currentHour} location={location} updateLocationStr={setLocationStr} setOffset={setOffset} currentTimeISO={currentTimeISO} />
      <BusTimeBoxContainer editMode={editMode} savePending={savePending} />
      <LineStatusContainer editMode={editMode} savePending={savePending} />
    </div>
  );
}

function Description({ time, date, location, handleLocClick, localTime, offset, editMode, setEditMode, setSavePending }) {
  return (
    <header className="App-header">
      <p className="app-title">Daniel's infoboard using React JS {editMode ? <button className="edit-button" onClick={() => {
        setEditMode(false)
        setSavePending(false)
      }}>Save</button> : <button className="edit-button" onClick={() => {
        setEditMode(true)
        setSavePending(true)
      }
      }>Edit</button>}</p>
      <p className="app-time">{date}, {time}</p>
      {editMode ? <p className='app-location' onClick={handleLocClick}>{location}{offset === 0 ? null : `(${localTime})`}</p>
        : <p className='app-location-no-hover'>{location}{offset === 0 ? null : `(${localTime})`}</p>
      }
    </header>
  );
}

function Weather({ hour, location, updateLocationStr, currentTimeISO, setOffset, editMode, savePending }) {
  const [forecast, setForecast] = useState([]); // State for weather conditions
  const [allPreferences, setAllPreferences] = useState([]);
  const [currentHour, setCurrentHour] = useState(hour)

  // console.log(currentHour)


  const [hoursShowing, setHoursShowing] = useState(JSON.parse(localStorage.getItem('hoursShowing')) ? JSON.parse(localStorage.getItem('hoursShowing')) : 10)
  const [preferences, setPreferences] = useState(JSON.parse(localStorage.getItem('preferences')) ? JSON.parse(localStorage.getItem('preferences')) : ["Condition icon", "Temperature"])

  useEffect(() => {
    localStorage.setItem('preferences', JSON.stringify(preferences));
    localStorage.setItem('hoursShowing', JSON.stringify(hoursShowing));
  }, [savePending]);


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
    fetch(`https://api.weatherapi.com/v1/forecast.json?key=a90a46dca4824a389b735402242907&q=${location}&days=2&aqi=yes&alerts=no`)
      .then(response => {
        // console.log("Raw response: ", response)
        return response.json();
      })
      .then(data => {
        // console.log("Forecast data retreived from weatherapi: ", data)
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
        preferences = preferences.filter(preference => preference !== "time")
        setAllPreferences(preferences)
        setForecast(forecastFetched);
        setCurrentHour(formatTime(data.location.localtime, true))
        updateLocationStr(data.location.name + ", " + data.location.country)

        function getTimeOffset(currentTimeDate, localTimeDate) { //Time dates in form '2024-08-05T21:41:00'
          const currentDate = new Date(currentTimeDate)
          const localDate = new Date(localTimeDate)
          const timeDiffMill = localDate - currentDate
          const diffHours = Math.ceil((timeDiffMill % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          return diffHours;
        }

        function convertToISOFormat(localTimeDate) {
          const [date, time] = localTimeDate.split(' ');
          const [hours, mins] = time.split(':');
          const paddedHours = hours.padStart(2, '0');
          const paddedMins = mins.padStart(2, '0');
          return `${date}T${paddedHours}:${paddedMins}:00`;
        }

        const localTimeISO = convertToISOFormat(data.location.localtime) //CONFIRMED FUNCTIONAL

        // console.log("currentTimeISO", currentTimeISO)
        // console.log("localTlocalTimeISO", localTimeISO)
        const offset = getTimeOffset(currentTimeISO, localTimeISO)
        setOffset(offset)
        // console.log("Offset = ", offset)






      })
      .catch(error => {
        console.error('Error fetching Weather forecast info:', error);
      });
  }


  function addPreference() {
    if (allPreferences.length > 0) {
      let preference = prompt("Please enter a weather parameter you would like to add:\n" + allPreferences.join(", "))

      if (preference === null) {
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
        alert("'" + preference + "' isn't one of our available preferences. Please try again.")
        addPreference()
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
  }, [preferences, location, currentTimeISO === '']);

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
        {forecast.slice(currentHour - 1, currentHour + hoursShowing).map((forecastHourItem, index) => {

          const last = (index === hoursShowing)

          const first = Boolean(!index);
          return (
            <div key={index} className="weather-box" >
              <div className="weather-box-hour">
                <b>{first ? "Time:" : formatTime(forecastHourItem.time, false)}</b>
                {last && editMode && (
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
                        {editMode && (
                          <button className="remove-condition-button" onClick={() => removePreference(preference)}>-</button>
                        )}

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
                      {first && editMode && (
                        <button className="remove-condition-button" onClick={() => removePreference(preference)}>-</button>
                      )}
                    </p>


                  </div>
                );
              })}


            </div>
          )

        })}

        {hoursShowing <= 24 && editMode && (
          <button className='add-hour-button' onClick={addHour}>+</button>
        )}
      </div >
      {editMode && (
        <button className='add-preference-button' onClick={addPreference}>+</button>
      )}

    </div>
  );
}

function BusTimeBoxContainer({ editMode, savePending }) {
  const [stopIds, setStopIds] = useState(JSON.parse(localStorage.getItem('stopIds')) ? JSON.parse(localStorage.getItem('stopIds')) : ["490003564W", "490003564E", "490015187F"])

  useEffect(() => {
    localStorage.setItem('stopIds', JSON.stringify(stopIds));
  }, [savePending]);




  function setStopID(stopName) {

    // expect stop name "muswell hill" "broawdfgs" "pymmes road" etc.  CASE INSENSITIVE, deal with errors

    const call = `https://api.tfl.gov.uk/StopPoint/Search?query=${encodeURIComponent(stopName)}&modes=bus&app_key=ab8fb89349364c56b2a597d938d04025`

    fetch(call)
      .then(response => response.json())
      .then(data => {
        // Assuming the first result is the correct one
        console.log(`Data received from fetch stops which match ${stopName} (${call}):`, data);

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


          let valid = false;

          while (valid === false) {

            let name = prompt("Please enter the specific bus stop: " + nameMatchesStr)

            if (name === null) {
              return;
            }

            // const name = "Muswell Hill Road"

            // console.log(nameMatches.filter(nameMatch => nameMatch.name === name))
            let nameMatchMatches = nameMatches.filter(nameMatch => nameMatch.name.toLowerCase() === name.toLowerCase())

            if (nameMatchMatches.length > 0) {
              locID = nameMatchMatches[0].id
              valid = true;
            } else {
              alert(`${name} isn't one of our listed bus stop names.`)
            }
          }
        } else {
          locID = nameMatches[0].id
        }



        // console.log("LocID:", locID)

        const call2 = `https://api.tfl.gov.uk/StopPoint/${locID}?app_key=ab8fb89349364c56b2a597d938d04025`

        fetch(call2)
          .then(response => response.json())
          .then(data => {

            console.log(`Data received from get bus stops with location ID ${locID} (${call2}):`, data);


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
            // console.log(`Stops Objects for location ID: ${locID} :`, data)

            let busStops = []
            data.map((child, index) => {
              busStops.push({
                name: child.commonName,
                naptanId: child.naptanId,
                stopLetter: child.stopLetter,
                towards: (
                  child.additionalProperties.filter(property => property.category === "Direction").length > 0
                    ?
                    (child.additionalProperties.filter(property => property.key === "Towards").length > 0
                      ?
                      child.additionalProperties.filter(property => property.key === "Towards")[0].value
                      :
                      child.additionalProperties.filter(property => property.category === "Direction")[0].value)
                    : "Unknown")
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

            let valid = false;

            let indicator = ""

            while (valid === false) {

              indicator = prompt(`Please enter the key ${stopLettersStr} of the bus stop you would like to add:${stopList}`)

              if (indicator === null) {
                return;
              }


              let id = ""
              let chosenBusStopObject = {}



              for (const busStop of busStops) {
                if (busStop.stopLetter.toLowerCase() === indicator.toLowerCase()) {
                  id = busStop.naptanId
                  chosenBusStopObject = busStop;
                }
              }
              // console.log("Id added:", id);

              if (id) {
                if (!stopIds.includes(id)) {
                  const newStopIds = [...stopIds, id];
                  // console.log("New stop IDS:", newStopIds)
                  setStopIds(newStopIds)
                } else {
                  alert(`'Stop ${chosenBusStopObject.stopLetter}: ${chosenBusStopObject.name}' is already on your infoboard.`)
                }
                valid = true;
              } else {
                alert(`Stop ${indicator} wasn't one of our options.`)
              }
            }



          })
          .catch(error => {
            console.error('Error fetching Bus Stops (fetch 2):', error);
            alert('Error fetching corresponding bus stops.');

          })




      })
      .catch(error => {
        alert('Error fetching StopPointID.');

        console.error('Error fetching StopPointID (fetch 1):', error);
      })

  }

  function handleAddBusStop() {
    const stopName = prompt("Enter the name of the bus stop you would like to add:")

    if (stopName) {
      setStopID(stopName)
    } else {
      if (stopName === null) {
        return;
      } else {
        alert(`'${stopName}' isn't a registered bus stop name. Please try again.`)
        handleAddBusStop()
      }
    }
  }

  function removeBusStop(idToRemove) {

    const updatedStopIds = stopIds.filter(id => id !== idToRemove);
    setStopIds(updatedStopIds)
  }


  return (
    <div className="bustimebox-container">
      {stopIds.map((stop, index) => <BusTimeBox stopId={stop} key={index} editMode={editMode} handleRemoveBusStop={() => removeBusStop(stop)} />)}
      {editMode && (<div className='add-bus-button-container'>
        <button className='add-bus-button' onClick={handleAddBusStop}>+</button>
      </div>)}

    </div>
  )
}

function BusTimeBox({ stopId, handleRemoveBusStop, editMode }) {
  const [busTimes, setBusTimes] = useState([]); // State for bus times
  const [busStopInfo, setBusStopInfo] = useState([])
  const contentRef = useRef(null); // Ref to access the bustimebox-content div

  useEffect(() => {

    const call = `https://api.tfl.gov.uk/StopPoint/${stopId}?app_key=ab8fb89349364c56b2a597d938d04025`
    fetch(call)
      .then(response => response.json())
      .then(data => {

        console.log(`Bus stop info for stop id ${stopId} using ${call}`, data)
        
        function getStopFromParentStop(data, id) {
          let stops = [];
          if (data.naptanId === id) {
            stops.push(data)
          } else {
            if (data.children && data.children.length > 0) {
              for (let childIndex = 0; childIndex < data.children.length; childIndex++) {
                stops = stops.concat(getStopFromParentStop(data.children[childIndex], id))
              }
            }
          }
          
          return stops
          
        }
        
        data = getStopFromParentStop(data, stopId)[0]
        const newBusStopInfo = data
        console.log("new bus stop info: ", newBusStopInfo)
        if (newBusStopInfo) {
          // console.log("SET")
          setBusStopInfo(newBusStopInfo);
        }
      }
      ).catch(error => {
        console.error('Error fetching Bus Stop Info:', error);
      })
  }, [])

  const fetchBusTimes = () => {
    // console.log("Fetching bus times...");

    fetch(`https://api.tfl.gov.uk/StopPoint/${stopId}/Arrivals?app_key=ab8fb89349364c56b2a597d938d04025`)    // Fetch bus times from TfL API

      .then(response => {
        // Log the raw response
        // console.log("Raw response:", response);
        return response.json();
      })
      .then(data => {
        // Log the parsed JSON data
        // console.log(`Fetched bus times for stop id ${stopId}:`, data);

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
        console.error('Error fetching bus arrival times:', error);
      });

    // console.log("Bus times updated!")
  };

  useEffect(() => {
    // Initial fetch
    fetchBusTimes();

    // interval to fetch data every 10 seconds
    const intervalId = setInterval(fetchBusTimes, 1000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [stopId]);

  useEffect(() => {
    const contentHeight = contentRef.current.clientHeight; // Get the height of the bustimebox-content div
    const busTimeHeight = 50; // Set the height of a single BusTime component in px
    const maxBusTimes = Math.floor(contentHeight / busTimeHeight); // Calculate the maximum number of BusTime components that can fit

    setBusTimes(busTimes.slice(0, maxBusTimes + 4)); // Render only the max number of BusTime components
  }, [busTimes.length]);

  // console.log("Bus Stop Info:", busStopInfo)


  return (
    <div className="bustimebox">
      <div className='bustimebox-header' style={{ borderBottom: 'white solid' }}>
        <div className="bustimebox-name" >
          {busStopInfo ? (
            <>
              <p className="bus-stop">{busStopInfo.stopLetter ? "Stop " + busStopInfo.stopLetter + ":" : ""} {busStopInfo.commonName ? busStopInfo.commonName : ""} </p>
              <p className="bus-towards"> towards {(


                busStopInfo.additionalProperties.filter(property => property.category === "Direction").length > 0
                  ?
                  (busStopInfo.additionalProperties.filter(property => property.key === "Towards").length > 0
                    ?
                    busStopInfo.additionalProperties.filter(property => property.key === "Towards")[0].value
                    :
                    busStopInfo.additionalProperties.filter(property => property.category === "Direction")[0].value)
                  : "Unknown"
                )} </p>
            </>
          ) : busTimes.length === 0 ? <p>No current bus times</p> : <p>Loading bus...</p>}

        </div>
        {editMode && (
          <button className="remove-bus-button" onClick={handleRemoveBusStop}>-</button>
        )}
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

function LineStatusContainer({ editMode, savePending }) {
  const [linesInfo, setLinesInfo] = useState([]);
  /*Array like [{name: "Northern", severityStatusDescription: "Good Service", ...}, 
  {name: "Piccadilly", severityStatusDescription: "Bad Service", ...} ]*/

  const [linesShowing, setLinesShowing] = useState(JSON.parse(localStorage.getItem('linesShowing')) ? JSON.parse(localStorage.getItem('linesShowing')) : ["piccadilly", "victoria"]);
  /*Array like ["'Picccadilly', 'Victoria', 'Northern'"]*/

  const [lineList, setLineList] = useState("failed");
  /*Array of approved lines like ["'Picccadilly', 'Victoria', 'Northern'"]*/

  useEffect(() => {
    localStorage.setItem('linesShowing', JSON.stringify(linesShowing));
  }, [savePending]);

  const tubeBackgroundColours = {
    "piccadilly": "#0019A8",
    "bakerloo": "#B26313",
    "central": "#DC241F",
    "circle": "#FFD329",
    "district": "#007D32",
    "hammersmith-city": "#F4A9BE",
    "jubilee": "#A1A5A7",
    "metropolitan": "#9B0058",
    "northern": "#000",
    "victoria": "#0098D8",
    "waterloo-city": "#93CEBA"
  }

  const tubeTextColours = {
    "piccadilly": "white",
    "bakerloo": "#fff",
    "central": "white",
    "circle": "#0019A8",
    "district": "white",
    "hammersmith-city": "#0019A8",
    "jubilee": "white",
    "metropolitan": "white",
    "northern": "#fff",
    "victoria": "white",
    "waterloo-city": "#0019A8"
  }

  function getTubeTextBackgroundColours(tubeID) {

    // console.log("Colors:", [tubeTextColours[tubeID], tubeBackgroundColours[tubeID]])

    return [tubeTextColours[tubeID], tubeBackgroundColours[tubeID]]
  }

  const fetchLineInfo = () => {
    fetch("https://api.tfl.gov.uk/Line/Mode/tube/Status?app_key=ab8fb89349364c56b2a597d938d04025")
      .then((response) => {
        // console.log("Unparsed response: ", response)
        return response.json();
      })
      .then((data) => {
        // console.log("Line status data received from tube line api: ", data)

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

    const intervalId = setInterval(fetchLineInfo, 30000);

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
      alert(`'${lineName}' isn't in our list of supported lines. Please enter a correct line out of our list of lines: ` + lineList)
      addLine()
    }
    // setLinesShowing(["piccadilly", "victoria"])
  }

  return (
    <div className="line-status-container">
      {linesInfo ? (
        linesShowing.map((lineName, index) => {
          const lineObject = linesInfo.find(line => line.name.toLowerCase() === lineName.toLowerCase())
          return (lineObject ? <LineStatusBox getColours={getTubeTextBackgroundColours} editMode={editMode} lineObject={lineObject} key={index} handleRemoveLine={removeLine} /> : null);
        })
      ) : (
        <p>Loading...</p>
      )}

      {editMode && (
        <div className='add-line'>
          <button className='add-line-button' onClick={addLine}>+</button>
        </div>
      )}

    </div>
  )
}

function LineStatusBox({ lineObject, handleRemoveLine, editMode, getColours }) {
  const [isVisible, setIsVisible] = useState(true);

  const severityBackgroundColor = (lineObject.statusSeverity === 20 ? "black" : (lineObject.statusSeverity >= 10 ? "lightgreen" : (lineObject.statusSeverity > 7 ? "yellow" : "red")))
  const severityTextColour = (lineObject.statusSeverity === 20 ? "white" : "black")

  // console.log(lineObject)


  const toggleVisibility = () => {
    setIsVisible(prevState => !prevState);
  };

  const [textColour, backgroundColor] = getColours(lineObject.id)


  return (
    <div className="line-status-box" style={{ backgroundColor: backgroundColor, color: textColour }}>
      <div className="line-status-content">
        <div className="line-name">
          {lineObject.name} Line
          {editMode && (
            <button className="remove-line-button" onClick={() => handleRemoveLine(lineObject.name)}>-</button>
          )}
        </div>
        <div className="status" style={{ backgroundColor: severityBackgroundColor, color: severityTextColour }}>
          {lineObject.statusSeverityDescription}
          {lineObject.reason && (<button className='expand-disruption-button' onClick={toggleVisibility}>{isVisible ? 'Hide' : 'Show'}</button>)}

        </div>

      </div>
      {isVisible && (
        <div className="disruption-reason" style={{ color: "black" }}>
          {lineObject.reason}
        </div>
      )}
    </div>
  );
}


export default App;