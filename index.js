var Game = require("./public/js/game");

var express = require("express");
var app = express();

var http = require("http").Server(app);
var io = require("socket.io")(http);

var data = require("./data");
var game = new Game(data.GenerateInitialState());
game.AddDeck(0, data.GenerateDeck("Arturia Pendragon Alter"));
game.AddDeck(1, data.GenerateDeck("Sasaki Kojirou"));

app.use(express.static("public"));
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

var playerSpotsTaken = [false, false];

io.on("connection", function (socket) {
    console.log("a user connected");

    socket.player = -1;
    for (var i = 0; i < playerSpotsTaken.length; i++) {
        if (!playerSpotsTaken[i]) {
            playerSpotsTaken[i] = true;
            socket.player = i;
            console.log("assigned to player " + i)
            break;
        }
    }

    if (socket.player === -1) {
        console.log("defaulted to spectator");
    }

    socket.emit("setup", [socket.player, game.state]);

    socket.on("disconnect", function () {
        console.log("a user disconnected");
        if (socket.player > -1) {
            playerSpotsTaken[socket.player] = false;
            console.log("remove from player " + socket.player);
        }
    });

    socket.on("card moved", function (data) {
        if (socket.player > -1) {
            game.MoveCard(data.index, data.to);
            socket.broadcast.emit("card moved", data);
        }
    });

    socket.on("card flipped", function (index) {
        if (game.state.cards[index].owner === socket.player) {
            game.FlipCard(index);
            socket.broadcast.emit("card flipped", index);
        }
    });

    socket.on("add to hand", function (index) {
        if (game.state.cards[index].owner === socket.player) {
            game.AddCardToOwnersHand(index);
            socket.broadcast.emit("add to hand", index);
        }
    });
});

http.listen(8080, function () {
    console.log("listening on *:8080");
});