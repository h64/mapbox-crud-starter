const router = require('express').Router();
const db = require('../models');

// TODO: Refactor all /favorites routes into a controller file
// add the selected city to our favorites
router.post('/', (req, res) => {
    //delete the travelerId from req.body
    let travelerId = req.query.travelerId;

    // Make the city in the db if not present, or find if it is
    db.place.findOrCreate({
        where: { city: req.body.city },
        defaults: req.body
    })
    .spread((place, created) => {
        // Having found, or created the 'place' - associate the traveler with it
        if(created) {
            console.log(`We created a city named ${req.body.city}`)
        }
        if(travelerId > 0) {
            db.traveler.findByPk(travelerId)
            .then(traveler => {
                // Associate the two models
                place.addTraveler(traveler);
            })
            .catch(err => {
                console.log(err);
                res.send("oops");
            })
        }
        res.redirect('/favorites');
    })
})

// pull all of the favorite cities, and pass them into the view
router.get('/', (req, res) => {
    console.log(process.env.accessToken);
    db.place.findAll()
    .then(places => {
        let markers = places.map(place => {
            let markerObj = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [place.long, place.lat]
                },
                "properties": {
                    "title": place.name,
                    "icon": "airport"
                }
            }
            return JSON.stringify(markerObj);
        })
        res.render('favorites/index', {
            places,
            mapboxAccessToken: process.env.accessToken,
            markers
        })
    })
    .catch(err => {
        if(err) console.log(err) 
        res.send("There was an error in accessing the favorites page")
    })
})

// Delete the city from the favorites table, and then redirect to the favorites
router.delete('/:id', (req, res) => {
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

module.exports = router;