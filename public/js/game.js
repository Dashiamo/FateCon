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

Game.prototype.AddCardToOwnersHand = function (index) {
    var player = this.state.cards[index].owner;

    // Trying to add a card you already have to your hand
    // should move it to the end to make reordering hand possible.
    if (this.state.players[player].HasCard(index)) {
        this.state.players[player].RemoveCard(index);
    }

    this.state.players[player].AddCard(index);
    this.state.cards[index].x = -1;
    this.state.cards[index].y = -1;
}

Game.prototype.AddDeck = function (player, deck) {
    for (var i = 0; i < deck.length; i++) {
        deck[i].owner = player;
        this.state.cards.push(deck[i]);
    }
}

Game.prototype.MoveCard = function (index, to) {
    var player = this.state.cards[index].owner;

    if (this.state.players[player].HasCard(index)) {
        this.state.players[player].RemoveCard(index);
    }

    this.state.cards[index].x = to.x;
    this.state.cards[index].y = to.y;
}

Game.prototype.FlipCard = function (index) {
    this.state.cards[index].flipped = !this.state.cards[index].flipped;
}

Game.prototype.ChangeLife = function (index, delta) {
    this.state.players[index].hp += delta;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = Game;
}