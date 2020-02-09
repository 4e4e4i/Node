const {Client} = require('pg');

const db = new Client({
    user: 'teplaya_postelka',
    host: 'localhost',
    database: 'test',
    password: '',
    post: 5432
});

db.connect();

db.query('SELECT * FROM public.students', (err, data) => {
    if (err)
        throw new Error(err)
    console.log(data.rows);
    db.end();
});
