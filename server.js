'use strict';

// ============================ Packages ==========================
const express = require('express');
const cors = require('cors'); // just kinda works and we need it
const superagent = require('superagent');
require('dotenv').config(); // read the `env.` file's saved env variables AFTER reading the terminal's real env's variable


// ============== App =============================================
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;



// ================= Routes =======================================
app.get('/location', handleGetLocation);

function handleGetLocation(req, res) {
  // console.log(req, res)
  console.log(req.query);//const queryFromTheFrontend = req.query
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

function Weather(data) {
  this.forecast = data.weather.description;
  this.time = data.valid_date;
}

app.get('*', handleError);

  function handleError(req, res) {
    res.send({status: 500, response: "Sorry something went wrong"})
  }

  





// =============================

// ===================== Initialization ===========================

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`)
})