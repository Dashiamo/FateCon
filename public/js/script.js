// Globals
var socket   = null;
var dragging = false;
var grid     = [];
var deck     = [];

// Constants
const CellWidth         = 101;
const CellHeight        = 141;
const DefaultCardWidth  = 100;
const DefaultCardHeight = 140;
const ZoomedCardWidth   = 375;
const ZoomedCardHeight  = 523;
const ZoomedCardOffsetX = DefaultCardWidth / 2 - ZoomedCardWidth / 2;
const ZoomedCardOffsetY = DefaultCardHeight / 2 - ZoomedCardHeight / 2;

function MoveCard(target, x, y) {
    var cell = $($(".cell").get(x + y * grid[0].length));
    target.animate({top: cell.offset().top, left: cell.offset().left}, 100, "linear");
}

function DropCard(event, ui) {
    var target = $(event.target);

    ui.draggable.offset({
        top: target.offset().top,
        left: target.offset().left
    });

    var index = ui.draggable.data("index");
    var x = target.data("x");
    var y = target.data("y");

    grid[y][x] = index;

    socket.emit("card moved", {
        index: index,
        x: x,
        y: y
    });
}

function CreateGrid(cellWidth, cellHeight, gridData) {
    grid = gridData;

    var height = grid.length;
    var width = grid[0].length;
    var parent = $('<div />', {
        class: 'grid',
        width: width  * cellWidth,
        height: height  * cellHeight
    });

    parent.appendTo('body');

    for (var i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {
            var cell = $('<div />', {
                class: 'cell',
                width: cellWidth - 1,
                height: cellHeight - 1
            });

            cell.droppable({
                classes: { "ui-droppable-hover": "hovered-cell" },
                drop: DropCard
            });

            if (i == 2) {
                cell.addClass("battle-row");
            }

            cell.data("x", j);
            cell.data("y", i);
            cell.appendTo(parent);
        }
    }
}

function CreateCards(cardData) {
    deck = cardData;
    for(var i = 0; i < deck.length; i++)
    {
        deck[i].element = CreateCard(deck[i].name, i);
    }
}

function CreateCard(name, index) {
    var card = $('<div />').addClass('card')
                           .data("index", index)
                           .appendTo("body");

    $("<img />").css("height", DefaultCardHeight)
                .attr("src", "/images/" + name + ".jpg")
                .attr("otherSide", "/images/Card Back.jpg")
                .appendTo(card);

    $("<div />").addClass("overlay")
                .appendTo(card);

    card.draggable({
        containment: "parent",
        cursor: "move",
        cursorAt: { top: DefaultCardHeight / 2, left: DefaultCardWidth / 2 },
        delay: 100,
        scroll: false,
        stack: ".card",
        start: function(event) {
            dragging = true;
            RemoveZoomCard();
        },
        stop: function(event) {
            dragging = false;
        }
    })

    card.hover(
        function(event) {
            var target = $(event.target);

            if (!dragging && !target.hasClass("flipped")) {
                CreateZoomCard(target);
            }
        },
        function(event) {
            RemoveZoomCard();
        }
    );

    card.click(function(event) {
        var target = $(event.target);

        if (!target.hasClass("flipped")) {
            RemoveZoomCard();
            target.children(".overlay").toggleClass("overlay-shown");
            socket.emit("card flipped", target.data("index"));
        }
    });

    return card;
}

function PositionCards() {
    $(".cell").each(function() {
        var x = $(this).data("x");
        var y = $(this).data("y");

        var index = grid[y][x];
        if (index >= 0) {
            var target = deck[index].element;
            target.offset({
                top: $(this).offset().top,
                left: $(this).offset().left
            });
        }
    });
}

function CreateZoomCard(target) {
    var top = Math.max(0, target.offset().top + ZoomedCardOffsetY);
    top = Math.min($(window).height() - ZoomedCardHeight, top);

    var left = Math.max(0, target.offset().left + ZoomedCardOffsetX);
    left = Math.min($(window).width() - ZoomedCardWidth, left);

    $("<img />").attr("id", "zoom-card")
                .attr("src", target.children("img").attr("src"))
                .offset({top: top, left: left})
                .appendTo("body");
}

function RemoveZoomCard() {
    $("#zoom-card").remove();
}

function FlipCard(target) {
    target.toggleClass("flipped");

    var targetImage = target.children("img");
    var otherSide = targetImage.attr("otherSide");
    targetImage.attr("otherSide", targetImage.attr("src"));
    targetImage.attr("src", otherSide);
}

$(function() {
    socket = io();

    socket.on("setup", function(data) {
        CreateGrid(CellWidth, CellHeight, data.grid);
        CreateCards(data.deck);
        PositionCards();
    });

    socket.on("card moved", function(data) {
        var target = deck[data.index].element;
        if (target) {
            MoveCard(target, data.x, data.y);
            grid[data.y][data.x] = data.index;
        }
    });

    socket.on("card flipped", function(data) {
        FlipCard($(".card").eq(data));
    });
});