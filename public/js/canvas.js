'use strict';

(function() {
  var minMem = 3;
  var socket = io();
  var username=localStorage.getItem("user");
  var userList =[];
  var joninedUserList = {};
  var userCount=1;
  var leader = "" ;
  var start = false;

  var startVoting = false;
  localStorage.setItem('startVoting',startVoting)
  
  // This object holds the implementation of each drawing tool.
  var tools = {};
  var textarea;
  var colorPicked;
  var lineWidthPicked;
  var SelectedFontFamily;
  var SelectedFontSize;  
  var joinstatus=false;
  var votestatus = false;
// Keep everything in anonymous function, called on window load.


if(window.addEventListener) {
window.addEventListener('load', function () {
  var canvas, context, canvaso, contexto;

  // The active tool instance.
  var tool;
  var tool_default = 'pencil';
  socket.emit("USER_CONNECTED", username);

  socket.on('connect', () => {
      console.log("Connected",localStorage.getItem('user'));
    });
  socket.on('SAVESTART', (data) => {
      Save_confirm();
  });
  socket.on('VOTE', (data) => {
    console.log("VOTE----------");
    if (data == username) {
      votestatus=true;
    }
});
  socket.on('CHAT', (data) => {
    console.log("--------chat---------",data)
    var content = "<p>" + data + "</p>";
    $("#msg_content").append(content);
    $("#msg_content").animate({ scrollTop: $("#msg_content").height() }, "slow");

  });
  socket.on('SAVE_RESULT', (data) => {
    console.log("--------SAVE_RESULT call---------",data)
    if(data){
      console.log("--------save_result---------",data)
      var canvas = document.getElementById("imageView");
      var img    = canvas.toDataURL("image/png");
      var a = document.createElement('a');
      a.href = img;
      a.download = "whiteboard.png";
      document.body.appendChild(a);
      a.click();
     // document.write('<img src="'+img+'"/>');
    } else {
      console.log("You can't save all data yet because lot's of member don't agree!")
      alert("You can't save all data yet because lot's of member don't agree!")
    }
   });



function Save_confirm() {
  console.log('SAVESTART-----------')
  document.getElementById('save-all').style.display="inline-block";
  document.getElementById('save-none').style.display="inline-block";
  document.getElementById('desc').innerHTML="Would you please save all data?!";
}

  socket.on("USER_CONNECTED", (user) => {
    // if(user!=localStorage.getItem('user')){
      userList.push(user);
       var tx1= "<button id='" + user + "' class=btn_user onclick='vote("+"this"+")'>" + user + "</button><br>"  
      $("#users").append(tx1);
      $("#users").animate({ scrollTop: $("#users").height() }, "slow");
      userCount+=1;
      console.log("minMem!",minMem);
      desc_change();
      console.log("userlist.length!",userCount);
      console.log("usrelist",userList);
      console.log(`new user connected ${user}`);
      console.log("localStorage.getItem('user')",username);
      leader=localStorage.getItem('leader');
      console.log("----leader--------",leader);
      if(leader&& leader!=username){
        //display leader to new user
         if(leader==user&& document.getElementById(leader)){
          document.getElementById(leader).style.backgroundColor="rgb(102, 255, 102)";}
        //display joined users to new user
        if(joninedUserList[user]){document.getElementById(user).style.background="	#ff6666";}
        //disable new user if you are not leader.
        document.getElementById(user).disabled=true;
      }
       if (!leader && votestatus){
        document.getElementById(user).disabled=true;
       }

  });
  
  socket.on("JONIEDLIST", (JONIEDLIST) => {
    console.log("data-----drwaing----!",JONIEDLIST);
    joninedUserList=JONIEDLIST;
   })
  
  socket.on("DRAWING_DATA", (DRAWING_DATA) => {
    console.log("data-----drwaing----!",DRAWING_DATA);
    for (let data in DRAWING_DATA) {
      console.log("data-----drwaing----!",data)
      socket.on(data.type,onDrawRect(data.data));
    }
   })
  socket.on("USER_DISCONNECTED", (disconnectedUser) => {
    console.log("disconnectedUser:",disconnectedUser)
    document.getElementById(disconnectedUser).nextSibling.remove();
    document.getElementById(disconnectedUser).remove();
    userCount --;
    if(disconnectedUser==localStorage.getItem('leader')){
      localStorage.removeItem('leader');
      localStorage.removeItem('voted');
      var elems = document.getElementsByClassName("btn_user");
      for(var i = 0; i < elems.length; i++) {
          elems[i].disabled = false;
          elems[i].style.backgroundColor="";
      }
      startVoting=false;
      desc_change();
      
     // container.removeChild(canvas);
    }

   })

   socket.on("JOINED", (joinedUser) => {
    console.log("joinedUser:",joinedUser)
    if(document.getElementById(joinedUser)){
       document.getElementById(joinedUser).style.backgroundColor="	#ff6666";
      }
    if(username==joinedUser){
      console.log("username:",username,"-----joineduser:",joinedUser);
      document.getElementById('desc').innerHTML="Please start the working in this whiteboard system!";
      container.appendChild(canvas);
      joinstatus=true;
      socket.emit("HISTORY_VIEW",joinedUser);
    }
   })

  socket.on("START", (leader1) => {
    console.log("leader:",leader1)
    localStorage.setItem('leader',leader1);
    leader=localStorage.getItem('leader');
    
    console.log("leader:",leader)
    if (username == leader1){
      document.getElementById('desc').innerHTML="You was elected as leader in this whiteboard system!";
      document.getElementById('clear-all').disabled=false;
      document.getElementById('save-all').style.display="inline-block";
      var elems = document.getElementsByClassName("btn_user");
          for(var i = 0; i < elems.length; i++) {
              elems[i].disabled = false;
          }
      container.appendChild(canvas);

    } else{   
      if(!joninedUserList[username]){
      if( document.getElementById(leader1)){
      document.getElementById(leader1).style.backgroundColor="rgb(102, 255, 102)";}
      document.getElementById('desc').innerHTML="You don't have the permission to work in this system yet! Wait..";
      alert (`Work has been started with ${leader1} as leader`);
    }}
    startVoting=true;
    localStorage.setItem("startVoting",startVoting);
    start=true;
})

function desc_change(){
  console.log("desck_change")
  console.log("usrename---",username,"--joineduselist--",joninedUserList[username],"---votestatus--",votestatus)
  var desc = '';
  if(userCount < minMem) {desc= "Waiting for other Colaborators to join";
     document.getElementById('desc').innerHTML=desc; }
  if (userCount >= minMem && votestatus == false){
    desc = "Let's start voting";
    document.getElementById('desc').innerHTML=desc;
  }
  if(joinstatus&&votestatus&&leader!=username){
    document.getElementById('desc').innerHTML="Please start the working in this whiteboard system!"
  }
  if(!joinstatus&&leader && votestatus &&leader!=username){
    document.getElementById('desc').innerHTML="You don't have the permission to work in this system yet! Wait..";
  }

}



  function init () {
  //save canvas as png file to download folder
    $("#save-all").click(function(){
      console.log("leader and username ",leader,"---dfdfd------",username)
      if(leader==username){
          socket.emit("SAVESTART", username);
        }else{
          socket.emit("SAVE_OPINION", username);
          document.getElementById('save-all').style.display="none";
          document.getElementById('save-none').style.display="none";
          desc_change();
        }
    });
    $("#save-none").click(function(){
      socket.emit("SAVE_OPINION", false);
      document.getElementById('save-all').style.display="none";
      document.getElementById('save-none').style.display="none";
      desc_change();
    });
    //show the status of whiteboard
     desc_change();

    // Find the canvas element.
    canvaso = document.getElementById('imageView');
    if (!canvaso) {
      alert('I cannot find the canvas element!');
      return;
    }
      
    if (!canvaso.getContext) {
      alert('No canvas.getContext!');
      return;
    }

    //get the 2D canvas context.
    contexto = canvaso.getContext('2d');
    if (!contexto) {
      alert('Error: failed to getContext!');
      return;
    }

    // add the temporary canvas.
    var container = canvaso.parentNode;
    canvas = document.createElement('canvas');
    if (!canvas) {
      alert('I cannot create a new canvas element!');
      return;
    }

    canvas.id     = 'imageTemp';
    canvas.width  = canvaso.width;
    canvas.height = canvaso.height;
    

    context = canvas.getContext('2d');
  

    // Get the tool select input.
    var tool_select = document.getElementById('pencil_button');   
    //Choose line Width
    lineWidthPicked = $("#line-Width").val();
        
    $("#line_Width").change(function(){
        lineWidthPicked = $("#line_Width").val();
    });
     //SelectedFontSize
     SelectedFontSize = $("#draw-text-fontsize").val();
    
     $("#draw-text-fontsize").change(function(){
         SelectedFontSize = $("#draw-text-fontsize").val();
     })

    //SelectedFontFamily
    SelectedFontFamily = $("#draw-text-fontfamily").val();
    
    $("#draw-text-fontfamily").change(function(){
        SelectedFontFamily = $("#draw-text-fontfamily").val();
    })
    
   
    //Choose colour picker
    colorPicked = $("#colour_picker").val();
    
    $("#colour_picker").change(function(){
        colorPicked = $("#colour_picker").val();
    });

    // Activate the default tool.
    if (tools[tool_default]) {
      tool = new tools[tool_default]();
      tool_select.value = tool_default;
    }
    
    function pic_tool_click(pick){
        if (tools[pick.value]) {
          tool = new tools[pick.value]();
        }
    }
     
    $("#pencil_button").click(function(){
      pic_tool_click(this)
  });
    
     $("#circle_button").click(function(){
        pic_tool_click(this)
    });
    $("#text_button").click(function(){
      pic_tool_click(this)
  });
    $("#ellipse_button").click(function(){
        pic_tool_click(this)
    });
    
    $("#line_button").click(function(){
        pic_tool_click(this)
    });
    
    $("#rect_button").click(function(){
      pic_tool_click(this)
  })
  
    
    
      // limit the number of events per second
  function throttle(callback, delay) {
    var previousCall = new Date().getTime();
    return function() {
      var time = new Date().getTime();

      if ((time - previousCall) >= delay) {
        previousCall = time;
        callback.apply(null, arguments);
      }
    };
  }

    // mouse event listeners.
    canvas.addEventListener('mousedown', ev_canvas, false);
    canvas.addEventListener('mouseup',   ev_canvas, false);
    canvas.addEventListener('mousemove', throttle(ev_canvas, 10), false);
   
  }

  // position relative to the canvas element.
  function ev_canvas (e) {
      var CanvPos = canvas.getBoundingClientRect();  //Global Fix cursor position bug
    if (e.clientX || v.clientX == 0) { // Firefox
      e._x = e.clientX - CanvPos.left;
      e._y = e.clientY - CanvPos.top;
    } else if (e.offsetX || ev.offsetX == 0) { // Opera
    }
    
    // Call the event handler of the tool.
    var func = tool[e.type];
    if (func) {
      func(e);
    }
    
  }

  // The event handler for any changes made to the tool selector.
  function ev_tool_change (e) {
    if (tools[this.value]) {
      tool = new tools[this.value]();
    }
  }
  
  

  function img_update(trans) {
		contexto.drawImage(canvas, 0, 0);
		context.clearRect(0, 0, canvas.width, canvas.height);
        if (!trans) { return; }

        socket.emit('COPYCANVAS', {
          transferCanvas: true
        });
  }
  
    function onCanvasTransfer(data){
            img_update();
    }
  
  socket.on('COPYCANVAS', onCanvasTransfer);

    //Ellipse Tool 
  

    function drawEllipse(x, y, w, h, color, linewidth, emit){
      
      context.clearRect(0, 0, canvas.width, canvas.height); 
    var ox, oy, xe, ye, xm, ym;
    var kappa = .5522848;
      ox = (w / 2) * kappa, // control point offset horizontal
      oy = (h / 2) * kappa, // control point offset vertical
      xe = x + w,           // x-end
      ye = y + h,           // y-end
      xm = x + w / 2,       // x-middle
      ym = y + h / 2;       // y-middle
 
      context.beginPath();
      context.moveTo(x, ym);
      context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
      context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
      context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
      context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
      context.closePath();
    
        if(color)
            context.strokeStyle = "#"+color;
        else
            context.strokeStyle = "#"+colorPicked; 
        if(linewidth)
            context.lineWidth = linewidth;
        else
            context.lineWidth = lineWidthPicked;  
            context.stroke();
        
            
            if (!emit) { return; }
            socket.emit('ELLIPSEDRAW', {
              x: x,
              y: y,
              w: w,
              h: h,
              color: colorPicked,
              lineThickness: lineWidthPicked
            });
    
  }
  
   
    
    function onDrawEllipse(data){
        var w = canvaso.width;
        var h = canvaso.height;
        drawEllipse(data.x, data.y, data.w, data.h, data.color, data.lineThickness);
    }
    
    socket.on('ELLIPSEDRAW', onDrawEllipse);


  // The Ellipse tool.
  tools.ellipse = function () {
    var tool = this;
    this.started = false;
    textarea.style.display = "none";
    textarea.style.value = "";
    var x,y,w,h;
    
    this.mousedown = function (e) {
      tool.started = true;
        tool.x0 = e._x;
      tool.y0 = e._y;
    };

    this.mousemove = function (e) {
      if (!tool.started) {
        return;
      }
      
         x = Math.min(e._x, tool.x0);
		 y = Math.min(e._y, tool.y0);
		
		 w = Math.abs(e._x - tool.x0);
		 h = Math.abs(e._y - tool.y0);
      
        context.clearRect(0, 0, canvas.width, canvas.height); 
        drawEllipse(x, y, w, h, colorPicked, lineWidthPicked, true);

    };

    this.mouseup = function (e) {
      if (tool.started) {
        tool.mousemove(e);
        tool.started = false;
        img_update(true);

        let data = { x: x, y: y, w: w,h: h,color: colorPicked,lineThickness: lineWidthPicked}
        console.log("ellipsedraw_mouseUp-----",data)
        let type = "ELLIPSEDRAW";
        let DRAWING_DATA={};
         DRAWING_DATA[type]=data;
         socket.emit('DRAWING_DATA', DRAWING_DATA);
      }
    };
    
  };
  
  //Rect
  function onDrawRect(data){
    var w = canvaso.width;
    var h = canvaso.height;
    console.log("IN")
    drawRect(data.min_x * w, data.min_y * h, data.abs_x * w, data.abs_y * h, data.color, data.lineThickness);
}
  function drawRect(min_x, min_y, abs_x, abs_y, color, linewidth, emit){
          
            context.clearRect(0, 0, canvas.width, canvas.height); 
        if(color)
            context.strokeStyle = "#"+color;
        else
            context.strokeStyle = "#"+colorPicked; 
        if(linewidth)
            context.lineWidth = linewidth;
        else
            context.lineWidth = lineWidthPicked;
            context.strokeRect(min_x, min_y, abs_x, abs_y);
            
            if (!emit) { return; }
            var w = canvaso.width;
            var h = canvaso.height;

            socket.emit('RECTANGLE', {
              min_x: min_x / w,
              min_y: min_y / h,
              abs_x: abs_x / w,
              abs_y: abs_y / h,
              color: colorPicked,
              lineThickness: lineWidthPicked
            });
        
    }
    
    
    socket.on('RECTANGLE', onDrawRect);


  // The rectangle tool.
  tools.rect = function () {
    var tool = this;
    var pos_x, pos_y,pos_w, pos_h
    this.started = false;
    textarea.style.display = "none";
    textarea.style.value = "";
   
   //above the tool function

    this.mousedown = function (ev) {
      tool.started = true;
      tool.x0 = ev._x;
      tool.y0 = ev._y;
    };

    this.mousemove = function (e) {
      if (!tool.started) {
        return;
      }

          pos_x = Math.min(e._x,  tool.x0),
          pos_y = Math.min(e._y,  tool.y0),
          pos_w = Math.abs(e._x - tool.x0),
          pos_h = Math.abs(e._y - tool.y0);

      context.clearRect(0, 0, canvas.width, canvas.height); //in drawRect

      if (!pos_w || !pos_h) {
        return;
      }
        //console.log("emitting")
      drawRect(pos_x, pos_y, pos_w, pos_h, colorPicked, lineWidthPicked, true);
      //context.strokeRect(x, y, w, h); // in drawRect
    };

    this.mouseup = function (ev) {
      if (tool.started) {
        tool.mousemove(ev);
        tool.started = false;
        img_update(true);
        console.log("rectangle_mouseUp-----");
        var w = canvaso.width;
        var h = canvaso.height;
        //let data = {"type":"rectangle","data":{pos_x, pos_y, pos_w, pos_h, colorPicked, lineWidthPicked}}
        let data = { min_x: pos_x / w, min_y: pos_y / h, abs_x: pos_w / w,abs_y: pos_h / h,color: colorPicked,lineThickness: lineWidthPicked}
        console.log("rectangle_mouseUp-----",data)
        let type = "RECTANGLE";
        let DRAWING_DATA={};
         DRAWING_DATA[type]=data;
         socket.emit('DRAWING_DATA', DRAWING_DATA);
      }
    };
  };
  //Lines
   function drawLines(x0, y0, x1, y1, color, linewidth, emit){
          context.clearRect(0, 0, canvas.width, canvas.height); 
          context.beginPath();
          context.moveTo(x0, y0);
          context.lineTo(x1, y1);
          if(color)
            context.strokeStyle = "#"+color;
        else
            context.strokeStyle = "#"+colorPicked; 
         if(linewidth)
            context.lineWidth = linewidth;
        else
            context.lineWidth = lineWidthPicked;
          context.stroke();
          context.closePath();
          
            
            if (!emit) { return; }
            var width = canvaso.width;
            var height = canvaso.height;

            socket.emit('LINEDRAW', {
              x0: x0 / width, y0: y0 / height,
              x1: x1 / width, y1: y1 / height,
              color: colorPicked,
              lineThickness: lineWidthPicked
            });
        
    }
    
    function onDrawLines(data){
        var w = canvaso.width;
        var h = canvaso.height;
        drawLines(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.lineThickness);
    }
    
    socket.on('LINEDRAW', onDrawLines);


  // The line tool.
  tools.line = function () {
    var tool = this;
    var x1,y1;
    this.started = false;
    textarea.style.display = "none";
    textarea.style.value = "";
  
    this.mousedown = function (ev) {
      tool.started = true;
      tool.x0 = ev._x;
      tool.y0 = ev._y;
      x1=ev._x;;
      y1=ev._y;
    };

  
    this.mouseup = function (e) {
      if (tool.started) {
        tool.mousemove(e);
        tool.started = false;
        img_update(true);
        var w = canvaso.width;
        var h = canvaso.height;
        let data = { x0: x1/w, y0: y1/h, x1: e._x/w,y1: e._y/h,color: colorPicked,lineThickness: lineWidthPicked}
        console.log("linedraw_mouseUp-----",data)
        let type = "LINEDRAW";
        let DRAWING_DATA={};
         DRAWING_DATA[type]=data;
         socket.emit('DRAWING_DATA', DRAWING_DATA);
        
      }
    };
    this.mousemove = function (e) {
      if (!tool.started) {
        return;
      }
        drawLines(tool.x0, tool.y0, e._x, e._y, colorPicked, lineWidthPicked, true);

    };

    
  };
  
  // The drawing pencil.
  function drawPencil(x0, y0, x1, y1, color, linewidth, emit){
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    if(color)
        context.strokeStyle = "#"+color;
    else
        context.strokeStyle = "#"+colorPicked; 
    if(linewidth)
        context.lineWidth = linewidth;
    else
        context.lineWidth = lineWidthPicked;
    context.stroke();
    context.closePath();

    if (!emit) { return; }
    var w = canvaso.width;
    var h = canvaso.height;

    socket.emit('DRAWING', {
      x0: x0 / w, y0: y0 / h,
      x1: x1 / w,      y1: y1 / h,
      color: colorPicked,
      lineThickness: lineWidthPicked
    });
}

function onDrawingEvent(data){
    var w = canvaso.width;
    var h = canvaso.height;
    drawPencil(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color, data.lineThickness);
}

socket.on('DRAWING', onDrawingEvent);


tools.pencil = function () {
var tool = this;
this.started = false;
textarea.style.display = "none";
textarea.style.value = "";

// starting the pencil drawing.
this.mousedown = function (e) {
    tool.started = true; 
    tool.x0 = e._x;
    tool.y0 = e._y;
};


this.mousemove = function (ev) {
  if (tool.started) {
    drawPencil(tool.x0, tool.y0, ev._x, ev._y, colorPicked, lineWidthPicked, true);
    console.log("drawing_mouseUp-----");
    var w = canvaso.width;
    var h = canvaso.height;
    //let data = {"type":"rectangle","data":{pos_x, pos_y, pos_w, pos_h, colorPicked, lineWidthPicked}}
    let data = { x0: tool.x0 / w, y0:tool.y0 / h,  x1:ev._x/ w,y1: ev._y / h,color: colorPicked,lineThickness: lineWidthPicked}
    console.log("drawing_mouseUp-----",data)
    let type = "DRAWING";
    let DRAWING_DATA={};
     DRAWING_DATA[type]=data;
     socket.emit('DRAWING_DATA', DRAWING_DATA);
    tool.x0 = ev._x;
    tool.y0 = ev._y;

  }
};

// This is called when you release the mouse button.
this.mouseup = function (ev) {
  if (tool.started) {
    tool.mousemove(ev);
    tool.started = false;
    img_update(true);
  }
};
};
  //The Circle tool

  function drawCircle(x1, y1, x2, y2, color, linewidth, emit){
      
      context.clearRect(0, 0, canvas.width, canvas.height); 
 
    var x = (x2 + x1) / 2;
    var y = (y2 + y1) / 2;
 
    var radius = Math.max(
        Math.abs(x2 - x1),
        Math.abs(y2 - y1)
    ) / 2;
 
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI*2, false);
    // context.arc(x, y, 5, 0, Math.PI*2, false);
     context.closePath();
        if(color)
            context.strokeStyle = "#"+color;
        else
            context.strokeStyle = "#"+colorPicked; 
        if(linewidth)
            context.lineWidth = linewidth;
        else
            context.lineWidth = lineWidthPicked;  
            context.stroke();
        
            
            if (!emit) { return; }
            var w = canvaso.width;
            var h = canvaso.height;

            socket.emit('CIRCLEDRAW', {
              x1: x1 / w,y1: y1 / h,
              x2: x2 / w, y2: y2 / h,
              color: colorPicked,
              lineThickness: lineWidthPicked
            });
    
  }
  
   
    
    function onDrawCircle(data){
        var w = canvaso.width;
        var h = canvaso.height;
        drawCircle(data.x1 * w, data.y1 * h, data.x2 * w, data.y2 * h, data.color, data.lineThickness);
    }
    
    socket.on('CIRCLEDRAW', onDrawCircle);


  // The Circle tool.
  tools.circle = function () {
    var tool = this;
    this.started = false;
    textarea.style.display = "none";
    textarea.style.value = "";
    var x1,y1;
    
    this.mousedown = function (e) {
      tool.started = true;
      var RECT = canvas.getBoundingClientRect();
      tool.x1 = e.clientX - RECT.left;
      tool.y1 = e.clientY - RECT.top;
    };

    this.mousemove = function (e) {
      if (!tool.started) {
        return;
      }
      
      var RECT = canvas.getBoundingClientRect();
        tool.x2 = e.clientX - RECT.left;
        tool.y2 = e.clientY - RECT.top;
    
        context.clearRect(0, 0, canvas.width, canvas.height); 
        drawCircle(tool.x1, tool.y1, tool.x2, tool.y2, colorPicked, lineWidthPicked, true);
        
        //context.strokeStyle = 'rgba(255, 0, 0, 0.5)'; //for old_drawCircle
        //context.strokeRect(x1, y1, x2-x1, y2-y1);

    };

    this.mouseup = function (e) {
      if (tool.started) {
        tool.mousemove(e);
        tool.started = false;
        img_update(true);
        var w = canvaso.width;
        var h = canvaso.height;
        let data = { x1: tool.x1/w, y1: tool.y1/h, x2: tool.x2/w,y2: tool.y2/h,color: colorPicked,lineThickness: lineWidthPicked}
        console.log("circledraw_mouseUp-----",data)
        let type = "CIRCLEDRAW";
        let DRAWING_DATA={};
         DRAWING_DATA[type]=data;
         socket.emit('DRAWING_DATA', DRAWING_DATA);

      }
    };
    
  };
  

  
  
  
  
 //Text Tool 
 
textarea = document.createElement('textarea');
textarea.id = 'text_tool';
textarea.focus();
textarea.className += " form-control";
container.appendChild(textarea);


var tmp_txt_ctn = document.createElement('div');
tmp_txt_ctn.style.display = 'none';
container.appendChild(tmp_txt_ctn);


    
function DrawText(fontsize, fontfamily, colorValue, textPosLeft, textPosTop, processed_lines, emit){
         context.textBaseline = 'top';
  
        context.font = fontsize + ' ' + fontfamily;
        
        context.fillStyle = "#"+colorValue;
         
        for (var n = 0; n < processed_lines.length; n++) {
            var processed_line = processed_lines[n];
             
            context.fillText(
                processed_line,
                parseInt(textPosLeft),
                parseInt(textPosTop) + n*parseInt(fontsize)
            );
        }
        
        img_update(); //already emitting no need true parameter
        
        if (!emit) { return; }
            var w = canvaso.width;
            var h = canvaso.height;

            socket.emit('TEXTDRAW', {
              fsize: fontsize,
              ffamily: fontfamily,
              colorVal: colorValue,
              textPosLeft: textPosLeft,
              textPosTop: textPosTop,
              processed_linesArray: processed_lines 
            });
      
}

 function onTextDraw(data){
        var w = canvaso.width;
        var h = canvaso.height;
        DrawText(data.fsize, data.ffamily, data.colorVal, data.textPosLeft, data.textPosTop, data.processed_linesArray);
    }
    
    socket.on('TEXTDRAW', onTextDraw);
    


tools.text = function () {
    var tool = this;
    this.started = false;
    textarea.style.display = "none";
    textarea.style.value = "";
    
    this.mousedown = function (e) {
      tool.started = true;
      tool.x0 = e._x;
      tool.y0 = e._y;
    
    };

    this.mousemove = function (e) {
        if (!tool.started) {
        return;
      }
        
        var x = Math.min(e._x, tool.x0);
        var y = Math.min(e._y, tool.y0);
        var width = Math.abs(e._x - tool.x0);
        var height = Math.abs(e._y - tool.y0);
         
        textarea.style.left = x + 'px';
        textarea.style.top = y + 'px';
        textarea.style.width = width + 'px';
        textarea.style.height = height + 'px';
         
        textarea.style.display = 'block';
        textarea.style.color = "#"+colorPicked;
        textarea.style.font = SelectedFontSize+'px' + ' ' + SelectedFontFamily;
    };

    this.mouseup = function (e) {
          if (tool.started) {
              
                //start      
                var lines = textarea.value.split('\n');
                var processed_lines = [];
                var left,top;
                for (var i = 0; i < lines.length; i++) {
                    var chars = lines[i].length;
             
                        for (var j = 0; j < chars; j++) {
                            var text_node = document.createTextNode(lines[i][j]);
                            tmp_txt_ctn.appendChild(text_node);
                             
                            // Since tmp_txt_ctn is not taking any space
                            // in layout due to display: none, we gotta
                            // make it take some space, while keeping it
                            // hidden/invisible and then get dimensions
                            tmp_txt_ctn.style.position   = 'absolute';
                            tmp_txt_ctn.style.visibility = 'hidden';
                            tmp_txt_ctn.style.display    = 'block';
                             
                            var width = tmp_txt_ctn.offsetWidth;
                            var height = tmp_txt_ctn.offsetHeight;
                             
                            tmp_txt_ctn.style.position   = '';
                            tmp_txt_ctn.style.visibility = '';
                            tmp_txt_ctn.style.display    = 'none';
                             
                            // Logix
                             //console.log(width, parseInt(textarea.style.width));
                            if (width > parseInt(textarea.style.width)) {
                                break;
                            }
                        }
                     
                    processed_lines.push(tmp_txt_ctn.textContent);
                    tmp_txt_ctn.innerHTML = '';
                }
                var fs = SelectedFontSize + "px";
                var ff = SelectedFontFamily;
                
                DrawText(fs, ff, colorPicked, textarea.style.left, textarea.style.top, processed_lines, true)
                left=  textarea.style.left;
                top= textarea.style.top;
                console.log("lines saved")
                textarea.style.display = 'none';
                textarea.value = '';
                          
            //end
                      
            tool.mousemove(e);
            tool.started = false;
            let data = { fsize: fs, ffamily: ff, colorVal: colorPicked,textPosLeft: left,textPosTop: top,processed_linesArray: processed_lines}
            console.log("textdraw_mouseUp-----",data)
            let type = "TEXTDRAW";
            let DRAWING_DATA={};
             DRAWING_DATA[type]=data;
             socket.emit('DRAWING_DATA', DRAWING_DATA);
          }
    };
    
  };
  
  //Text tool end
  
  function clearAll_update(trans) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    contexto.clearRect(0, 0, canvaso.width, canvaso.height);
      
        if (!trans) { return; }

        socket.emit('CLEARBOARD', {
          CleardrawingBoard: true
        });
  }
  
   function onClearAll(data){
            clearAll_update();
    }
  
  socket.on('CLEARBOARD', onClearAll);


$("#clear-all").click(function(){
var canvas_width = canvas.width;
var canvas_height = canvas.height;
var canvaso_width = canvaso.width;
var canvaso_height = canvaso.height;
    context.clearRect(0, 0, canvas_width, canvas_height);
    contexto.clearRect(0, 0, canvaso_width, canvaso_height);
    clearAll_update(true)
});


  init();
  
    

}, false); }



//end


})();


