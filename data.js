const CommonCards = ["Dash", "Drive", "Grasp", "Pulse", "Shot", "Strike"];
const MedusaCards = ["Alluring", "Arresting", "Irresistible", "Sundering", "Tempting", "Gaze", "Medusa", "Medusa.1", "Stone Counter", "Bellerophon Bridle of Chivalry", "Cybele Mystic Eyes of Petrification"];
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
    GenerateDeck: function (name) {
        var deck = [];

        for (var i = 0; i < CommonCards.length; i++) {
            deck.push({
                name: CommonCards[i],
                flipped: false,
                x: -1,
                y: -1,
            });
        }

        for (var i = 0; i < MedusaCards.length; i++) {
            deck.push({
                name: MedusaCards[i],
                flipped: false,
                x: -1,
                y: -1
            });
        }

        return deck;
    }
};