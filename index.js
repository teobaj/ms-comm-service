const express = require('express')
const { register, users, login, getUserById, getUserByName, getUserByKey } = require('./users')
const app = express()
const port = 3000
const cors = require('cors');
const { getChat, sendMessage, getChatsByUserId } = require('./messages');
const { chatAuth } = require('./middleware');
const bodyParser = require('body-parser');
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/auth/login', (req, res) => {
  if (!req.body.name || !req.body.password) {
    res.status(400).json({ error: 'No username or pass' })
    return;
  }
  const user = {
    name: req.body.name,
    password: req.body.password
  }
  let { apiKey, id } = login(user);
  res.json({ apiKey, id })
})

app.post('/auth/signup', (req, res) => {
  if (!req.body.name || !req.body.password) {
    res.status(400).json({ error: 'No username or pass' })
    return;
  }
  const user = {
    name: req.body.name,
    password: req.body.password
  }
  const data = register(user);
  if (data === null) {
    res.status(500).json({ error: 'Could not register user' })

    return
  }
  res.json({ user: { name: data.name, id: data.id } })
})

app.use('/chats/:userId', (req, res, next) => {
  const { userId } = req.params
  const key = req.headers['x-key']
  const uId = getUserByKey(key);
  if (uId && userId === uId.toString()) {
    next()
  } else {
    res.status(401).json({ message: 'You do not have access to this info' })
  }
})

app.get('/chats/:userId', (req, res) => {
  const { userId } = req.params;
  const chats = getChatsByUserId(userId)
  res.json({ chats })
})


app.use('/chat/:senderId/:reciverId', chatAuth)

app.post('/chat/:senderId/:reciverId', (req, res) => {

  const { reciverId, senderId } = req.params;
  const { message } = req.body;
  const rUser = getUserById(parseInt(reciverId));
  const sUser = getUserById(parseInt(senderId));
  if (!rUser || !sUser) {
    res.status(400).json({ error: 'No matching users' });
    return;
  }
  console.log('index', message)
  const success = sendMessage({ ...message, from: senderId, to: reciverId, date: new Date().toISOString() }, [parseInt(reciverId), parseInt(senderId)])
  res.json({ success });
})

app.get('/chat/:senderId/:reciverId', (req, res) => {
  const { reciverId, senderId } = req.params;
  if (!reciverId || !senderId || senderId === reciverId) {
    res.end();
    return;
  }
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const chatId = [parseInt(reciverId), parseInt(senderId)];

  const chat = getChat(chatId)

  const subscription = chat.subscribe((message) => {
    console.log("here")
    res.write(`data: ${JSON.stringify(message)}\n\n`)
  })

  res.on('close', () => {
    console.log('client dropped me');
    subscription.unsubscribe();
    res.end();
  });
})


app.get('/user/search', (req, res) => {
  const { name } = req.query;
  const user = getUserByName(name);
  res.json({ user })
})

app.get('/user/info/:id', (req, res) => {
  const { id } = req.params;
  const user = getUserById(parseInt(id))
  if (user) {

    res.json({ name: user.name, id: user.id })
  } else {

    res.status(404).json({ message: 'User not found' })
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})