const CommonCards = ["Dash", "Drive", "Grasp", "Pulse", "Shot", "Strike"];
const MedusaCards = ["Alluring", "Arresting", "Irresistible", "Sundering", "Tempting", "Gaze", "Medusa", "Medusa.1", "Stone Counter", "Bellerophon Bridle of Chivalry", "Cybele Mystic Eyes of Petrification"];
const GridWidth   = 7;
const GridHeight  = 5;

var grid;

var initializeGrid = function() {
    grid = [];
    for(var i = 0; i < GridHeight; i++) {
        var gridRow = [];
        for(var j = 0; j < GridWidth; j++) {
            gridRow.push(-1);
        }

        grid.push(gridRow);
    }

    return grid;
}

var getGrid = function() {
    return grid;
}

var setGridValue = function(x, y, value) {
    grid[y][x] = value;
}

var generateDeck = function(name) {
    var deck = [];
    
    for(var i = 0; i < CommonCards.length; i++) {
        deck.push({
            name: CommonCards[i]
        });
    }

    for(var i = 0; i < MedusaCards.length; i++) {
        deck.push({
            name: MedusaCards[i]
        });
    }

    return deck;
}

module.exports = {
    initializeGrid: initializeGrid,
    getGrid: getGrid,
    setGridValue: setGridValue,
    generateDeck: generateDeck
}