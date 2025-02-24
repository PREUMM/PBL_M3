const express = require('express')
const multer = require("multer");
const bodyParser = require('body-parser')
const db = require('./db');
const path = require("path");

const app = express()
const port = 3000
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
const { Pool } = require('pg');

app.use("/uploads", express.static("uploads"));
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
// db.query('DROP TABLE IF EXISTS studyGroups');
db.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
db.query('TRUNCATE TABLE studyGroups RESTART IDENTITY CASCADE');
db.query(`
  CREATE TABLE IF NOT EXISTS studyGroups (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      meetingDay VARCHAR(255) NOT NULL,
      meetingTime TIME NOT NULL,
      description TEXT NOT NULL,
      level VARCHAR(255) NOT NULL,
      maxMembers INT NOT NULL,
      createdBy VARCHAR(255) NOT NULL,
      members TEXT[],
      posts TEXT[]
  );
`)
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
`, () =>
{
    console.log('Table "users" created or already exists.');
    db.query(`
        INSERT INTO users (id, username, email, password)
        VALUES (0, 'admin', 'admin@gmail.com', 'admin')
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
const getGroups = (callback) => {
    db.query('SELECT * FROM studyGroups', (err, result) => {
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
app.get('/login.html', (req, res) => {
  res.redirect('/login')
})
app.get('/consultant', (req, res) => {
  res.sendFile(__dirname + '/consultant.html')
})
app.get('/create-group', (req, res) => {
  res.sendFile(__dirname + '/create-group.html')
})
app.get('/friends', (req, res) => {
  res.json("There's nothing here")
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
app.get('/groups/:group', (req, res) => {
  res.sendFile(__dirname + '/group.html')
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
            res.json(result.rows);
        }
    } catch (err) {
        console.error('Error fetching user:', err.message);
        res.status(500).json({ error: "Internal server error" });
    }
});
app.get('/api/db/allGroups', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT * FROM studyGroups
        `);

        if (result.length === 0) {
            res.status(404).json({ error: "Table not found" });
        } else {
            res.json(result.rows);
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
        console.error(err.message);
        res.status(500).json({ error: "Failed to create user" });
    }
});
app.post('/api/db/createGroup', async (req, res) => {
  console.log(req.body);
  try {
    await db.query(`
      INSERT INTO studyGroups (name, subject, meetingDay, meetingTime, description, level, maxMembers, createdBy, members, posts)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id
    `, [
      req.body.name,
      req.body.subject,
      req.body.meetingDay,
      req.body.meetingTime,
      req.body.description,
      req.body.level,
      req.body.maxMembers,
      req.body.createdBy,
      req.body.members,
      req.body.posts
    ]);
    res.redirect('/login');
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to create group" });
  }
});
app.post('/api/db/joinGroup', async (req, res) => {
    const { uid, email, group } = req.body;

    try {
        await db.query(`
            UPDATE studyGroups
            SET members = array_append(members, $1)
            WHERE id = $2 AND NOT (members @> ARRAY[$1])
        `, [email, group]);
        console.log("Joining group:", { email, group });
        res.json({ success: true, message: "User added to the group" });
    } catch (err) {
        console.error('Error joining group:', err.message);
        res.status(500).json({ error: "Failed to join group" });
    }
});
app.post('/api/db/leaveGroup', async (req, res) => {
    const { uid, email, group } = req.body;

    try {
        await db.query(`
            UPDATE studyGroups
            SET members = array_remove(members, $1)
            WHERE id = $2
        `, [email, group]);
        console.log("leaveGroup");
        res.json({ success: true, message: "User removed from the group" });
    } catch (err) {
        console.error('Error leaving group:', err.message);
        res.status(500).json({ error: "Failed to leave group" });
    }
});
app.post("/api/db/post", upload.single("image"), async (req, res) => {
    const { text, timestamp, user, groupId } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    try {
        const groupResult = await db.query("SELECT posts FROM studyGroups WHERE id = $1", [groupId]);
        if (groupResult.rows.length === 0) {
            return res.status(404).json({ error: "Group not found" });
        }

        let posts = groupResult.rows[0].posts || [];
        posts.push(JSON.stringify({ text, timestamp, image, user }));

        await db.query("UPDATE studyGroups SET posts = $1 WHERE id = $2", [posts, groupId]);

        res.json({ message: "Post added successfully!", image });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Database error" });
    }
    db.query('SELECT * FROM studyGroups', (err, result) => {
        if (err) {
            console.error('Error reading table:', err.message);
        } else {
            console.log('Groups:', result.rows);
        }
    });
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
