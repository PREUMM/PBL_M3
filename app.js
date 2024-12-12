const express = require('express')
const app = express()
const port = 3000
app.use(express.static('public'))

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

app.listen(port, () => {
  console.log("Running on Port 3000")
})
