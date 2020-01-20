const fs = require('fs');
const path = require('path');

const base = './test';

const readDir = (base, level) => {
    const files = fs.readdirSync(base);  // массив файлов и папок

    files.forEach((item) => {
        let localBase = path.join(base, item);
        // для определения что представляет из себя файл fs.statSync
        let state = fs.statSync(localBase);

        if (state.isDirectory()) {
            console.log(' '.repeat(level) + 'Directory: ' + item);
            readDir(localBase, level + 1);
        } else {
           console.log(' '.repeat(level) + 'File: ' + item);
        }

    })
};

readDir(base, 0); // Корень

// Нужно пробежаться по директории test и вывести все файлы
