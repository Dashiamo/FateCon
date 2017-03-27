const Decks = {
    "Arturia Pendragon Alter": ["Arturia Pendragon Alter.1", "Arturia Pendragon Alter", "Demonic", "Excalibur Morgan Promised Victory", "Imperious", "Infernal", "Overpowering", "Sunder", "Tyrannic", "Tyrant Token", "Vortigern Hammer of the Vile King"],
    "Medusa": ["Alluring", "Arresting", "Irresistible", "Sundering", "Tempting", "Gaze", "Medusa", "Medusa.1", "Stone Counter", "Bellerophon Bridle of Chivalry", "Cybele Mystic Eyes of Petrification"],
    "Sasaki Kojirou": ["Alacrity Token", "Blossoms", "Hiken Tsubame Gaeshi", "Rivers", "Slash", "Souwa no Kokoroe", "Sparrows", "Springs", "Sasaki Kojirou", "Storms", "Sasaki Kojirou.1"]
}

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

        if (Decks[name]) {
            for (var i = 0; i < Decks[name].length; i++) {
                deck.push({
                    name: Decks[name][i],
                    flipped: false,
                    x: -1,
                    y: -1
                });
            }
        }

        return deck;
    }
};