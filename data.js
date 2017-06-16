const CommonCards = ["Dash", "Drive", "Grasp", "Pulse", "Shot", "Strike"];
const GridWidth = 7;
const GridHeight = 5;
const StartingHP = 20;
const NumberOfPlayers = 2;

module.exports = {
    GenerateInitialState: function () {
        var players = [];
        for (var i = 0; i < NumberOfPlayers; i++) {
            players.push({ hp: StartingHP });
        }

        return {
            gridWidth: GridWidth,
            gridHeight: GridHeight,
            cards: [],
            players: players
        };
    },
    GenerateDeck: function (name, cardNames) {
        var deck = [];

        for (var i = 0; i < CommonCards.length; i++) {
            deck.push({
                name: "_Common/" + CommonCards[i],
                flipped: false,
                x: -1,
                y: -1,
            });
        }

        for (var i = 0; i < cardNames.length; i++) {
            deck.push({
                name: name + "/" + cardNames[i],
                flipped: false,
                x: -1,
                y: -1
            });
        }

        return deck;
    }
};