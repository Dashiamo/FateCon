var Player = function (hp, hand = []) {
    this.hp = hp;
    this.hand = hand;

    return this;
}

Player.prototype.HasCard = function (index) {
    return this.hand.indexOf(index) > -1;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = Player;
}