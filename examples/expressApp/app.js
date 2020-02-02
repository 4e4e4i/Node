const express = require('express');
const app = express();
const birds = require('./birds');



app.use(function (req, res, next) {
    console.log('Time: ', Date.now());
    next();
});

app.get('/', function (req, res) {
    res.send('Hello world!');
});

app.use('/birds', birds);

app.listen(3000, function () {
    console.log('Example app listening on Port 3000!');
})
