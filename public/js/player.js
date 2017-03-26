var Player = function (hp, hand = []) {
    this.hp = hp;
    this.hand = hand;

    return this;
}

Player.prototype.AddCard = function (index) {
    this.hand.push(index);
}

Player.prototype.RemoveCard = function (index) {
    var cardPosition = this.hand.indexOf(index);
    if (cardPosition > -1) {
        this.hand.splice(cardPosition, 1);
    }
}

Player.prototype.HasCard = function (index) {
    return this.hand.indexOf(index) > -1;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = Player;
}