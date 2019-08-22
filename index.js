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


// render the city-search view
app.get('/', (req, res) => {
    res.render('citySearch');
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
    console.log(city, state, query);

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
            state 
        });
    });
})

// TODO: Refactor all /favorites routes into a controller file
// add the selected city to our favorites
app.post('/favorites', (req, res) => {
    db.place.create(req.body)
    .then(() => {
        res.redirect('/favorites');
    })
    .catch(err => {
        if(err) console.log(err);
        res.send("An error happened while creating a favorite");
    })
})

// pull all of the favorite cities, and pass them into the view
app.get('/favorites', (req, res) => {
    db.place.findAll()
    .then(places => {
        res.render('favorites/index', {
            places
        })
    })
    .catch(err => {
        if(err) console.log(err) 
        res.send("There was an error in accessing the favorites page")
    })
})

// Delete the city from the favorites table, and then redirect to the favorites
app.delete('/favorites/:id', (req, res) => {
    db.place.destroy({
        where: { id: req.params.id }
    })
    .then(result => {
        res.redirect('/favorites');
    })
    .catch(err => {
        if(err) console.log(err);
        res.send('Error in deleting the favorite. Sorry bout that');
    })
})

// Listen!
app.listen(3001, () => {
    console.log("Server is now listening on 3001")
})