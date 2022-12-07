const express = require('express')
const { register, users, login, getUserById, getUserByName } = require('./users')
const app = express()
const port = 3000
const cors = require('cors');
const { getChat, sendMessage } = require('./messages');
app.use(express.json())
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/auth/login', (req, res) => {
  if (!req.body.name || !req.body.password) {
    res.statusCode(400).json({ error: 'No username or pass' })
    return;
  }
  const user = {
    name: req.body.name,
    password: req.body.password
  }
  let apiKey = login(user);
  console.log(users);
  res.json({ apiKey: apiKey })
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

app.get('/chats', (req, res) => {
  res.json({ results: [{ id: 1, name: "Coco", lastMessage: "hello", lastDate: '2022-01-01', avatarSrc: 'https://avatars.dicebear.com/api/male/teo.svg' }] })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.post('/chat/:senderId/:reciverId', (req, res) => {

  const { reciverId, senderId } = req.params;
  const { message } = req.body;
  const rUser = getUserById(parseInt(reciverId));
  const sUser = getUserById(parseInt(senderId));
  console.log(rUser, sUser)
  if (!rUser || !sUser) {
    res.status(400).json({ error: 'No matching users' });
    return;
  }

  console.log(message, "da");
  const success = sendMessage({ ...message, from: senderId, to: reciverId, date: new Date().toISOString() }, [parseInt(reciverId), parseInt(senderId)])
  res.json({ success });
})

app.get('/chat/:sender/:reciver', (req, res) => {
  const { reciver, sender } = req.params;
  if (!reciver || !sender || sender === reciver) {
    res.end();
    return;
  }
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const chatId = [parseInt(reciver), parseInt(sender)];

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
