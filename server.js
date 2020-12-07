const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const cors = require('cors');

app.use(express.json());
app.use(cors({
  credentials: true,
  origin: "http://localhost:8000"
}));

app.get('/', (req, res) => {
  res.status(200).send('Server is Running')
});

io.on('connection', (socket) => {
  socket.on('join-session', (response) => {
    io.sockets.emit('join-session', response)
  }); 

  socket.on('session-story', (response) => {
    io.sockets.emit('session-story', response)
  }); 

  socket.on('story-point', (response) => {
    io.sockets.emit('story-point', response)
  }); 
}); 

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log("Server is listening on port 3000")
})
