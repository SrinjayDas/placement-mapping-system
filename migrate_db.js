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
    
    console.log('Checking student table columns...');
    const [cols] = await conn.execute('DESCRIBE student');
    const hasPassword = cols.some(col => col.Field === 'Password');
    
    if (!hasPassword) {
      console.log('Adding Password column...');
      await conn.execute('ALTER TABLE student ADD COLUMN Password VARCHAR(255)');
    } else {
      console.log('Password column already exists.');
    }
    
    console.log('Setting passwords to RegisterNo...');
    await conn.execute('UPDATE student SET Password = RegisterNo');
    
    console.log('Database updated successfully.');
    conn.end();
  } catch(e) {
    console.error('Migration failed:', e.message);
  }
}
run();
