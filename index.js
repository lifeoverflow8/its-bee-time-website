var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var fs = require('fs');
var htmlToText = require('html-to-text');
//jews
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

var password = fs.readFileSync('password.txt').toString();

io.on('connection', function(socket) {
    io.to(`${socket.id}`).emit('message_history', getMessageHistory());
    socket.on('disconnect', function() {

    });

    socket.on('chatmessage', function(msg) {
        console.log('message: ' + msg[1]);
        msg0 = htmlToText.fromString(msg[0]);
        nicknameHtml = '&nbsp; <span style="color:' + msg[2] + '"> ' + msg0 + ': ' + '</span>';
        msg1 = htmlToText.fromString(msg[1]);
        msg1 = evaluateInput(msg1);
        msgHtml = '<span style="color:' + msg[3] + '">' + msg1 + '</span>';
        messageHtml = '<li class="text">' + nicknameHtml + msgHtml + '</li>'

        switch(msg[4].type) {
            case 'image':
            messageHtml += '&nbsp;&nbsp;<a href="' + msg[4].url + '">' + msg[4].url + '</a><br>&nbsp;&nbsp;<image class="message-image" src=' + msg[4].url + '></image>';
                break;

                case 'yt':
                videoId = getId(msg[4].url);
                messageHtml += '&nbsp;&nbsp;<a href="' + msg[4].url + '">' + msg[4].url + '</a><br>&nbsp;&nbsp;<iframe width="560" height="315" src="//www.youtube.com/embed/' 
    + videoId + '" frameborder="0" allowfullscreen></iframe>';
                break;
        }

        fs.writeFile('message_history.txt', getMessageHistory() + messageHtml, function (err, data) {
            console.log('Successfully written message to message_history.txt')
        })
        io.emit('chatmessage', msg);
    });

    socket.on('admincommand', function(msg) {
        if (msg[0] == password) {
            console.log('this happens reeee');
            switch(msg[1]) {
                case '/clear':
                    clearMessageHistory();
                    break;
            }
        }
        else 
        {
            console.log(msg[0]);
        }
    });

    socket.on('scriptexecute', function(scr) {
        if (scr[0] == password) {
            io.emit('scriptexecute', scr[1]);
        }
    });
});

var port = process.env.PORT || 3000;
http.listen(port, function() {
    console.log('Listening on Port: ' + port);
});

function getMessageHistory() {
    text = fs.readFileSync('message_history.txt').toString();

    return text;
}

function clearMessageHistory() {
    fs.writeFile('message_history.txt', '', function(err, data) {

    });
}

function evaluateInput(input) {
    return input;
}

function getId(url) {
  var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  var match = url.match(regExp);

  if (match && match[2].length == 11) {
      return match[2];
  } else {
      return 'error';
  }
}