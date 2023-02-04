if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

// Call all packages

const express = require('express');
const { getUserInfo } = require('@replit/repl-auth')
const passport = require('passport')
const MagicStrat = require('passport-magic').Strategy;
const { Server } = require("socket.io");
const http = require('http')
// const { Magic } = require('@magic-sdk/admin');
// const magic = new Magic(process.env.magicSecret); -- coming soon!!

const app = express();
app.set('view engine', 'ejs')
app.set('views', __dirname + "/views")
app.use(express.static('public'))

app.post('/login', passport.authenticate('magic'));
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
  const user = getUserInfo(socket.request)
  if (!user) return socket.disconnect();
  let name = `${socket.id.slice(0, 4)}`

  socket.on('send', (msg) => {
    if (socket.ghost) return;
    if (msg == "") {
      socket.ghost = true
    } else {
      io.sockets.emit("message", name, msg, socket.id)
    }
    console.log(`[${user.name}]: ${msg}`)
  })

  console.log(`${name} has connected.`);

});

app.get('/', (req, res) => {
  const user = getUserInfo(req)
  if (!user) return res.render('login');
  res.render('index', { user: user.name })
});

server.listen(3000, () => {
  if (process.env.REPL_ID) {
    console.log(`https://${process.env.REPL_ID}.id.repl.co/`)
  }
  else {
    console.log(`http://localhost:3000`)
  }
  console.log('server started');
});
