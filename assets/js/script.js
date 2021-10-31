var cityInputEl = document.getElementById("enter-city");
var cityFormEl = document.getElementById("city-input-form");
var searchEl = document.getElementById("search-city-button");
var searchHistoryEl = document.getElementById("search-history");
var currentContainerEl = document.getElementById("current-city-container");
var forecastContainerEl = document.getElementById("forecast-container");

const CITY_WEATHER_URL =
  "https://api.openweathermap.org/data/2.5/weather?q=<CITY>&units=imperial&appid=<APIKEY>";
const FORECAST_URL =
  "https://api.openweathermap.org/data/2.5/onecall?lat=<LATITUDE>&lon=<LONGITUDE>&units=imperial&exclude=minutely,hourly&appid=<APIKEY>";
const MY_API_KEY = "4fdcc0bfa551e7f510fce13137ab62cb";

var searchedCities = [];

var cityWeatherData = {
  city: "",
  latitude: "",
  longitude: "",
  curWeatherData: [],
  forecastData: [],
};

// To get a properly encoded API URL to pull the city weather data.
// This method takes the const API template URL and replaces the <CITY> with the supplied city
// and the <APIKEY> with my API key, and then encodes the URL properly so that
// any spaces and/or special chars in the City name are handled properly.
function getCityWeatherAPIURL(city) {
  var cityUrl = CITY_WEATHER_URL;
  var cityWeatherAPIUrl = encodeURI(
    cityUrl.replace("<CITY>", city).replace("<APIKEY>", MY_API_KEY)
  );
  //console.log("cityWeatherAPIUrl = " + cityWeatherAPIUrl);
  return cityWeatherAPIUrl;
}

// To get a properly encoded API URL to pull the five day Forecast data for the supplied latitude and longitude.
// This method takes the const API template URL for forecast and replaces the <LATITUDE> with the supplied latitide,
// the <LONGITUDE> with the supplied longitude, and the <APIKEY> with my API key. Then encodes the URL properly so that
// any spaces and/or special chars are handled properly.
function getForecastAPIUrl(lat, lon) {
  var url = FORECAST_URL;
  var forecastAPIURL = encodeURI(
    url
      .replace("<LATITUDE>", lat)
      .replace("<LONGITUDE>", lon)
      .replace("<APIKEY>", MY_API_KEY)
  );
  //console.log("forecastAPIURL = " + forecastAPIURL);
  return forecastAPIURL;
}

// To get the Weather data for a given city.
function getWeatherData(city) {
  // get the URL for City Weather API to get current conditions in selected city
  var cityInfoUrl = getCityWeatherAPIURL(city);
  console.log("API URL for City Weather: " + cityInfoUrl);

  //make a request to the url to fetch the data
  fetch(cityInfoUrl).then(function (cityResp) {
    // if response is okay, no errors found, API call likely succeeded.
    if (cityResp.ok) {
      cityResp
        .json()
        .then(function (cityData) {
          console.log("Current Conditions in " + city + ": ");
          console.log(cityData);

          // Save the keys and the returned data in the global cityWeatherData object.
          cityWeatherData["city"] = cityData.name;
          cityWeatherData["latitude"] = cityData.coord.lat;
          cityWeatherData["longitude"] = cityData.coord.lon;
          cityWeatherData["curWeatherData"] = cityData;

          console.log("After City Weather Data pull...");
          console.log("Lat= " + cityWeatherData["latitude"]);
          console.log("Lon= " + cityWeatherData["longitude"]);
          return cityData;
        })
        .then(function (cData) {
          console.log("Before Forecast API call...");
          console.log("Lat= " + cData.coord.lat);
          console.log("Lon= " + cData.coord.lon);

          ///5-day forecast API
          var forecastUrl = getForecastAPIUrl(
            cityWeatherData["latitude"],
            cityWeatherData["longitude"]
          );
          console.log("API URL for Forecast: " + forecastUrl);

          fetch(forecastUrl).then(function (forecastResp) {
            if (forecastResp.ok) {
              forecastResp
                .json()
                .then(function (foreData) {
                  console.log("5-day Forecast for " + city + ": ");
                  console.log(foreData);

                  cityWeatherData["forecastData"] = foreData;
                })
                .then(saveSearchedCity)
                .then(displayCurrentweatherData)
                .then(displayForecastData);
            } else {
              alert("Weather Forecast Info not found for City: " + city);
            }
          });
        })
        .catch((err) => alert(err));
    } else {
      //if city name is invalid return error message
      alert("Current Weather Info not found for City: " + city);
      cityFormEl.reset();
    }
  });
}

var saveSearchedCity = function () {
  var city = cityWeatherData["city"];
  //check if city exists in searched cities
  var previouslySearched = searchedCities.includes(city);
  if (!previouslySearched) {
    searchedCities.push(city);
    saveCitiesToLocalStorage(searchedCities);
    displaySearchedCities(city);
  }
};

function saveCitiesToLocalStorage(cities) {
  localStorage.setItem("CitiesSearched", JSON.stringify(cities));
}

var displaySearchedCities = function (city) {
  var cityCardEl = document.createElement("div");
  cityCardEl.setAttribute("class", "card");
  var cityCardNameEl = document.createElement("button");
  cityCardNameEl.setAttribute("class", "btn btn-outline-dark");
  cityCardNameEl.textContent = city;

  cityCardEl.appendChild(cityCardNameEl);

  cityCardEl.addEventListener("click", function () {
    getWeatherData(city);
  });

  searchHistoryEl.appendChild(cityCardEl);
};

var displayCurrentweatherData = function () {
  var city = cityWeatherData["city"];
  var data = cityWeatherData["forecastData"];

  //Endpoints to dislay current data
  var tempCurrent = Math.round(data.current.temp);
  var humidity = Math.round(data.current.humidity);
  var windSpeed = data.current.wind_speed;
  var uvIndex = data.current.uvi;
  var iconCurrent = data.current.weather[0].icon;

  //create HTML for city/date/icon
  currentContainerEl.textContent = "";
  currentContainerEl.setAttribute("class", "m-3 border col-10 text-center");
  var divCityHeader = document.createElement("div");
  var headerCityDate = document.createElement("h2");
  var currentdate = moment().format("L");
  var imageIcon = document.createElement("img");
  imageIcon.setAttribute("src", "");
  imageIcon.setAttribute(
    "src",
    "https://openweathermap.org/img/wn/" + iconCurrent + "@2x.png"
  );
  headerCityDate.textContent = city + "   (" + currentdate + ")";

  //Append to container for current data
  divCityHeader.appendChild(headerCityDate);
  divCityHeader.appendChild(imageIcon);
  currentContainerEl.appendChild(divCityHeader);

  //create element to display weather data
  var divCurrent = document.createElement("div");
  var tempEl = document.createElement("p");
  var humidityEl = document.createElement("p");
  var windSpeedEl = document.createElement("p");
  var uvIndexEl = document.createElement("p");
  var uvIndexColorEl = document.createElement("span");
  uvIndexColorEl.textContent = uvIndex;
  //color for background of UVindex depending on severity
  if (uvIndex <= 4) {
    uvIndexColorEl.setAttribute("class", "bg-success text-white p-2");
  } else if (uvIndex <= 8) {
    uvIndexColorEl.setAttribute("class", "bg-warning text-black p-2");
  } else {
    uvIndexColorEl.setAttribute("class", "bg-danger text-white p-2");
  }

  //add current weather data to page
  tempEl.textContent = "Temperature: " + tempCurrent + "°F";
  humidityEl.textContent = "Humidity: " + humidity + "%";
  windSpeedEl.textContent = "Wind Speed: " + windSpeed + " MPH";
  uvIndexEl.textContent = "UV Index: ";

  uvIndexEl.appendChild(uvIndexColorEl);

  //append elements to section
  divCurrent.appendChild(tempEl);
  divCurrent.appendChild(humidityEl);
  divCurrent.appendChild(windSpeedEl);
  divCurrent.appendChild(uvIndexEl);

  currentContainerEl.appendChild(divCurrent);
};

var displayForecastData = function () {
  data = cityWeatherData["forecastData"];
  console.log(data);
  //input header and clear data - header is outside main forecast container
  forecastContainerEl.textContent = "";
  var forecastHeaderEl = document.getElementById("five-day");
  forecastHeaderEl.textContent = "5-day Forecast:";

  //for loop for five day forecast
  for (var i = 1; i < 6; i++) {
    var tempForecast = Math.round(data.daily[i].temp.day);
    var windForecast = data.daily[i].wind_speed;
    var humidityForecast = data.daily[i].humidity;
    var iconForecast = data.daily[i].weather[0].icon;

    //create card elements and data elements for weather data
    var cardEl = document.createElement("div");
    cardEl.setAttribute(
      "class",
      "card col-xl-2 col-md-5 col-sm-10 mx-3 my-2 bg-dark text-white text-left"
    );

    var cardBodyEl = document.createElement("div");
    cardBodyEl.setAttribute("class", "card-body");

    var cardDateEl = document.createElement("h6");
    cardDateEl.textContent = moment().add(i, "days").format("L");

    var cardIconEl = document.createElement("img");
    cardIconEl.setAttribute(
      "src",
      "https://openweathermap.org/img/wn/" + iconForecast + "@2x.png"
    );

    var cardTempEl = document.createElement("p");
    cardTempEl.setAttribute("class", "card-text");
    cardTempEl.textContent = "Temp:  " + tempForecast + "°F";

    var cardWindEl = document.createElement("p");
    cardWindEl.setAttribute("class", "card-text");
    cardWindEl.textContent = "Wind:  " + windForecast + " MPH";

    var cardHumidEl = document.createElement("p");
    cardHumidEl.setAttribute("class", "card-text");
    cardHumidEl.textContent = "Humidity:  " + humidityForecast + "%";

    //append children to card body
    cardBodyEl.appendChild(cardDateEl);
    cardBodyEl.appendChild(cardIconEl);
    cardBodyEl.appendChild(cardTempEl);
    cardBodyEl.appendChild(cardWindEl);
    cardBodyEl.appendChild(cardHumidEl);

    //append body to card and then container element
    cardEl.appendChild(cardBodyEl);
    forecastContainerEl.appendChild(cardEl);

    //reset form after data displays
    cityFormEl.reset();
  }
};

function loadCities() {
  var citiesLoaded = localStorage.getItem("CitiesSearched");
  if (!citiesLoaded) {
    return false;
  }

  citiesLoaded = JSON.parse(citiesLoaded);

  for (var i = 0; i < citiesLoaded.length; i++) {
    displaySearchedCities(citiesLoaded[i]);
    searchedCities.push(citiesLoaded[i]);
  }
}

//Button click handler for Search City
function cityFormSubmit(event) {
  event.preventDefault();

  var cityInput = cityInputEl.value.trim();
  if (cityInput) {
    getWeatherData(cityInput);
  }
}

window.onload = function () {
  //form submit listener when user enters city
  cityFormEl.addEventListener("submit", cityFormSubmit);

  loadCities();
};
