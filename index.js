// Classes.
var Game = require("./public/js/game");
var Data = require("./data");

// Server.
var fs = require("fs");
var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var bodyParser = require('body-parser');

// Game state.
var game = null;
var currentCharacters = [];
var decks = fs.readdirSync("./public/images/").filter(function (value) {
    return !value.startsWith("_");
});

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "pug");

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});
app.get("/admin", function (req, res) {
    res.render("admin", { decks: decks, characters: currentCharacters });
});
app.post("/admin", function (req, res) {
    var decksToSet = [req.body.deck1, req.body.deck2];
    for (var i = 0; i < decksToSet.length; i++) {
        if (decks.indexOf(decksToSet[i]) == -1) {
            res.redirect("back");
            return;
        }
    }

    currentCharacters = decksToSet;
    game = new Game(Data.GenerateInitialState());
    for (var i = 0; i < currentCharacters.length; i++) {
        var path = "./public/images/" + currentCharacters[i];
        var fileNames = fs.readdirSync(path);
        var cardNames = fileNames.map(function (fileName) {
            return fileName.replace(".jpg", "");
        });

        game.AddDeck(i, Data.GenerateDeck(currentCharacters[i], cardNames));
    }

    io.emit("setup", game.state);
    console.log("admin refreshed game with decks [" + req.body.deck1 + ", " + req.body.deck2 + "]");

    res.redirect("back");
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

    socket.emit("join", socket.player);

    if (game) {
        socket.emit("setup", game.state);
    }

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

    socket.on("change life", function (index, delta) {
        game.ChangeLife(index, delta);
        socket.broadcast.emit("change life", index, delta)
    });
});

http.listen(8080, function () {
    console.log("listening on *:8080");
});