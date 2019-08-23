// Required modules
require('dotenv').config();
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.accessToken });
const methodOverride = require('method-override');
const ejsLayouts = require('express-ejs-layouts');
const express = require('express');
const db = require('./models');
const app = express();

// middleware and config
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(ejsLayouts);

// Controllers
app.use('/favorites', require('./controllers/favorites'))
app.use('/travelers', require('./controllers/travelers'))

// render the city-search view
app.get('/', (req, res) => {
    db.traveler.findAll()
    .then(travelers => {
        // do something
        res.render('citySearch', { travelers });
    })
    .catch(err => {
        console.log(err);
        res.send("Sry")
    })
    
})

// use forward geocoding to search for cities
// render the search results page 
app.post('/search', (req, res) => {
    //ToDo:
    // Set the query to use the city and state info 
    // to forward geocode
    let city = req.body.city;
    let state = req.body.state;
    let query = `${city}, ${state}`;
    // console.log(city, state, query);
    let travelerId = req.body.travelerId;

    geocodingClient.forwardGeocode({ query })
    .send()
    .then(response => {
        // TODO: send ALL of the city listings, instead of just the first one
        // and update the searchResults.ejs to match
        const match = response.body.features[0];
        let lat = match.center[1];
        let long = match.center[0];
        let splitPlace_name = match.place_name.split(',');
        let city = splitPlace_name[0];
        let state = splitPlace_name[1];

        res.render('searchResults', {
            lat,
            long,
            city,
            state,
            travelerId
        });
    });
})

// Listen!
app.listen(3001, () => {
    console.log("Server is now listening on 3001")
})