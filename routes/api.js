const express = require('express');
const router = express.Router();
var fs = require("fs");
const db = require('../db');

/* GET home page. */
router.post('/edit/location', function(req, res) {
    if (req.body.id !== undefined && req.body.id.length) {
        db.updateLocation(req.body.id, req.body.name, req.body.description, req.body.excursion).then((id) => {
            if (req.files.photos) {
                req.files.photos[0].pipe(fs.createWriteStream(`./public/images/panorames/${id}.jpg`));
            }
            res.send(JSON.stringify({status: 200}));
        }, () => {
            res.send(JSON.stringify({status: 500}));
        })
    } else {
        db.newLocation(req.body.name, req.body.description).then((id) => {
            if (req.files.photos) {
                req.files.photos[0].pipe(fs.createWriteStream(`./public/images/panorames/${id}.jpg`));
            }
            res.send(JSON.stringify({status: 200}));
        }, () => {
            res.send(JSON.stringify({status: 500}));
        })
    }
});

router.post('/remove/location', function(req, res) {
    if (req.body.id !== undefined) {
        db.deleteLocation(req.body.id).then(() => {
            res.send(JSON.stringify({status: 200}));
        }, () => {
            res.send(JSON.stringify({status: 500}));
        })
    } else {
        res.send(JSON.stringify({status: 500}));
    }
});

router.post('/edit/transition', function(req, res) {
    if (req.body.id !== undefined && req.body.id.length) {
        db.updateTransition(req.body.id, req.body.lId1, req.body.lId2, req.body.c1, req.body.c2).then(() => {
            res.send(JSON.stringify({status: 200}));
        }, () => {
            res.send(JSON.stringify({status: 500}));
        })
    } else {
        db.newTransition(req.body.lId1, req.body.lId2, req.body.c1, req.body.c2).then(() => {
            res.send(JSON.stringify({status: 200}));
        }, () => {
            res.send(JSON.stringify({status: 500}));
        })
    }
});

router.post('/remove/transition', function(req, res) {
    if (req.body.id !== undefined) {
        db.deleteTransition(req.body.id).then(() => {
            res.send(JSON.stringify({status: 200}));
        }, () => {
            res.send(JSON.stringify({status: 500}));
        })
    } else {
        res.send(JSON.stringify({status: 500}));
    }
});

router.post('/edit/path', function(req, res) {
    if (req.body.id !== undefined && req.body.id.length) {
        db.updatePath(req.body.id, req.body.name, req.body.path).then(() => {
            res.send(JSON.stringify({status: 200}));
        }, () => {
            res.send(JSON.stringify({status: 500}));
        })
    } else {
        db.newPath(req.body.name, req.body.path).then(() => {
            res.send(JSON.stringify({status: 200}));
        }, () => {
            res.send(JSON.stringify({status: 500}));
        })
    }
});

router.post('/remove/path', function(req, res) {
    if (req.body.id !== undefined) {
        db.deletePath(req.body.id).then(() => {
            res.send(JSON.stringify({status: 200}));
        }, () => {
            res.send(JSON.stringify({status: 500}));
        })
    } else {
        res.send(JSON.stringify({status: 500}));
    }
});

router.post('/edit/question', function(req, res) {
    if (req.body.id !== undefined && req.body.id.length) {
        db.updateQuestion(req.body.id, req.body.text, req.body.data).then(() => {
            res.send(JSON.stringify({status: 200}));
        }, () => {
            res.send(JSON.stringify({status: 500}));
        })
    } else {
        db.newQuestion(req.body.text, req.body.data).then(() => {
            res.send(JSON.stringify({status: 200}));
        }, () => {
            res.send(JSON.stringify({status: 500}));
        })
    }
});

router.post('/remove/question', function(req, res) {
    if (req.body.id !== undefined) {
        db.deleteQuestion(req.body.id).then(() => {
            res.send(JSON.stringify({status: 200}));
        }, () => {
            res.send(JSON.stringify({status: 500}));
        })
    } else {
        res.send(JSON.stringify({status: 500}));
    }
});

router.get('/like', function(req, res) {
    if (req.query.value !== undefined) {
        db.like(req.query.value);
    }
})
module.exports = router;
