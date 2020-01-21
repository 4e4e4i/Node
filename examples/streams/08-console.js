const fs = require('fs');
const { Console } = require('console');

// Создаем два потока
let output = fs.createWriteStream('./stdout.log');
let outerror = fs.createWriteStream('./stderr.log');

// создаем новый экземпляр консоли и передаем в него поток записи для лога и для ошибок
let console = new Console(output, outerror);

console.log('test message');
console.error('Error send');
