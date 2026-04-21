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
    
    console.log('Checking drive table columns...');
    const [cols] = await conn.execute('DESCRIBE drive');
    const hasMaxIntake = cols.some(col => col.Field === 'MaxIntake');
    
    if (!hasMaxIntake) {
      console.log('Adding MaxIntake column...');
      await conn.execute('ALTER TABLE drive ADD COLUMN MaxIntake INT DEFAULT 50');
      console.log('MaxIntake column added successfully.');
    } else {
      console.log('MaxIntake column already exists.');
    }
    
    conn.end();
  } catch(e) {
    console.error('Migration failed:', e.message);
  }
}
run();
