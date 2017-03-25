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

var moveCard = function(from, to, index) {
    if (from.x >= 0 && from.y >= 0) {
        grid[from.y][from.x] = -1;
    }

    grid[to.y][to.x] = index;
}

var generateDeck = function(name) {
    var deck = [];
    
    for(var i = 0; i < CommonCards.length; i++) {
        deck.push({
            name: CommonCards[i],
            x: -1,
            y: -1
        });
    }

    for(var i = 0; i < MedusaCards.length; i++) {
        deck.push({
            name: MedusaCards[i],
            x: -1,
            y: -1
        });
    }

    return deck;
}

module.exports = {
    initializeGrid: initializeGrid,
    getGrid: getGrid,
    moveCard: moveCard,
    generateDeck: generateDeck
}