var Game = require("./public/js/game");

var express = require("express");
var app = express();

var http = require("http").Server(app);
var io = require("socket.io")(http);

var data = require("./data");
var game = new Game(data.GenerateInitialState());
game.AddDeck(0, data.GenerateDeck("medusa"));
// game.AddDeck(1, data.GenerateDeck("medusa"));

app.use(express.static("public"));
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

io.on("connection", function (socket) {
    socket.player = 0;
    console.log("a user connected");

    socket.emit("setup", game.state);

    socket.on("disconnect", function () {
        console.log("a user disconnected");
    });

    socket.on("card moved", function (data) {
        if (typeof socket.player !== "undefined" && game.state.players[socket.player].HasCard(data.index)) {
            game.MoveCard(socket.player, data.index, data.to);
            socket.broadcast.emit("card moved", data);
        }
    });

    socket.on("card flipped", function (index) {
        if (typeof socket.player !== "undefined" && game.state.players[socket.player].HasCard(index)) {
            game.FlipCard(socket.player, index);
            socket.broadcast.emit("card flipped", index);
        }
    });
});

http.listen(8080, function () {
    console.log("listening on *:8080");
});