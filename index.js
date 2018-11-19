var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

var clients = [];

io.on('connection', function(socket) {
    console.log('a user has connected');
    clients.push(socket.id);

    io.to(`${socket.id}`).emit('old_messages', getOldMessages());

    socket.on('chat message', function(msg) {
        console.log('message: ' + msg);
        io.emit('chat message', msg);

        fs.writeFile('old_messages.txt', getOldMessages() + msg + '\n', function (err, data) {
            if (!err) {
                console.log('Successfully written message to old_messages.txt');
            }
        });

    });

    socket.on('disconnect', function() {
        console.log('user disconnected');
    });

    prevClientCount = 0;
    setInterval(function() {
        if (io.engine.clientsCount != prevClientCount) {
            prevClientCount = io.engine.clientsCount;
            io.emit('user count change', io.engine.clientsCount);
        }
        
        console.log(io.engine.clientsCount);
    }, 1000);
});

var port = process.env.PORT || 3000;
http.listen(port, function() {
    console.log('listening on port: ' + port);
});

function getOldMessages() {
    text =  fs.readFileSync('old_messages.txt').toString();
    console.log(text);
    return text;
}
