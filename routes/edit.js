const express = require('express');
const router = express.Router();
const db = require('../db');

function findById(id, arr) {
    for (let i of arr) {
        if (i.id === id) {
            return i;
        }
    }
    return null; 
}

/* GET home page. */
router.get('/', function(req, res, next) {
    
    res.render('edit');
});

router.get('/locations', function(req, res, next) {
    db.getAllLocations().then(locations => {
        res.render('locations', {locations: locations});
    });
    
});

router.get('/location/:uid', function(req, res, next) {
    if (req.params.uid !== undefined) {
        db.getLocation(req.params.uid).then(location => {
            res.render('location', {location: location});
        });
    }  
});

router.get('/location', function(req, res, next) {
    res.render('location', {isNew: true});
});


router.get('/transitions', function(req, res, next) {
    db.getAllLocations().then(locations => {
        db.getAllTransitions().then(transitions => {
            for (let t of transitions) {
                t.locationFrom = findById(t.locationId1, locations).name;
                t.locationTo = findById(t.locationId2, locations).name;
            }
            res.render('transitions', {
                transitions: transitions,
                locations: locations
            });
        })
    });
    
});

router.get('/transition/:uid', function(req, res, next) {
    if (req.params.uid !== undefined) {
         db.getAllLocations().then(locations => {
             db.getTransition(req.params.uid).then(transition => {
                 for (let l of locations) {
                     if (l.id === transition.locationId1) {
                         l.isSelected1=true;
                     }
                     if (l.id === transition.locationId2) {
                         l.isSelected2=true;
                     }
                 }
                 res.render('transition', {locations: locations, transition: transition});
             });
        });
    }  
});

router.get('/transition', function(req, res, next) {
    db.getAllLocations().then(locations => {
        res.render('transition', {locations: locations, isNew: true});
    });
});

router.get('/paths', function(req, res, next) {
    db.getAllPaths().then(paths => {
        res.render('paths', {
            paths: paths,
        });
    });
    
});

router.get('/path/:uid', function(req, res, next) {
    if (req.params.uid !== undefined) {
         db.getAllLocations().then(locations => {
             db.getPath(req.params.uid).then(path => {
                 res.render('path', {locations: locations, path: path, locationsStr: JSON.stringify(locations)});
             });
        });
    }  
});

router.get('/path', function(req, res, next) {
    db.getAllLocations().then(locations => {
        res.render('path', {locations: locations, locationsStr: JSON.stringify(locations)});
    });
});

router.get('/questions', function(req, res, next) {
    db.getAllQuestions().then(questions => {
        res.render('questions', {
            questions: questions,
        });
    });
    
});

router.get('/question/:uid', function(req, res, next) {
    if (req.params.uid !== undefined) {
         db.getAllPaths().then(paths => {
             db.getQuestion(req.params.uid).then(question => {
                 res.render('question', {paths: paths, question: question, pathsStr: JSON.stringify(paths)});
             });
        });
    }  
});

router.get('/question', function(req, res, next) {
    db.getAllPaths().then(paths => {
        res.render('question', {paths: paths, pathsStr: JSON.stringify(paths)});
    });
});

router.get('/statistics', function(req, res, next) {
    db.getLikes().then(likes => {
        res.render('statistics', {likes: JSON.stringify(likes)});
    });
});

module.exports = router;
