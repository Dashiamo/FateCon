if (typeof require !== "undefined") {
    var Player = require("./player");
}

var Game = function (state) {
    this.state = state;
    for (var i = 0; i < state.players.length; i++) {
        this.state.players[i] = new Player(state.players[i].hp, state.players[i].hand);
    }

    return this;
}

Game.prototype.AddDeck = function (player, deck) {
    for (var i = 0; i < deck.length; i++) {
        deck[i].owner = player;
        this.state.cards.push(deck[i]);
    }
}

Game.prototype.MoveCard = function (index, to) {
    this.state.cards[index].x = to.x;
    this.state.cards[index].y = to.y;
}

Game.prototype.FlipCard = function (index) {
    this.state.cards[index].flipped = !this.state.cards[index].flipped;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = Game;
}