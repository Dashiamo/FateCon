var Player = function (hp, deck = []) {
    this.hp = hp;
    this.deck = deck;

    return this;
}

Player.prototype.HasCard = function (index) {
    return this.deck.indexOf(index) > -1;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = Player;
}