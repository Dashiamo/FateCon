// Globals
var socket = null;
var dragging = false;
var game = null;
var player = -1;

var CellWidth = 0;
var CellHeight = 0;
var DefaultCardWidth = 0;
var DefaultCardHeight = 0;

// Constants
const HandAreaMargin = 20;
const ZoomedCardWidth = 375;
const ZoomedCardHeight = 523;

function SetupDimensions() {
    var windowHeight = $(window).height();
    var ratio = ZoomedCardWidth / ZoomedCardHeight;
    DefaultCardHeight = (windowHeight - (2 * HandAreaMargin)) / (2 + game.state.gridHeight);
    DefaultCardWidth = DefaultCardHeight * ratio;
    CellHeight = Math.ceil(DefaultCardHeight) + 1;
    CellWidth = Math.ceil(DefaultCardWidth) + 1;
    $(".hand").css("height", DefaultCardHeight + HandAreaMargin / 2);
}

function MoveCardToGridCell(index, cell, card, animationDelay = 100) {
    card.animate({ top: cell.offset().top, left: cell.offset().left }, animationDelay, "linear");
    PositionCardsInHand(game.state.cards[index].owner);
}

function DropCard(event, ui) {
    var target = $(event.target);
    var data = {
        to: {
            x: target.data("x"),
            y: target.data("y")
        },
        index: ui.draggable.data("index")
    };

    game.MoveCard(data.index, data.to);
    MoveCardToGridCell(data.index, target, ui.draggable, 0);
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
        .offset({ left: 10, top: 200 + owner * (10 + DefaultCardHeight) })
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
        revert: "invalid",
        revertDuration: 100,
        scroll: false,
        stack: ".card",
        start: function () {
            dragging = true;
            RemoveZoomCard();
        },
        stop: function () {
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

function PositionCardsInHand(player, animationDelay = 100) {
    var hand = game.state.players[player].hand;
    var handArea = $($(".hand").get(player));

    // xOffset is the position the leftmost card should sit to make all cards centered.
    var xOffset = (handArea.width() / 2) - (((hand.length * DefaultCardWidth) + ((hand.length - 1) * HandAreaMargin / 2)) / 2);
    var top = handArea.offset().top + (handArea.height() - DefaultCardHeight) / 2;

    for (var i = 0; i < hand.length; i++) {
        game.state.cards[hand[i]].element.animate({
            top: top,
            left: xOffset + i * (DefaultCardWidth + HandAreaMargin / 2)
        }, animationDelay, "linear");
    }
}

function CreateHand() {
    $($(".hand").get(player)).droppable({
        accept: function (draggable) {
            return game.state.cards[draggable.data("index")].owner === player;
        },
        drop: function (event, ui) {
            var index = ui.draggable.data("index");
            game.AddCardToOwnersHand(index);
            PositionCardsInHand(player);
            socket.emit("add to hand", index);
        }
    });
}

function ResizeCards() {
    $(".card").draggable("option", "cursorAt", { top: DefaultCardHeight / 2, left: DefaultCardWidth / 2 });
    $(".card img").css("height", DefaultCardHeight);
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
    var zoomedCardOffsetX = DefaultCardWidth / 2 - ZoomedCardWidth / 2;
    var zoomedCardOffsetY = DefaultCardHeight / 2 - ZoomedCardHeight / 2;

    var top = Math.max(0, target.offset().top + zoomedCardOffsetY);
    top = Math.min($(window).height() - ZoomedCardHeight, top);

    var left = Math.max(0, target.offset().left + zoomedCardOffsetX);
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
        SetupDimensions();
        CreateGrid();
        CreateCards();
        CreateHand();
        PositionCardsInHand(0, 0);
        PositionCardsInHand(1, 0);
        PositionCards();
    });

    socket.on("card moved", function (data) {
        var target = game.state.cards[data.index].element;
        if (target) {
            var cell = $($(".cell").get(data.to.x + data.to.y * game.state.gridWidth));
            game.MoveCard(data.index, data.to);
            MoveCardToGridCell(data.index, cell, target);
        }
    });

    socket.on("card flipped", function (index) {
        game.FlipCard(index);
        FlipCard(index);
    });

    socket.on("add to hand", function (index) {
        game.AddCardToOwnersHand(index);
        PositionCardsInHand(game.state.cards[index].owner);
    });

    $(window).resize(function () {
        SetupDimensions();
        $(".grid").remove();
        CreateGrid();
        ResizeCards();
        PositionCardsInHand(0, 0);
        PositionCardsInHand(1, 0);
        PositionCards();
    });
});