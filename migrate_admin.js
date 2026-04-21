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
    
    console.log('Creating admin table...');
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS admin (
        AdminID INT AUTO_INCREMENT PRIMARY KEY,
        Username VARCHAR(50) UNIQUE NOT NULL,
        Password VARCHAR(255) NOT NULL
      )
    `);
    
    console.log('Initializing admin account...');
    // Use INSERT IGNORE to avoid errors on re-run if Username is unique
    await conn.execute("INSERT IGNORE INTO admin (Username, Password) VALUES ('admin', 'admin')");
    
    console.log('Database updated successfully.');
    conn.end();
  } catch(e) {
    console.error('Migration failed:', e.message);
  }
}
run();
