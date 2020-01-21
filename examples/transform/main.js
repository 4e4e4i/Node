const fromArray = require('from2-array');
const through = require('through2');
const fs = require('fs');
const path = require('path');

const _path = {
    src: './src/js',
    dist: './dist/js'
};

const files = ['first.js', 'second.js', 'third.js'].map(item => {
    // Делаем полные имена для массива файлов
    return path.join(_path.src, item);
});

// Функция которая потоково будет каждый файл собирать, соединять и выкладывать
function concatFiles(dest, files, callback) {
    // Создаем поток записи
    const destStream = fs.createWriteStream(dest);

    fromArray
        .obj(files)
        // Следующий поток работ (сначала первый файл попадет, затем второй и тд
        .pipe(through.obj((file, enc, done) => {
            // Создаем поток записи
            const src = fs.createReadStream(file);
            // Сразу говорим, что когда end событие произойдет, ты его не закрывай, т.к. файлов много
            src.pipe(destStream, { end: false });
            src.on('error', (err) => {
                console.log(err.message);
                done()
            });
            src.on('end', done);
        }))
        .on('finish', () => {
            destStream.end();
            callback();
        })

}

concatFiles(path.join(_path.dist, 'main.js'), files, () => {
    console.log('Concat done!');
});
