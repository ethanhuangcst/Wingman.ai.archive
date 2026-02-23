const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration (matching db.ts)
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'password',
  database: 'wingman_db'
};

async function createDatabaseDump() {
  let connection;
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Connected to database');
    
    // Get all tables
    const [tables] = await connection.execute(
      'SHOW TABLES FROM wingman_db'
    );
    
    const tableNames = tables.map(row => Object.values(row)[0]);
    console.log('Found tables:', tableNames);
    
    let dumpContent = `-- Wingman Database Dump
-- Date: ${new Date().toISOString()}
-- Server: ${dbConfig.host}:${dbConfig.port}
-- Database: ${dbConfig.database}

`;
    
    // Dump each table's structure and data
    for (const tableName of tableNames) {
      console.log(`Dumping table: ${tableName}`);
      
      // Get table structure
      const [structure] = await connection.execute(
        `SHOW CREATE TABLE ${tableName}`
      );
      const createTableSQL = structure[0]['Create Table'];
      
      dumpContent += `-- Table structure for table ${tableName}\n`;
      dumpContent += `DROP TABLE IF EXISTS ${tableName};\n`;
      dumpContent += `${createTableSQL};\n\n`;
      
      // Get table data
      const [rows] = await connection.execute(
        `SELECT * FROM ${tableName}`
      );
      
      if (rows.length > 0) {
        dumpContent += `-- Data for table ${tableName}\n`;
        dumpContent += `INSERT INTO ${tableName} VALUES\n`;
        
        const values = rows.map(row => {
          const rowValues = Object.values(row).map(value => {
            if (value === null) return 'NULL';
            if (typeof value === 'string') {
              return `'${value.replace(/'/g, "''")}'`;
            }
            if (value instanceof Date) {
              return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
            }
            return value;
          });
          return `(${rowValues.join(', ')})`;
        });
        
        dumpContent += values.join(',\n') + ';\n\n';
      }
    }
    
    // Write dump to file
    const dumpFilePath = path.join(__dirname, 'wingman_db_dump.sql');
    fs.writeFileSync(dumpFilePath, dumpContent);
    
    console.log(`\nDatabase dump created successfully: ${dumpFilePath}`);
    console.log(`Dump size: ${Math.round(fs.statSync(dumpFilePath).size / 1024)} KB`);
    
  } catch (error) {
    console.error('Error creating database dump:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the script
createDatabaseDump();
