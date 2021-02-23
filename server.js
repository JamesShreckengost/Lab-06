'use strict';

// ============================ Packages ==========================
const express = require('express');
const cors = require('cors'); // just kinda works and we need it
require('dotenv').config(); // read the `env.` file's saved env variables AFTER reading the terminal's real env's variable

// ============== App =============================================
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;



// ================= Routes =======================================
app.get('/location', handleGetLocation);

function handleGetLocation(req, res) {
  // console.log(req, res)
  console.log(req.query);
  const dataFromTheFile = require('./data/location.json');
  const output = new Location(dataFromTheFile, req.query.city);
  res.send(output)
}

function Location(dataFromTheFile, cityName) {
  this.search_query = cityName;
  this.formatted_query = dataFromTheFile[0].display_name;
  this.latitude = dataFromTheFile[0].lat;
  this.longitude = dataFromTheFile[0].lon;
}


app.get('/weather', handleGetWeather);

function handleGetWeather(req, res) {
  console.log(req.query);
  const dataFromTheFile = require('./data/weather.json');
  const output = [];


  for (let i = 0; i < dataFromTheFile.data.length; i++) {
    console.log(dataFromTheFile.data[i]);
    output.push(new Weather(dataFromTheFile.data[i]));
  }
  res.send(output);
}
//   // inside the for loop is where we will call the constructor based off of [i]
//   // when we call that thing we want push to the output which is an empty array
//   // Outside of the loop, finish the request response cycle

// // const output = new Weather(dataFromTheFile, req.query.city);


function Weather(data) {
  this.forecast = data.weather.description;
  this.time = data.valid_date;
}
// =============================

// ===================== Initialization ===========================

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`)
})