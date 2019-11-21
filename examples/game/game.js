var readline = require('readline'),
    colors = require('colors'),
    argv = require('minimist')(process.argv.slice(2)),
    fs = require('fs'),
    mind, count, rl, logfile;

var NOT_A_NUMBER_TEXT = 'Введите число!';
var WRONG_NUMBER_TEXT = 'Число должно лежать в заданном диапазоне!';
var INPUT_NUMBER_TEXT = 'Введите любое число от 1 до 10, чтобы угадать задуманное: ';
var WIN_TEXT = 'Поздравляем !!! Вы угадали число за %d шага(ов)';
var TRY_AGAIN_TEXT = 'Вы не угадали, еще попытка';

function init() {
    // получим случайное число от 1 до 10
    mind = Math.floor(Math.random() * 10) +1;
    // Обнулим счетчик количества угадываний
    count = 0;
    // Установим ввод и вывод в стандартные потоки
    rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    // Запомним имя файла для логов, если он есть
    logfile = argv['_'][0];
}

function game() {
    function log(data) {
        if (logfile != undefined) fs.appendFileSync(logfile, data + '\n');
    }

    function valid(value) {

        if (isNaN(value)) {
            console.log(NOT_A_NUMBER_TEXT.red);
            return false;
        }

        if (value < 1 || value > 10) {
            console.log(WRONG_NUMBER_TEXT.red);
            return false;
        }

        return true;
    }

    rl.question(INPUT_NUMBER_TEXT.green,
        function (value) {
            var a = +value;
            if (!valid(a)) {
                // если валидацию не прошли - запускаем игру заново
                game();
            } else {
                count += 1;
                if (a === mind) {
                    log('Поздравляем ! Вы угадали число за ' + count + ' шага(ов)');
                    console.log(WIN_TEXT.brightYellow, count);
                    // угадали и закрыли экземпляр Interface, конец программы
                    rl.close();
                } else {
                    console.log(TRY_AGAIN_TEXT.yellow);
                    game();
                }
            }
        }
    );
}

init();
game();
