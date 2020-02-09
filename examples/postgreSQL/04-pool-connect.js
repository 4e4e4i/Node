const {Pool} = require('pg');

const pool = new Pool({
    user: 'teplaya_postelka',
    host: 'localhost',
    database: 'test',
    password: '',
    post: 5432,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
});

async function connect() {
    const db = await pool.connect();

    const data = await db.query('SELECT * FROM public.students');
    console.log(data.rows);
    db.end().then(() => console.log('pool has ended'));
}

connect();
