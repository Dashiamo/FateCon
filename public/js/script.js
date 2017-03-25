// Globals
var socket = null;
var dragging = false;
var game = null;
var player = -1;

// Constants
const CellWidth = 101;
const CellHeight = 141;
const DefaultCardWidth = 100;
const DefaultCardHeight = 140;
const ZoomedCardWidth = 375;
const ZoomedCardHeight = 523;
const ZoomedCardOffsetX = DefaultCardWidth / 2 - ZoomedCardWidth / 2;
const ZoomedCardOffsetY = DefaultCardHeight / 2 - ZoomedCardHeight / 2;

function MoveCard(target, to) {
    var cell = $($(".cell").get(to.x + to.y * game.state.gridWidth));
    target.animate({ top: cell.offset().top, left: cell.offset().left }, 100, "linear");
}

function DropCard(event, ui) {
    var target = $(event.target);

    ui.draggable.offset({
        top: target.offset().top,
        left: target.offset().left
    });

    var index = ui.draggable.data("index");
    var data = {
        to: {
            x: target.data("x"),
            y: target.data("y")
        },
        index: index
    };

    game.MoveCard(data.index, data.to);
    socket.emit("card moved", data);
}

function CreateGrid() {
    var height = game.state.gridHeight;
    var width = game.state.gridWidth;

    var parent = $("<div />", {
        class: "grid",
        width: width * CellWidth,
        height: height * CellHeight
    });

    parent.appendTo("body");

    for (var i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {
            var cell = $("<div />", {
                id: j + "-" + i,
                class: "cell",
                width: CellWidth - 1,
                height: CellHeight - 1
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

function CreateCards() {
    for (var i = 0; i < game.state.cards.length; i++) {
        var card = game.state.cards[i];
        game.state.cards[i].element = CreateCard(card.name, i, card.owner);
        if (card.flipped) {
            FlipCard(i);
        }
    }
}

function CreateCard(name, index, owner) {
    var card = $("<div />").addClass("card")
        .offset({ left: 10, top: 10 + owner * (10 + DefaultCardHeight) })
        .css("z-index", index)
        .data("index", index)
        .appendTo("body");

    $("<img />").css("height", DefaultCardHeight)
        .attr("src", "/images/" + name + ".jpg")
        .attr("otherSide", "/images/Card Back.jpg")
        .appendTo(card);

    $("<div />").addClass("overlay")
        .appendTo(card);

    card.hover(
        function (event) {
            var target = $(event.target);
            var index = target.data("index");

            if (!dragging && !game.state.cards[index].flipped) {
                CreateZoomCard(target);
            }
        },
        function (event) {
            RemoveZoomCard();
        }
    );

    // Don't bind the listeners used to manipulate cards if you are a spectator.
    if (player === -1) {
        return card;
    }

    card.draggable({
        containment: "parent",
        cursor: "move",
        cursorAt: { top: DefaultCardHeight / 2, left: DefaultCardWidth / 2 },
        delay: 100,
        scroll: false,
        stack: ".card",
        start: function (event) {
            dragging = true;
            RemoveZoomCard();
        },
        stop: function (event) {
            dragging = false;
        }
    })

    card.click(function (event) {
        var target = $(event.target);
        var index = target.data("index");
        RemoveZoomCard();

        if (game.state.cards[index].owner === player) {
            game.FlipCard(index);
            FlipCard(index);
            socket.emit("card flipped", index);
        }
    });

    return card;
}

function PositionCards() {
    RemoveZoomCard();

    var cards = game.state.cards;
    for (var i = 0; i < cards.length; i++) {
        var card = cards[i];
        if (card.x > -1 && card.y > -1) {
            var cell = $("#" + card.x + "-" + card.y);
            if (cell) {
                card.element.offset({
                    top: cell.offset().top,
                    left: cell.offset().left
                });
            }
        }
    }
}

function CreateZoomCard(target) {
    var top = Math.max(0, target.offset().top + ZoomedCardOffsetY);
    top = Math.min($(window).height() - ZoomedCardHeight, top);

    var left = Math.max(0, target.offset().left + ZoomedCardOffsetX);
    left = Math.min($(window).width() - ZoomedCardWidth, left);

    $("<img />").attr("id", "zoom-card")
        .attr("src", target.children("img").attr("src"))
        .offset({ top: top, left: left })
        .appendTo("body");
}

function RemoveZoomCard() {
    $("#zoom-card").remove();
}

function FlipCard(index) {
    var target = game.state.cards[index].element;
    if (!target) {
        return;
    }

    if (player === -1 || game.state.cards[index].owner === player) {
        var targetOverlay = target.children(".overlay");
        targetOverlay.toggleClass("overlay-shown");
    } else {
        var targetImage = target.children("img");
        var otherSide = targetImage.attr("otherSide");
        targetImage.attr("otherSide", targetImage.attr("src"));
        targetImage.attr("src", otherSide);
    }
}

$(function () {
    socket = io();

    socket.on("setup", function (data) {
        player = data[0];
        game = new Game(data[1]);
        CreateGrid();
        CreateCards();
        PositionCards();
    });

    socket.on("card moved", function (data) {
        var target = game.state.cards[data.index].element;
        if (target) {
            game.MoveCard(data.index, data.to);
            MoveCard(target, data.to);
        }
    });

    socket.on("card flipped", function (index) {
        game.FlipCard(index);
        FlipCard(index);
    });

    $(window).resize(PositionCards);
});