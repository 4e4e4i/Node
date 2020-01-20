const fs = require('fs');
const zlib = require('zlib');
const file = 'test.txt';

fs
// создаем поток чтения файла, который читай файл частями
    .createReadStream(file)
    // zlib по частям начинает их архивировать и пробрасывает дальше
    .pipe(zlib.createGzip())
    .on('end', () => {
        console.log('Read end');
    })

    // writeStream создает поток для записи
    .pipe(fs.createWriteStream(file + '.gz'))
    .on('close', () => {
        console.log('Closed');
    });
