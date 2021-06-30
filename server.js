const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const cors = require('cors');

app.use(express.json());
app.use(cors({
  credentials: true,
  //origin: "http://localhost:8000"
  origin: "*"
}));

const sessions = {};
const sessionStatus = {};

app.get('/', (req, res) => {
  res.status(201).send('Server is Running')
});

app.get('/sessions', (req, res) => {
  res.status(201).send(sessions)
});

app.get('/session-status', (req, res) => {
  res.status(201).send(sessionStatus)
});

app.post('/voting-status', (req, res) => {
  let sessionName = req.body.sessionName
  res.status(201).send(sessionStatus[sessionName])
});

io.on('connection', (socket) => {

  socket.on('create-session', (sessionName) => {
    socket.join(sessionName);
    sessions[sessionName] = [];
    sessionStatus[sessionName] = {
      canVote : false
    };
  });

  socket.on('join-session', (sessionName, user) => {
    user.id = socket.id;
    if(!sessions || !sessions[sessionName]){
      return;
    }
    socket.join(sessionName);
    sessions[sessionName].push(user);
    io.to(sessionName).emit('new-user-joined', user);
  });

  socket.on('start-story-voting', (sessionName, story) => {
    socket.join(sessionName);
    sessionStatus[sessionName] = {
      canVote : true,
      story
    };
    io.to(sessionName).emit('enable-story-voting', story);
  });
  
  socket.on('user-story-point-selection', (sessionName ,response) => {
    socket.join(sessionName);
    io.to(sessionName).emit('story-point', response);
  }); 

  socket.on('story-points-revealed', (sessionName) => {
    socket.join(sessionName);
    io.to(sessionName).emit('disable-users', true);
  }); 

}); 


const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log("Server is listening on port 3000")
})
