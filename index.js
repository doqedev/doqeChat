const { getUserInfo } = require("@replit/repl-auth")
const express = require('express');
const { Server } = require("socket.io");
const { Magic } = require('@magic-sdk/admin');
const magic = new Magic(process.env.magicSecret);

const app = express();
app.set('view engine', 'ejs')
app.set('views', __dirname + "/views")
app.use(express.static('public'))
const http = require('http');
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
  const user = getUserInfo(socket.request)
  if(!user) return socket.disconnect();
  let name = `${socket.id.slice(0,4)}`
  
  socket.on('send', (msg) => {
    if(socket.ghost) return;
    if(msg == ""){
      socket.ghost = true
    }else{
      io.sockets.emit("message", name, msg, socket.id)
    }
    console.log(`[${user.name}]: ${msg}`)
  })
  
  console.log(`${name} has connected.`);
  
});

app.get('/', (req, res) => {
  const user = getUserInfo(req)
  if(!user) return res.render('magicLogin');
  res.render('index', {user: user.name})
});

app.get('/callback', (req,res) => {
  res.render('magicCallback')
})

app.get('/logout', (req,res) => {
  res.render('magicLogout')
})

server.listen(3000, () => {
  console.log(`https://${process.env.REPL_ID}.id.repl.co/`)
  console.log('server started');
});
