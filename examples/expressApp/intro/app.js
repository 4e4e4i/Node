const app = require('express')();

app.all('/', function (req, res, next) {
    console.log('Я выполнюсь для любого запроса и передам запрос дальше по очереди...');
    next();
});

app.get('/', function (req, res) {
    res.send('Отправил данные');
});

app.get('/:id', function (req, res) {
    let id = req.params.id;
    res.send('Отправил данные с параметрами: ' + id);
});

app.post('/', function (req, res) {
    res.send('Получил POST запрос');
});

app.put('/', function (req, res) {
    res.send('Получил PUT запрос');
});

app.patch('/', function (req, res) {
    res.send('Получил PATCH запрос');
});

app.delete('/', function (req, res) {
    res.send('Получил DELETE запрос');
});

app.listen(3000, function () {
    console.log('Example app listening on Port 3000!');
});
