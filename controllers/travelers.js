const router = require('express').Router();
const db = require('../models');

router.get('/', (req, res) => {
    db.traveler.findAll()
    .then(travelers => {
        res.render('travelers/index', {
            travelers
        })
    })
    .catch(err => {
        console.log(err);
        res.send("Something bad happened. SRy");
    })
})

router.get('/new', (req, res) => {
    res.render('travelers/new');
})

router.post('/', (req, res) => {
    db.traveler.create(req.body)
    .then(createdTraveler => {
        res.redirect('/travelers');
    })
    .catch(err => {
        console.log(err);
        res.send("Something bad happened. SRy");
    })
})

module.exports = router;