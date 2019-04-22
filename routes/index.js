var express = require('express');
var router = express.Router();
const db = require('../db');

/* GET home page. */
router.get('/excursion', function (req, res, next) {
    db.getAll().then((data) => {
        res.render('index', {
            data: JSON.stringify({
                locations: data[0],
                transitions: data[1],
                paths: data[2],
                excursion: req.query.excursion
            })
        });
    })
});

router.get('/', function (req, res, next) {
    db.getAllQuestions().then(questions => {
        for (let q of questions) {
            const data = JSON.parse(q.data);
            let index = 0;
            for (let item of data) {
                item.id = `q${q.id}a${index}`;
                index += 1;
            }
            q.data = data;
        }
        
        res.render('questionary', {
            questions: questions,
        });
    });
});


module.exports = router;
