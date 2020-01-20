# Node.js серверный JavaScript

Содержание:

* [Теория Node.js](#NodeTheory)
    * [Архитектура Node.js](#architectoryNode)
    * [Как функционирует Node.js](#howDoesNodeWorks)
    * [Почему же выбирают Node.js?](#WhyDoWeChooseNode)
    * [Примеры использования Node.js](#NodeExamples)
    * [Для чего мы используем Node.js](#WhatAreYouUsingNodeFor)
* [Рабочее окружение и веб-разработка с использованием Node.js](#WorkEnvironment)
    * [Системы построения фронтенда](#NodeInFront)
    * [Фреймоврки](#Frameworks)
    * [Базы данных](#DB)
    * [Вне веб-разработки](#OutsideWeb)
* [Упражнения и теория детально](#examples)
    * [Модули](#Modules)
    * [Как работает Node?](#HowItWorksInDetail)
    * [События](#NodeEvents)
    * [Работа с файлами](#workWithFiles)
    * [Создание консольных приложений](#consoleApp)
    * [Простой сайт на Node.js](#siteOnNode)
    * [Сетевые запросы](#webRequests)
    * [Express](#express)
* [Модули и файловая система](#ModulesAndFilesSystem)
    * [Как работает require, делаем свой](#customRequire)
    * [Цикличность](#cycle)
    * [Import](#import)
    * [Console-process](#consoleProcess)
    * [Module path](#modulePath)

## Теория Node.js <a name="NodeTheory"></a>

Версии Node.js

![](./pics/node_1.png)

Патч-версия - фиксирование багов.

Минорная версия - кроме фиксирования багов, обновление функционала (могут добавляться апи функции, переписываться внутреняя
реализация чего-то и тд), но минорная версия всегда подразумевает под собой совместимость с предыдущей версией.

Мажорная версия - полное переделывание вашего интерфейса, добавление функционала, запрещение какого-то функционала, 
добавление / удаление каких-то функций в коде и тд, обычно явная переделка.

Пример простейшего Hello World на ноде, создание сервера:

![](./pics/node_2.png)

Сама нода, она асинхронна. Обработку всех событий, которые происходят (обращения к серверу и тд), всегда будет выполняться
через колбэк или промисы. 

### Архитектура Node.js <a name="architectoryNode"></a>
![](./pics/node_3.png)

Глубоко внутри, у нас находятся модули на C++ (Node.js Bindings (привязки)), есть ядро библиотеки, написанное на JS,
есть библиотека libuv на языке С, которая отвечает за кросс-платформенные асинхронные запросы ввода/вывода для работы с 
файлами (потому что они разные под маком, под юниксом, под виндос), ну и, конечно, основа - движок V8. 

### Как функционирует Node.js <a name="howDoesNodeWorks"></a>

![](./pics/node_4.png)

Нода сама по себе однопоточна. Есть свои преимущества посравнению с многопоточностью. У нее есть так называемый один поток
Event Loop, где она постоянно проводит опросы (приходит от пользователя request, мы их опрашиваем, на операции назначаем
обработчики и делегируем нашей библиотеке libuv (non-blocking Input/output), мы туда их перебрасываем и получается мы постоянно
работаем и не останавливаемся, нет никаких блокирующих операций (ждем пока база данных ответит, файловая система и тд, что-то из
них ответит и вернет нам назад ответ, как только он возвращается назад, мы пользователю возвращаем результат).)
 
Про недостаток ноды говорят, что она одноядерная и если у нас есть четырех-ядерный сервер, то Node всегда занимает одно ядро.
Поэтому внутри есть модуль-кластерс, который позволяет одно наше приложение распараллелить на четыре этих ядра. Мы можем
сделать так, что у нас одновременно работает четыре наших приложения, а пользователь когда заправляет Request даже не
не знает на какое приложение Event Loop он попал.   

Сама схема работы Ноды, использует за основу шаблон Реактор

![](./pics/node_5.png)

Шаблон Реактор сам по себе работает в таком плане: 

![](./pics/node_6.png)

* В самом вверху нас есть приложение, так же есть какие-то запросы Ввода/Вывода и затем мы какую-то операцию Ввода/Вывода
отправляем в Демультиплексор событий
* Демультиплексор событий - это в операционной системе (за нее отвечает libuv библиотека, которая как мы раньше говорили
кросс-платформенная, под юниксом она например эмулирует асихонронность), она выделяет какой-то ресурс, операцию и обработчик.
Обработчик - это как раз наша колбэк функция, которая должна выполнится после того как операция закончится. Т.е
мы отправляем демультиплексору событий запрос и ждем, когда он нам что-то там ответи, он  выполняет операцию, наше приложение
продолжает работать (мы как бы отправили запрос и сразу вернулись в приложение (пунктирная линия на картинке)), после того
как мы завершим, мы генерируем событие, что мы закончили работу с ресурсом каким-то (базой данных, файловых системой и тд)
и помещаем в очередь событий на (2) операции наш обработчик. 
* Затем на операции (3), пока наш цикл событий постоянно что-то опрашивает, происходит обход элементов в очереди событий, для
каждого события вызывается обработчик (4), после того как обработчик возвращает после обработки, он возвращает управление
циклу событий (5а), но ситуации бывают разные, мы можем внутри нашего обработчика вызвать еще раз асинхронную операцию (5б)
и все пойдет снова по нашей схеме.
* В цикле события Node все время что-то опрашивает. После того как Цикл событий произошел (6) переходит на демультиплексор
событий, он выполняется и снова по схеме с пункта (2)

### Почему же выбирают Node.js? <a name="WhyDoWeChooseNode"></a>

![](./pics/node_7.png)

Ответы разработчиков Node.js:

* Node.js очкень эффективен, позволяя мне быть очень продуктивным
* Легкая разработка в enterprise, плюс 400 тыс. npm packages.
* Front-end, back-end и тестер имеют одинаковый язык для работы.
* Я могу развиваться и быть продуктивным во всех стеках без необходимости манирулировать другим снитаксисом.
* Тот же язык на клиенте и сервер; js способствует функциональному программированию; Typescript хорошо работает с Node.js.
* Скорость, доступность, набор инструментов. Прекрасный, как глоток свежего воздуха по сравнению с php.
* Так легко писать код в Node.js. Вы можете читать его, как любой человеческий язык.

### Примеры использования Node.js <a name="NodeExamples"></a>

* Чат (https://socket.io/)
* REST API - (http://restify.com/)
* Работа с высоконагруженными БД (MongoDB, Redis)
* Мониторинг - например отслеживание посетителей сайта и визуализация их взаимодействия в режиме реального времени
* Почти любая обработка данных в реальном времени
* Node.js с Express.js также можно использовать для создания классических веб-приложений на стороне сервера

### Для чего мы используем Node.js <a name="WhatAreYouUsingNodeFor"></a>

![](./pics/node_8.png)

## Рабочее окружение и веб-разработка с использование Node.js <a name="WorkEnvironment"></a>

### Системы построения фронтенда <a name="NodeInFront"></a>

![](./pics/node_9.png)

### Фреймоврки <a name="Frameworks"></a>

![](./pics/node_10.png)

### Базы данных <a name="DB"></a>

![](./pics/node_11.png)

### Варианты развертывания Node.js <a name="DB"></a>

![](./pics/node_12.png)

### Вне веб-разработки <a name="OutsideWeb"></a>

![](./pics/node_13.png)

![](./pics/node_14.png)

![](./pics/node_15.png)


## Упраженения и теория детально <a name="examples"></a>

Для примера запишем некий код в файл с именем script.js:

```javascript
var text = 'Hello student!!'
console.log(text);
```

И запустим его из консоли в той директории, где он был создан, следующей командой

```
node script.js
```

В консоли должна появиться надпись:

    Hello student!
    
### Модули <a name="Modules"></a>

Для подключения к вашим скриптам дополнительных функций в Node.js существует удобная система управления модулями NPM. По
сути это публичный репозиторий созданных при помощи Node.js дополнительных программных модулей.

Команда npm позволяет легко устанавливать, удалять или обновлять нужные вам модули, автоматически учитывая при этом все
зависимости выбранного вами подуля от других.

Установка пмодуля производится командой:

    npm install *имя модуля* [*ключи*]
    
Для установки модуля будет использована поддиректория node_modules.

Хотя node_modules и содержит все необходимые для запуска зависимости, распространять исходные код вместе с ней не принято,
т.к. в ней может храниться большое количество файлов, которые занимают ощутимый объем и это неудобно.

С учетом того, что все публичные NPM - модули можно легко установить с помощью npm, достаточно создать и написать для 
вашей программы файл package.json с перечнем всех необходимых для работы зависимостей потом просто, на новом месте, например,
установить все нужные модули командой:

    npm install
    
Node.js работает с системой подключения модулей CommonJS. В структурном плане, CommonJS-модуль представляет собой готовый
к новому использованию фрагмент JavaScript-кода, который экспортирует специальные объекты, доступные для использования в любом
зависимом коде. CommonJS используется как формат JavaScript-модулей, так же и на front-end. Две гланвых идеи CommonJS-модулей:
**объект exports**, содержащий то, что модуль хочет сделать доступным для других частей системы, и **функцию require**,
которая используется одними модулями импорта объекта exports из других.

Начиная с версии 6.х Node.js так же поддерживает подключение модулей согласно стандарту ECMAScript-2015.

Давайте попробуем что-нибдуь подключить. Например, модуль <a href="https://www.npmjs.com/package/colors">Colors</a> для
предыдущего скрипта, и немного перепишем его. Наш скрипт станет выглядеть так:

```javascript
var colors = require('colors');
var text = 'Hello studen!';
console.log(text.rainbow);
```

Выполним команды в консоли:

    npm install colors
    node script.js
    
Увидим разноцветный текст.


### Как работает Node? <a name="HowItWorksInDetail"></a>

В основе Node лежит библиотека **libuv**, реализующая цикл событий **event loop**.

Мы знаем, что объявленная переменная в скрипте автоматически станвоится глобальной. В Node она остается локальной для текущего
модуля и чтобы сделать ее глобальной, надо объявить ее как свойство объекта Global:

    global.foo = 3;
    
Фактически, объект Global - это аналог объекта window из браузера.

Метод **require**, служащий для подключения модулей, не является глобальным и локален для каждого модуля.

Также локальными для каждого модуля являются:

* module.export - объект, отвечающий за то, что именно будет экспортировать модуль при использовании require;

* _filename - имя файла исполняемого скрипта;

* _dirname - абсолютный путь до исполняемого скрипта.

В секцию Global входят такие важные элементы как:

* Class: Buffer - объект используется для операций с бинарными данными.

* Process - объект процесса, большая часть данных находится именно здесь.

Приведем пример работы некоторых из них. Назначение понятно из названий:

    console.log(process.execPath);  // e:\Program Files\nodejs\node.exe
    console.log(process.version);  // v10.5.0
    console.log(process.platform); // win32
    console.log(process.arch);  // ia32
    console.log(process.title);
    console.log(process.pid);

Свойство **process.argv** содержит массив аргументов командной строки. Первым аргументом будет имя исполняемого приложения
node, вторым имя самого исполняемого сценария и только потом сами параметры.

Для работы с каталогами есть следующие свойства - process.cwd() возвращает текущий рабочий каталог, **process.chdir()**
выполняет переход в другой каталог.

Команда **process.exit()** завершает процесс с указанным в качестве аргумента кодом: 0 - успешный код, 1 - код с ошибкой.

Важный метод process.nextTick(fn) запланирует выполнение указанной функции таким образом, что указанная функция будет
выполнена после окончания текущей фазы (текущего исполняемого кода), но перед началом следующей фазы eventloop.

    process.nextTick(function()  {
    console.log('NextTick callback');
    }
    
Объект Process содержит еще много свойств и методов, с которыми можно ознакомиться в
<a href="https://nodejs.org/dist/latest-v4.x/docs/api/process.html">справке</a>.

### События <a name="NodeEvents"></a>

За события в Node.js отвечает специальный модуль **events**.

Назначать объекту обработчик события следует методом addListener(event, listener). Аргументы - это имя события event,
в camelCase формате и listener - функция обратного вызова, обработчик события. Для этого метода есть более короткая запись
**on()**.

Удалить обработчик можно методом **removeListener(event, listener)**.

А метод **emit(event, [args])** позволяет события срабатывать.

Например, событие 'exit' отправляется перед завершением работы Node.

    process.on('exit', function() {
        console.log('Bye!');
    });
    

### Работа с файлами <a name="workWithFiles"></a>

Модуль FileSystem отвечает за работу с файлами. Инициализация модуля происходит следующим образом:

    var fs = require('fs);
    fs.exists(path, callback) - проверка существования файла
    fs.readFile(filename, [options], callback) - чтение файла целиком
    fs.writeFile(filename, data, [options], callback) - запись файла целиком
    fs.appendFile(fileName, data, [options], callback) - добавление в файл
    fs.rename(oldPath, newPath, callback) - переименование файла.
    fs.unlink(path, callback) - удаление файла.
    
Функции **callback** принимают как минимум один параметр err, который равен null при успешном выполнении команды или содержит
информацию об ошибке. Помимо этого при вызове readFile передается параметр data, который содержит уже упоминавшийся объект
типа Buffer, содержащий последовательность прочитанных байтов. Чтобы работать с ним как со строкой, нужно его конвертировать
методом toString()

    fs.readFIle('readme.txt', function (err, data) {
        if (err) {
            throw err;
        }
        console.log(data.toString());
    });
    
Также почти все методы модуля fs имеют синхронные версии функции, оканчивающиеся на Sync. Этим функциям не нужны callback,
т.к. они являются блокирующими и поэтому рекомендованы к применению, только если это требует текущая задача. Давайте
напишем программу, которая будет читать каталог и выводить его содержимое, а для файлов выводить их размер и дату
последнего изменения.

    var fs = require('fs'),
        path = require('path'),
        dir = process.cwd(),
        files = fs.readdirSync(dir);
        
    console.log('Name \t Size \t Date \n');
    
    files.forEach(function (filename) {
        var fullname = path.join(dir, filename),
            stats = fs.statSync(fullname);
        if (stats.isDirectory()) {
            console.log(filename + '\t DIR \t' + stats.mttime + '\n');
        } else {
            console.log(filename + '\t' + stats.size + '\t' + stats.mtime + '\n');
        }
    });
    
Давайте разберем эту программу подробно. В начале мы подключаем два стандартных модуля: 

    var fs = require('fs'),
    path = reuire('path')
    
Первый отвечает за запись и чтения файлов, а модуль path за работу с путями файлов. В переменную dir мы с помощью
метода process.cwd() сохраняем текующую директорию и тут же в переменную files считываем в синхронном режиме
fs.readdirSync(dir) все файлы из текущего каталога. В синхронном потому, что нам надо получить весь список файлов
и поддиректорий из текущей директории, прежде чем приступить к ее анализу. Выводим шапку нашей будущей таблички:

    console.log('Name \t Size \t Date \n');
    
И потом методом forEach по массиву files, прочитанных элементов директории, проходимся и выводим в консоль информацию
об элементах. Через метод path.join соединяем пути к файлу, и в переменную stats записываем инмформацию о текущем файле.
Мы выводим stats.mtime - время создания файла и stats.size для определения размера файла. С помощью stats.isDirectory()
определяем является ли элемент директорией и если да, для него не выводим размер, а ключевое слово DIR.

### Создание консольных приложений <a name='consoleApp'></a>

Традиционно, самым простым способом управления консольными приложениями является передача параметров из консольной
строки при их запуске.

Как выше отмечалось, переданные в скрипт параметры доступны в массиве process.args: ["node", "/.../youscript.js", "param 1", "param 2", ...].
И чтобы получить параметры, нам надо выполнить process.argv.slice(2), который вернет все разделенные пробелами параметры:
["param 1", "param 2", ...]

Так как обрабатывать вручную всевозможные комбинации параметров и их форматы неудобно, для этих целей обычно используют
тот или иной npm-модуль. Один из популярных - это модуль **minimist**, в котором представлен хороший функционал для
этих целей.

Вот как он работает:

    var argv = require('minimist')(process.argv.slice(2));
    console.log(argv);

Способ консольного ввода это построчный ввод данных. Для этого используется стандартный модуль readline.

Инициализация:

    var readline = require('readline');
    var rl = readline.createInterface({
        input: process.stdin,  // ввод из стандартного потока
        output: process.stdout  // вывод в стандартный поток
    });
    
Обработка каждый введенной строки:

    rl.on('line', function (cmd) {
        console.log('You just typed: '+cmd);
    });
    
Получение ответа на вопрос (аналогично promt в браузере):

    rl.question('What is your favorite food?', function (answer) {
        console.log('Oh, so your favorite food is ' + answer);
    });
    
Пауза (блокирование ввода):

    rl.pause()
    
Разблокирвоание ввода:

    rl.resume()
    
Окончание работы с интерфейсом readline:
    
    rl.close()
    
Чтобы закрепить материал, давайте напишем небольшое приложение - "Угадай число", где необходимо будет угадать задуманное
программой число от 1 до 10 и программа в конце выведт, за сколько шагов это было сделано.

Нам понадобиятся стандартные модули fs, readline и нестандартный, а значит, его надо установить с помощью npm, модуль
minimist. Приведем листинг программы и разберем ее.

    var readline = require('readline'),
        argv = require('minimist')(process.argv.slice(2)),
        fs = require('fs'),
        mind, count, rl, logfile;
        
    function init() {
        // получим случайное число от 1 до 10
        mind = Math.florr(Math.random() * 10) +1;
        // Обнулим счетчик количества угадываний
        count = 0;
        // Установим ввод и вывод в стандартные потоки
        rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        // Запомним имя файла для логов, если он есть
        logfile = argv['_'][0];
    }
    
    function game() {
        function log(data) {
            if (logfile != undefined)
                    fs.appendFileSync(logfile, data + "\n");
        }
        
        function valid(value) {
            
            if (isNaN(value)) {
                console.log('Введите число!');
                return false;
            }
            
            if (value < 1 || value > 10) {
                console.log('Число должно лежать в заданном диапазоне!');
                return false;
            }
            
            return true;
        }
        
        rl.question('Введите любое число от 1 до 10, чтобы угадать задуманное: ',
            function (value) {
                var a = +value;
                if (!valid(a)) {
                    // если валидацию не прошли - запускаем игру заново
                    game();
                } else {
                    count += 1;
                    if (a === mind) {
                        console.log('Поздравляем! Вы угадали число за %d шага(ов)', count);
                        log('Поздравляем ! Вы угадали число за ' + count + ' шага(ов)');
                        // угадали и закрыли экземпляр Interface, конец программы
                        rl.close();
                    } else {
                        console.log('Вы не угадали, еще попытка');
                        game();
                    }
                }
            }
        );
    }
    
    init();
    game();
    
Вся программа состоит из двух функций. Вызова функции инициализации init(); и вызов самой функции игры game();, которая 
будет вызывать себя рекурсивно при неверно угаданном числе. Инициализация довольно простая и особого пояснения не требует
(все ясно из комментариев). Внутри функции game() мы описали еще две вспомогательные функции. Одна будет писать результат
игры в файл, если он передан через строку параметров:

    function log(data) {
        if (logfile != undefined)
                fs.appendFileSync(logfile, data + "\n");
    }
    
А вторая - valid будет првоерять валидны ли значения, которые вводит пользователь в консоли.

Сама программа состоит в вызове метода:

    rl.question('Введите любое число от 1 до 10, чтобы угадать задуманное: ',
                function (value) {...});
                
который прослушивает консоль и при вводе значения вызывает callback функцию, которая обрабатывает введеное значение.

Если мы не проходим валидацию, то запускаем функцию игры заново:

    if (!valid(a)) {
        // если валидацию не прошли - запускаем игру заново
        game();
        
Если валидация пройдена, то мы увеличиваем счетчик на 1, т.е. засчитываем попытку count +=1; И сравниваем введеное
значение с "задуманным". Если число угадано, то мы выводим поздравление и количество попыток, затраченное на игру, потом
с помощью функции log пытаемся сохранить результат в файле, если это возможно и закрываем интерфейс ввода
rl.close(); если же результат не совпал, выполняем рекурсию. Можете чуть улучшить этот пример, использовав модуль colors,
чтобы сделать вывод информации цветным по смыслу.

### Простой сайт на Node.js <a name="siteOnNode"></a> 

Веб-сервер на Node.js состоит из нескольких строчек кода:

    var http = require('http');
    http.createServer(function(req, res) {
        console.log('HTTP server running');
    }).listen(8080);
    
Что здесь происходит? Это легко понять. Сначала мы запрашиваем модуль 'http', затем создаем сервер http.createServer и
запускаем его listen на порту 8080. Метод createServer объекта http принимает в качестве аргумента анонимную функцию
обратного вызова, аргументами который, в свою очередь служат объекты req - request и res - response. Они соответсвуют
поступавшему HTTP-запросу и отдаваемому HTTP-ответу. Если мы запустим в консоли наш скрипт server.js и потом в браузере
обратимся по адресу http://localhost:8080/, то в консоли будет наше переданное сообщение

Но в самом бразуере мы ничего пока не увидим. Остановим выполнение скритпа комбинацией Ctrl+C и допишем следующий код:

    var http = require('http');
    http.createServer(function(req, res) {
        console.log('HTTP server running');
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('<h1>Hello student!!!</h1>');
    }).listen(8080);
    
Теперь мы сможем видеть наш результат на странице.

Как мы видим, HTTP-запрос не ялвяется инциатором запуска всей программы. Создается Javascript-объект и ждем запросы,
при поступлении которых срабатывает связанная с этим событием анонимная функция. В принципе неплохо, но мы уже работали с
файлами и давайте заставим сервер отдавать нам страницу HTML.

Создадим простую веб-страницу:

    var http = require('http');
    var fs = require('fs')
    var PORT = 8087;
    http.createServer(function(req, res) {
        fs.readFile('index.html', 'utf8', function (err, data) {
            if (err) {
                res.writeHead(404, {
                    'Content-Type': 'text/html'
                });
                res.end('Error load index.html');
            } else {
                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                res.end(data);
            }
        })
    }).listen(PORT);
    
    console.log(`HTTP server running on port ${PORT}`);

Но все это полумеры, мы не можем так подключить стили (только внутренние), скрипты и картинки.

Создадим следующую простую структуру сайта:

    --css
        style.css
    --img
    --js
        main.js
    index.js
    server.js
    
Файл index.html содержит такую

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" href="/css/style.css">
    <title>simple-site</title>
    <style>
        h1 {
            color: blue;
            transition: color 200ms ease-in;
        }

        h1:hover {
            color: black;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <h1>kek</h1>
    </div>
    <footer class="page__bottom">
        <div>
            footer
        </div>
    </footer>
    <script src="js/main.js"></script>
</body>
</html>
```

Если мы попробуем отобразить его предыдущим скриптом, он выведет только html-контент, без стилей, картинок и javascript-скриптов.
Скрипт, который обработает все правильно, будет следующим:

```javascript
var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');
var typeMime = {
    '.html': 'text/html',
    '.htm': 'text/htm',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/png',
};
var PORT = 8087;

http.createServer(function(req, res) {
    var _url = url.parse(req.url),
        filename = _url.pathname.substring(1),
        extname,
        type,
        img;
    
    if (_url.pathname === '/') {
        filename = 'index.html';
    }
    
    extname = path.extname(filename);
    type = typeMime[path.extname(filename)];
    
    if ((extname === '.png') || (extname === '.jpg')) {
        img = fs.readFileSync(filename);
        res.writeHead(200, {
            'Content-Type': type
        });
        res.write(img, 'hex');
        res.end();
    } else {
        fs.readFile(filename, 'utf8', function (err, content) {
            if (err) {
                res.writeHead(404, {
                    'Content-Type': 'text/plain; charset=utf-8'
                });
                res.write(err.message);
                res.end();
            } else {
                res.writeHead(200, {
                    'Content-Type': type
                });
                res.write(content);
                res.end();
            }
        })
    }
}).listen(PORT);

console.log(`HTTP server running on port ${PORT}`);
```

Здесь мы видим объект с mime-типами, который позволит нам загружать разнообразный контент:

        var typeMime = {
            '.html': 'text/html',
            '.htm': 'text/htm',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.png': 'image/png',
            '.jpg': 'image/png',
        };
        
У нас есть новые модули, один из них path = require('path'), который отвечает за различные операции с путями файлов. Так
как в GET-запросах параметры передаются через url, для их обработки вы должны проанализировать эту строку. Удобно сделать
это с помощью стандартного модуля url и его функции parse _url = url.parse(req.url).

Находим имя файла, которому произошел HTTP-запрос:

    filename = _url.pathname.substring(1),
    
Если это обращение к корню сайта, то вызывать будем index.html

    if (url.pathname === '/') {
        filename = 'index.html';
    }
    
Далее находим расширение файла, на который поступил запрос, и выбираем тут же ему mime-тип в переменную type

    extname = path.extname(filename);
    type = typeMime[path.extname(filename)];
    
Первым делом проверяем, не пришел ли запрос на картинку. Поскольку это двоичные файлы, то мы в метод write вторым параметром
передаем кодировку 'hex'

    if ((extname === '.png') || (extname === '.jpg')) {
            img = fs.readFileSync(filename);
            res.writeHead(200, {
                'Content-Type': type
            });
            res.write(img, 'hex');
            res.end();
    }

Обратите внимание, что мы здесь проверяем только графические файлсы с расширениями png и jpg.

А дальше идет, как и раньше подгрузка файлов, но с учетом mima-типа файла. Если все сделали верно, мы должны увидеть наш
полноценный сайт со всеми стилями и картинками.

### Сетевые запросы <a name="webRequests"></a>

Стандартный модуль http содержит функцию get для отправки GET запросов и функцию request для отправки POST и прочих
запросов.

Пример отправки GET запроса:

```javascript
var http = require('http');
http.get("http://loftschool.com/", function(res) {
  console.log("Статус ответа: " + res.statusCode);
}).on('error', function(e) {
    console.log("Статус ошибка " + e.message);
});
```

Пример отправки POST запроса:

```javascript
var http = require('http');
var options = {
    hostname: 'loftschool.com',
    port: 80,
    path: '/',
    method: 'POST'
};

var req = http.request(options, function (res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      console.log('BODY: ' + chunk);
    })
})
req.on('error', function(e) {
  console.log('Возникла проблема с ответом от сервера: ' + e.message);
});
req.write('data\n');
req.end();
```

В основном используют популярный и удобный npm-модуль для работы с исходящими сетевыми запросами - request.

Пример отправки GET-запроса:

```javascript
var request = require('request');
request('http://loftschool.com/', function (err, res, body) {
    if (!err && res.statusCode == 200) {
        console.log(body);
    }
})
```

Мы напечатаем в консоль заглавную страницу школы loftschool.

Пример отправки POST запроса:

```javascript
var request = require('request');
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
```

Этот модуль полезен тем, что позволяет автоматически обрабатывать JSON, работать с учетом редиректов или без них, поддерживает
BasicAuth и OAuth, проксиз и, наконец, поддерживает cookies.

### Express <a name="express"></a>

Express - это минималистичный и гибкий веб-фреймворк для приложений Node.js, предоставляющий обширный набор функций для
мобильных и веб-приложений.

Имея в своем распоряжении множество служебных методов HTTP и промежуточных обработчиков, создать надежный API можно
быстро и легко.

Express предоставляет тонкий слой фундаментальных функций веб-приложений, которые не мешают вам работать с давно знакомыми
и любимыми вами функциями Node.js.

**Установка**. Создайте каталог для своего приложения и сделайте его своим рабочим каталогом.

    $ mkdir myapp
    $ cd myapp
    
С помощью команды npm init создайте файл package.json для своего приложения.

Теперь установите Express в каталоге app и сохраните его в списке зависимостей. Например:

    $ npm install express --save
    
Для временной установки Express, без добавления ег ов список зависимостей, не указывайте опцию --save:

    $ npm install express
    
В каталоге myapp создайте файл с именем app.js и добавьте следующий код:

```javascript
var express = require('express');
var app = express();

app.get('/', function(req, res) {
  res.send('Hello World!');
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
```

Приложение запускает сервер и слушает соединения на порте 3000. Приложение выдает ответ 'Hello World!' на запросы, адресованные
корневому URL (/) или маршруту. Для всех остальных путей ответом будет 404 Not Found.

Но Express хорош тем, что может использоваться для быстрого создания "скелета" приложения. Для этого используется инструмент
для генерации приложений express.

Установите express глобально с помощью следующей команды:

    $ npm install express-generator -g
    
Следующая команда создает приложение Express с именем myapp в текущем рабочем каталоге:

    $ express myapp
    
Перейдем в каталог и установим зависимости:

    $ cs myapp
    $ npm install
    
В MacOS или Linux запустите приложение с помощью следующей команды:

    $ DEBUG=myapp:* npm start
    
В Windows используется следующая команда:

    > set DEBUG=myapp:* & npm start
    
Затем откройте страницу http://localhost:3000/ в браузере для доступа к приложению.

Наше веб-приложение готово и можно начинать работать.

По умолчанию Express работает с шаблонизатором pug(jade),

    // view engine setup
    app.set('views', path.join(_dirname, 'views'));
    app.set('view engine', 'jade');
    
но можно подлючить и другие шаблонизаторы, если вы работаете с ними.

## Модули и файловая система <a name="ModulesAndFilesSystem"></a>

exports - ссылка на модуль exports, его нельзя переприсваивать, иначе мы потеряем ссылку. Но ему можно присваивать свойства

Обычные модули - это когда мы импортируем модуль у которого просто присваиваются новые свойства в его exports.

name.js
```javascript
exports.info = (msg) => {
    console.log(`Info: ${msg}`)
}

exports.log = (msg) => {
    console.log(`Log: ${msg}`)
}
```

main.js
```javascript
const name = require('./name.js')

name.info('name')
name.log('name')
```

Есть так же шаблон substack. Основной принцип модуля такой - Одна функциональность, одна зависимость. Иногда возникает
необходимость прикрепить что-то дополнительно к нашему модулю. У нас в папке substack, есть файл index.js. У нас есть
одна функциональность, которая работает через module.exports, но мы хотим прикрепить дополнительные фичи для
module.exports.log свойства. И если мы так делаем - это называется substack.

И последнее это когда мы делаем Class. 

class.js
```javascript
class My {
  constructor(name) {
    this.name = name;
  }

  info(msg) {
    console.log(`Info: ${msg}`);
  }
  log(msg) {
    console.log(`Log: ${msg}`);
  }
}

module.exports = My;
```

main.js
```javascript
const My = require('./class.js')

const my = new My('My');

my.info('class');
my.log('class');
```
### Как работает require, делаем свой <a name="customRequire"></a>
Теперь попытаемся реализовать require, у нас есть test.js и main.js

test.js
```javascript
module.exports = () => {
    console.log('Test module');
}
```

В main.js подключим модуль fs для работы с файлами

Сохраним ссылку на наш оригинальный require (Чтобы самим не обрабатывать пути)

Сделаем функцию loadModule (загрузчик модулей), он будет принимать 3 параметра: имя файла, объект модуля и require
Внутри функции определим шаблонную строку (wrapSrc), в ней опишем IEF, все что мы определяем внутри нее, будет находится
только внутри нее. Она может принимать параметры: module, exports, require. В сам IEF мы передаем модуль, ссылку на модуль
(module.exports) и сам require. Внутри функции, мы загружаем наш файл с помощью fs.readFileSync. И выполним нашу шаблонную
строку через eval.

main.js
```javascript
const fs = require('fs');

const originalRequire = require; 

function loadModule(filename, module, require) {
  const wrapSrc = `
    (function(module, exports, require){
        ${fs.readFileSync(filename, 'utf-8')}
    })(module, module.exports, require)
  `;
  eval(wrapSrc);
}
```

Теперь нам нужно переопределить свой require. Посколько commonjs в отличии от import это синхронные модули, он грузится
всего один раз и кешируется.

```javascript
var require = (moduleName) => {
    const id = require.resolve(moduleName); // чтобы правильно нашел путь до файла без ошибок
    
    // кешируем модуль
    if (require.cache[id]) {
        return require.cache[id].exports;
    }
    
    // сам модуль
    const module = {
        exports: {},
        id: id
    }
    
    // положили модуль в кеш
    require.cache[id] = module;
    
    // грузим модуль
    loadModule(id, module, require);
    
    // полсе загрузки модуля, возвращаем модуль
    return module.exports;
}

// создаем require.cache и require.resolve
require.cache = {};
require.resolve = (moduleName) => {
    return originalRequire.resolve(moduleName); 
}
```

Теперь когда мы переопределили require, мы можем его использовать

```javascript
const test = require('./test');

test();
```

### Цикличность <a name="cycle"></a>

Создадим для примера модули: a.js и b.js; файл main.js

Рассмотрим проблему, если модуль загрузился, то он берется из кеша. Из-за чего могут быть такие проблемы:

a.js
```javascript
exports.loaded = false;

const b = require('./b');

// Делаем цикличность (модули друг на друга начинают ссылаться)
module.exports = {
    bWasLoaded: b.loaded,
    loaded: true
}
```

b.js
```javascript
exports.loaded = false;

const a = require('./a');

// Делаем цикличность (модули друг на друга начинают ссылаться)
module.exports = {
    aWasLoaded: a.loaded,
    loaded: true
}
```

main.js
```javascript
const a = require('./a');
const b = require('./b');

console.log(a);
console.log(b);
```

Как это будет работать...Мы грузим модуль а, у него есть свойство loaded = false и дальше грузится модуль b (для модуля
b, модуль a еще не загружен). Когда запустим main.js увидим данную картинку

```javascript
{ bWasLoaded: true, loaded: true }
{ aWasLoaded: false, loaded: true }
```

Т.е. мы загружаем модуль а, нода начинает его грузить, она встречает, что нужно загружить модуль b, свойство модуля a
пока что - false, переходит в модуль b, там loaded свойство тоже false, но мы начинаем require модуль a, но у нас модуль
a уже грузится, т.е. он уже в кеше и в модуле b он уже не будет подружать модуль a и в module.exports будет выстовлено
aWasLoaded: false.

После окончания загрузки модуля a, возвращаемся в модуль b, но так как мы уже вызывали его в модули а, то он берется из кеша.

### Import <a name="import"></a>

Асинхронные модули с расширением mjs. Создадим два файла test.mjs и main.mjs

test.mjs
```javascript
export default function test(msg) {
  console.log('Info: ' + msg);
}
```

main.mjs
```javascript
import info from './test';

info('test import')
```

Чтобы запустить данные модули есть команда `node --experimental-modules my-app.mjs`

### Console-process <a name="consoleProcess"></a>

```javascript
console.log(process.execPath);  // путь до node.exe
console.log(process.version);  // версия ноды
console.log(process.platform);  // win32
console.log(process.arch);  // x64
console.log(process.title);  // путь до исполняемого файла
console.log(process.pid);  // 11000 - номер процесса
console.log(process.cwd());
console.log(process.argv); // аргументная строка - то что передалось

console.log('Test %d str %s', 34, 'stroka'); // Test 34 str stroka 

let a = 5;
let b = 14;
try {
    console.assert(a > b, 'Fail: A > B');
} catch (err) {
    console.log(err.message);
}

process.on('exit', (code) => {
    console.log('Exit: ' + code);
})

process.exit(1);
```

### Module path <a name="modulePath"></a>

Модуль path позволяет работать с путями

```javascript
const path = require('path');

console.log(path.relative('/data/orandea/test/aaa', '/data/orandea/impl/bbb')); // находит относительный путь из одной папки в другую
console.log(path.resolve('/foo/bar', './baz')); // соединяет директории и превращает в абсолютный путь
console.log(path.normalize('/foo/bar//baz/asdf/quux/..')); // приводит к более вменяемому виду 
console.log(path.normalize('C:\\temp\\\\foo\\bar\\..\\'));
console.log(path.parse('/home/user/dir/file.txt'));
console.log(path.join('/foo', 'bar', 'baz/asdf', 'quux', '..')); // соединяет пути
console.log(path.sep);  // если надо вставить разделить в путях, то используем его.
```
