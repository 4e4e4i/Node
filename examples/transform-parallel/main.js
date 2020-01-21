const fs = require('fs');
const split = require('split');
const request = require('request');
// Обертка для потока, она позволяет делать несколько запросов сразу
const thP = require('through2-parallel');

const urlFile = process.argv[2] || 'urlList.txt';

fs
    .createReadStream(urlFile)
    // вытаскиваем каждую строку из файла и передаем следующему
    .pipe(split())
    .pipe(thP.obj({
        // Сколько запросов одновременно отправлять
        concurrency: 2
    }, function (url, enc, done) {
        if (!url)
            return done();
        request(url, (err, response, body) => {
            this.push(`${url} - ${JSON.parse(body).special.course_alias} \n`);
            done();
        })
    }))
    .pipe(fs.createWriteStream('result.txt'))
    .on('finish', () => {
        console.log('Done!');
    })
