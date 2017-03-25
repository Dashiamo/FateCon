var express = require("express");
var app = express();

var http = require("http").Server(app);
var io = require("socket.io")(http);

var gamedata = require("./gamedata");
gamedata.initializeGrid();

app.use(express.static("public"));

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

io.on("connection", function(socket) {
    console.log("a user connected");

    socket.emit("setup", {
        deck: gamedata.generateDeck("medusa"),
        grid: gamedata.getGrid()
    });

    socket.on("disconnect", function() {
        console.log("a user disconnected");
    });

    socket.on("card moved", function(data) {
        gamedata.moveCard(data.from, data.to, data.index)
        socket.broadcast.emit("card moved", data);
    });

    socket.on("card flipped", function(data) {
        socket.broadcast.emit("card flipped", data);
    });
});

http.listen(8080, function() {
    console.log("listening on *:8080");
});