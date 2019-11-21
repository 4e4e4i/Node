var request = require('request');
request('http://loftschool.com/', function (err, res, body) {
    if (!err && res.statusCode == 200) {
        console.log(body);
    }
})

request({
    method: 'POST',
    uri: 'http://loftschool.com/',
    form: {
        key: 'value'
    },
}, function(err, res, body) {
    if (err) {
        console.error(err);
    } else {
        console.log(body);
        console.log(res.statusCode);
    }
})
