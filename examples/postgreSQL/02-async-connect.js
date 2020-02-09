const {Client} = require('pg');

const db = new Client({
    user: 'teplaya_postelka',
    host: 'localhost',
    database: 'test',
    password: '',
    post: 5432
});

async function connect() {
    await db.connect();

    // await db.query('INSERT INTO public.students(s_id, name, start_year)' +
    //     'VALUES ($1, $2, $3)', [1567, 'Рамиль', 2020]);
    await db.query('UPDATE public.students SET start_year = $1 WHERE s_id = 1567', [2019]);
    const data = await db.query('SELECT * FROM public.students');
    console.log(data.rows);
    db.end;
}

connect();
