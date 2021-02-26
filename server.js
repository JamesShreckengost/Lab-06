'use strict';

// ============================ Packages ==========================
const express = require('express');
const cors = require('cors'); // just kinda works and we need it
const superagent = require('superagent');
const pg = require('pg');
require('dotenv').config(); // read the `env.` 
// file's saved env variables AFTER reading the terminal's real env's variable


// ============== App =============================================
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const LOCATION_API_KEY = process.env.LOCATION_API_KEY;
const PARKS_API_KEY = process.env.PARKS_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
const client = new pg.Client(DATABASE_URL);
client.on('error', error => console.log(error));

// ================= Routes =======================================

app.get('/location', handleGetLocation);
// const app = express? 
function handleGetLocation(req, res) {
  const city = req.query.city;
  const url = `https://us1.locationiq.com/v1/search.php?key=${LOCATION_API_KEY}&q=${city}&format=json`;
  const sqlString = 'SELECT * FROM location WHERE search_query=$1'
  const sqlArray = [city]

  // ask database do you have this location
  // if it has it res.send right back to sender
  // else do my normal superagent stuff 
  // talk to my database one more time to save this city
  //  res.send(output); dont have to wait for save to take place
  client.query(sqlString, sqlArray)
  .then((results) => {
    if(results.rows.length > 0){
      res.send(results.rows[0])
    } else {   
      superagent.get(url)
      .then(userData => {
       const output = new Location(userData.body, req.query.city);


        const sqlStringSaved = 'INSERT INTO location (search_query, formatted_query, latitude, longitude) VALUES($1, $2, $3, $4)';
        const sqlArraySaved = [city, output.formatted_query, output.latitude, output.longitude];

        client.query(sqlStringSaved, sqlArraySaved);

        res.send(output);
    });
    }
  });
}

function Location(userData, cityDescrip) {
  this.search_query = cityDescrip;
  this.formatted_query = userData[0].display_name;
  this.latitude = userData[0].lat;
  this.longitude = userData[0].lon;
}

//-----------------------------------------------------------------------------------------

app.get('/weather', handleGetWeather);

function handleGetWeather(req, res) {
  console.log('jim')
  const city = req.query.search_query;
  const url = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${WEATHER_API_KEY}`;

  superagent.get(url)
    .then(userData => {
      // console.log(userData.body)
      // const output = [];

      // for (let i = 0; i < userData.body.data.length; i++) {
      //   // console.log('test');
      //   output.push(new Weather(userData.body.data[i]));
      // }
      const output = userData.body.data.map(eachWeather => {
        return new Weather(eachWeather);
      })
      res.send(output);
    })
    .catch(err => console.error(err))
}

function Weather(userData) {
  this.forecast = userData.weather.description;
  this.time = userData.valid_date;
}
//-----------------------------------------------------------------------------------------

app.get('/parks', handleParks);

function handleParks(req, res) {
  const city = req.query.search_query;
  const url = `https://developer.nps.gov/api/v1/parks?q=${city}&api_key=${PARKS_API_KEY}`

  superagent.get(url)
    .then(userData => {
      // console.log("userdata function" + userData.body.data);
      const output = [];
      for (let i = 0; i < userData.body.data.length; i++){
        // console.log('test');
        output.push(new Parks(userData.body.data[i]))
      }
      res.send(output);
    })
    .catch(err => console.error(err))
}

function Parks(userData) {
  // console.log("within parks function" + userData.fullName);
  this.name = userData.fullName;
  this.address = userData.addresses[0].line1;
  this.fee = userData.fees;
  this.description = userData.description;
  this.url = userData.url;
}

//-----------------------------------------------------------------------------------------

app.get('*', handleError);

function handleError(req, res) {
  res.send({ status: 500, response: "Sorry something went wrong" })
}

// ===================== Initialization ===========================

client.connect().then(() => {
  app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`)
  });
})
