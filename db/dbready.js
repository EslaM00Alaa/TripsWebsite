const client = require("./db");

async function isReady() {
    try {
      const tableCheckQuery = `
        SELECT EXISTS (
          SELECT 1
          FROM information_schema.tables
          WHERE table_name = $1
        );
      `;
  
      const createTableQueries = [
        `CREATE TABLE classes (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description VARCHAR(1000) NOT NULL
        );`,
        `CREATE TABLE types (
            id SERIAL PRIMARY KEY,
            class_id INT REFERENCES classes(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            description VARCHAR(1000) NOT NULL
        );`,
      `
      CREATE TABLE IF NOT EXISTS images (
        image_id VARCHAR(255) PRIMARY KEY,
        image VARCHAR(255) NOT NULL
      );
      `,
        `
        CREATE TABLE IF NOT EXISTS blogs (
          id VARCHAR(255) PRIMARY KEY,
          description VARCHAR(1000) NOT NULL,
          date VARCHAR(255) NOT NULL 
        );
        `
    ];
    
  
      const tablesToCheck = [
        "classes",
         "types",
         "images",
         "blogs"
      ];
  
      let c = 0;
  
      for (let i = 0; i < tablesToCheck.length; i++) {
        const res = await client.query(tableCheckQuery, [tablesToCheck[i]]);
        const existingTable = res.rows[0].exists;
  
        if (!existingTable) {
          await client.query(createTableQueries[i]);
          c++;
        }
      }
  
      console.log(`${c} tables created successfully!`);
    } catch (error) {
      console.error('Error occurred:', error);
    } 
  }
  
  module.exports = isReady;