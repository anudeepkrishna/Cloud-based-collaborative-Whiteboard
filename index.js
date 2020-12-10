
const express = require('express');
const app = express();
const http = require('http').Server(app);
const cors = require('cors');
const io = require('socket.io')(http, {
  cors: {
      origin: 'http://localhost:3001/login',
      methods: ["GET", "POST"]
  }
});
app.use(cors());
const bodyParser = require('body-parser');
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  next();
});
const PORT = process.env.PORT || 3001;
let sockets = {};
let joindUserList = {};
let userData=[];
let drawing_data=[];
let votes = {};
let userCount = 0;
let voteCount = 0;
let leader = '';
let save_ok = 1;
let saveCount = 1;
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//heroku features:enable http-session-affinity
//to work with socket io
app.post('/login', (req, res) => {
 
  let user = req.body.user;
  console.log("data",user);
  if (sockets[user] == undefined) {
      res.send("GOOD");
  } else {
      res.send("BAD");
  }
});
function onConnection(socket){
  console.log('connected!');
  socket.on('disconnecting', (reason) => {
    var disconnecteId= socket.id;
    console.log("disconnecteId",disconnecteId)
    for (let user in sockets) {
      console.log("disconeed!",user)
       if(sockets[user]==disconnecteId){
        if(user==leader){
          leader='';
          voteCount=0;
          votes = {};
          save_ok=1;
          saveCount =1;
        }
        delete sockets[user];
        if(joindUserList[user]) delete joindUserList[user];
        socket.broadcast.emit("USER_DISCONNECTED", user);
        userCount --;
      }
  }
   console.log("sockets",sockets);
  });
  socket.on("USER_CONNECTED", (user) => {
    
    if (leader &&sockets[user] == undefined){
      console.log("leader----------",leader)
      io.emit("START", leader);
      socket.emit("JONIEDLIST",joindUserList);
   } 
    for (let user in sockets) {
      socket.emit("USER_CONNECTED", user);
    }
    if(sockets[user]!=undefined){
      socket.emit("VOTE",user);
      console.log("userdata---------")
      socket.emit("START", leader);
      socket.emit("JONIEDLIST",joindUserList);
      if(joindUserList[user]){
      for (const [key, value] of Object.entries(drawing_data)) {
        for (let type in value) {
          console.log("data-----drwaing----!",drawing_data,"dfdfd----", type,"data----",value[type],"--data--",drawing_data)
          socket.emit(type,value[type]);
          socket.emit('COPYCANVAS', true);
         }
       
      }}


    }
    if (sockets[user] == undefined) {
    
    sockets[user] = socket.id;
    let data = {"username":user,socketId:socket.id}
    userData.push(data);
    console.log("userdata",userData)
    userCount ++;
    console.log(`new user connected -- ${user}`);
    socket.broadcast.emit("USER_CONNECTED", user);}

    
   
});


socket.on('HISTORY_VIEW', (joinedUser) => {
  
  for (const [key, value] of Object.entries(drawing_data)) {
    for (let type in value) {
      console.log("data-----drwaing----!",drawing_data,"dfdfd----", type,"data----",value[type],"--data--",drawing_data)
      socket.emit(type,value[type]);
      socket.emit('COPYCANVAS', true);
     }
   
  }
   
});
socket.on('JOINED', (joinedUser) => {
  console.log(`new joinedUser connected -- ${joinedUser}`);
  joindUserList[joinedUser]=joinedUser;
  socket.broadcast.emit("JOINED", joinedUser);
   
});
socket.on('CHAT', (data) => {
  console.log(`chat -- ${data}`);

    io.emit("CHAT", data);
   
});
socket.on("VOTE", (data) => {
  var user,username;
 
  for (const [key, value] of Object.entries(data)) {
   if (key=="username")username=value
   else user = value   
   
  }
  console.log("user---",user,"----",username);
  io.emit("VOTE",username);
  if (votes[user] != undefined) {
      votes[user] = votes[user] + 1;
  } else {
      votes[user] = 1;
  }
  voteCount ++;
  if (voteCount == userCount) {
      let mxCnt = 0, mxUser;
      for (let user in votes) {
          let vn = votes[user];
          if (mxCnt < vn) {
              mxCnt = vn;
              mxUser = user;
          }
      }
      leader = mxUser;
      io.emit("START", leader);
  }
});


socket.on('DRAWING_DATA', function(data){
  //socket.broadcast.emit('drawing', data);
  drawing_data.push(data);
  console.log("drawing_data",data);
});
socket.on('SAVESTART', function(data){
  console.log("savestart---------");
  socket.broadcast.emit('SAVESTART', data);
});
socket.on('SAVE_OPINION', function(data){
  console.log("SAVE_OPINION---------");
  if(data) save_ok ++;
  saveCount ++;
  console.log("saveCount---------",saveCount);
  console.log("userCount---------",userCount);
  if(saveCount==userCount){
    console.log("saveCount==userCount---------",userCount);
    if (save_ok > saveCount/2){
      console.log("save_ok")
          save_ok=1;
          saveCount =1;
      io.emit('SAVE_RESULT', true);
    } else{
      console.log("save fail")
      io.emit('SAVE_RESULT', false);
    }
  }
    
  
});
//drawing part
//clear whiteboard
socket.on('CLEARBOARD', function(DATA){
  drawing_data=[];
  socket.broadcast.emit('CLEARBOARD', DATA);
  console.log('CLEARBOARD',DATA);
});
 //draw line 
  socket.on('LINEDRAW', function(DATA){
    socket.broadcast.emit('LINEDRAW', DATA);
    console.log('LINEDRAW',DATA);
  });
   //copy canvas
   socket.on('COPYCANVAS', function(DATA){
    socket.broadcast.emit('COPYCANVAS', DATA);
    console.log('COPYCANVAS',DATA);
  });
   //write text
   socket.on('TEXTDRAW', function(DATA){
    socket.broadcast.emit('TEXTDRAW', DATA);
    console.log('TEXTDRAW',DATA);
  });
  
  //draw circle
   socket.on('CIRCLEDRAW', function(DATA){
    socket.broadcast.emit('CIRCLEDRAW', DATA);
    console.log("CIRCLEDRAW",DATA);
  });
  
 
  //draw rectangle
  socket.on('RECTANGLE', function(DATA){
    socket.broadcast.emit('RECTANGLE', DATA);
    console.log('RECTANGLE',DATA);
  });
 
  //draw ellipse
  socket.on('ELLIPSEDRAW', function(DATA){
    socket.broadcast.emit('ELLIPSEDRAW', DATA);
    console.log("ELLIPSEDRAW",DATA);
  });
 //use pencil
  socket.on('DRAWING', function(DATA){
    socket.broadcast.emit('DRAWING', DATA);
    console.log(DATA);
  });
  
 
}

io.on('connection', onConnection);

http.listen(PORT, () => console.log('listening on port ' + PORT));
