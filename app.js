const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const port = 3000
const db = require('./db');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'))

async function testConnection() {
    try {
        const result = await db.query('SELECT NOW()');
        console.log('Connection successful:', result.rows);
        console.log('POSTGRES CONNECTED');
    } catch (err) {
        console.error('Connection error:', err);
    }
}
testConnection();
// db.query('DROP TABLE IF EXISTS users');
db.query(`
  CREATE TABLE IF NOT EXISTS studyGroups (
      id BIGINT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      meetingDay VARCHAR(255) NOT NULL,
      meetingTime TIME NOT NULL,
      description TEXT NOT NULL,
      level VARCHAR(255) NOT NULL,
      maxMembers INT NOT NULL,
      createdBy VARCHAR(255) NOT NULL,
      members TEXT[]
  );
`) // Hello
db.query(`
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        profileImage VARCHAR(255),
        major VARCHAR(255),
        interests VARCHAR(255),
        bio VARCHAR(255)
    )
`, () => {
    console.log('Table "users" created or already exists.');
    db.query(`
        INSERT INTO users (username, email, password)
        VALUES ('admin', 'admin@gmail.com', 'admin')
    `, () => {
        console.log('Initial data inserted.');
        db.query('SELECT * FROM users', (err, result) => {
            if (err) {
                console.error('Error reading table:', err.message);
            } else {
                console.log('Users:', result.rows);
            }
        });
    });
});
const getUsers = (callback) => {
    db.query('SELECT * FROM users', (err, result) => {
        if (err) {
            console.error('Error reading table:', err.message);
            callback(err, null);
        } else {
            callback(null, result.rows);
        }
    });
};

app.get('/', (req, res) => {
  res.redirect('/login')
})
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html')
})
app.get('/consultant', (req, res) => {
  res.sendFile(__dirname + '/consultant.html')
})
app.get('/create-group', (req, res) => {
  res.sendFile(__dirname + '/create-group.html')
})
app.get('/friends', (req, res) => {
  res.sendFile(__dirname + '/friends.html')
})
app.get('/groups', (req, res) => {
  res.sendFile(__dirname + '/groups.html')
})
app.get('/index', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})
app.get('/profile', (req, res) => {
  res.sendFile(__dirname + '/profile.html')
})
app.get('/register', (req, res) => {
  res.sendFile(__dirname + '/register.html')
})
app.get('/schedule', (req, res) => {
  res.sendFile(__dirname + '/schedule.html')
})

app.get('/api/msg', (req, res) => {
  res.json({ message: 'Hello from the server!', timestamp: new Date() });
})
app.get('/api/db/findUser/:id', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT * FROM users
            WHERE id = $1;
        `, [req.params.id]);

        if (result.rows.length === 0) {
            res.status(404).json({ error: "User not found" });
        } else {
            res.json(result.rows[0]);
        }
    } catch (err) {
        console.error('Error fetching user:', err.message);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.get('/api/db/allUsers', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT * FROM users
        `);

        if (result.length === 0) {
            res.status(404).json({ error: "Table not found" });
        } else {
            res.json(result);
        }
    } catch (err) {
        console.error('Error fetching user:', err.message);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.post('/api/db/createUser', async (req, res) => {
    try {
        await db.query(`
            INSERT INTO users (username, email, password)
            VALUES ($1, $2, $3)
        `, [req.body.username, req.body.email, req.body.password]);

        res.redirect('/login');
    } catch (err) {
        console.error('Error creating user:', err.message);
        res.status(500).json({ error: "Failed to create user" });
    }
});

getUsers((err, users) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('Users:', users);
    }
});

app.listen(port, () => {
  console.log("Running on Port 3000")
})
