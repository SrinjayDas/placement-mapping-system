const mysql = require('mysql2/promise');

async function run() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '0000',
      port: 3306,
      database: 'placement_db'
    });
    const [cols] = await conn.execute('DESCRIBE eligibility_criteria');
    console.log(JSON.stringify(cols, null, 2));
    const [data] = await conn.execute('SELECT * FROM eligibility_criteria LIMIT 1');
    console.log('Sample Data:', JSON.stringify(data, null, 2));
    conn.end();
  } catch(e) {
    console.error(e.message);
  }
}
run();
