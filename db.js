const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

// Connect to SQLite database
const db = new sqlite3.Database('UniTrack.db', (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to UniTrack.db');
  }
});

// ------------------ Create Tables ------------------

// Users table
const CreateUserTable = `
CREATE TABLE IF NOT EXISTS User (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user'
);
`;

// Requests table
const CreateRequestTable = `
CREATE TABLE IF NOT EXISTS Request (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    category TEXT NOT NULL,
    language TEXT,
    priority TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    technician_id INTEGER DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (technician_id) REFERENCES User(id)
);
`;

// Trigger to auto-update updated_at on any update
const UpdateRequestTrigger = `
CREATE TRIGGER IF NOT EXISTS update_request_updated_at
AFTER UPDATE ON Request
FOR EACH ROW
BEGIN
    UPDATE Request SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
`;

// ------------------ Initialize Database ------------------
db.serialize(() => {
  // Create tables
  db.run(CreateUserTable);
  db.run(CreateRequestTable);
  db.run(UpdateRequestTrigger);

  // Auto-insert default admin user
  const defaultPassword = bcrypt.hashSync('admin1234', 10);
  db.run(
    `INSERT OR IGNORE INTO User (name, email, password, role)
     VALUES (?, ?, ?, ?)`,
    ['Admin User', 'admin@example.com', defaultPassword, 'admin'],
    (err) => {
      if (err) console.error(err.message);
      else console.log('Default admin user ensured in database');
    }
  );

  // Optional: Insert a test request if table is empty
  db.get("SELECT COUNT(*) AS count FROM Request", (err, row) => {
    if (err) console.error(err.message);
    else if (row.count === 0) {
      db.run(
        `INSERT INTO Request (title, location, category, priority, description)
         VALUES (?, ?, ?, ?, ?)`,
        ['Test Request', 'Library', 'Maintenance', 'High', 'This is a test request'],
        (err) => {
          if (err) console.error(err.message);
          else console.log('Test request inserted into Request table');
        }
      );
    }
  });
});

module.exports = { db };
