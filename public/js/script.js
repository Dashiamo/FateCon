// Globals
var socket   = null;
var dragging = false;

// Constants
const gridWidth         = 101;
const gridHeight        = 141;
const defaultCardWidth  = 100;
const defaultCardHeight = 140;
const zoomedCardWidth   = 375;
const zoomedCardHeight  = 523;
const zoomedCardOffsetX = defaultCardWidth / 2 - zoomedCardWidth / 2;
const zoomedCardOffsetY = defaultCardHeight / 2 - zoomedCardHeight / 2;

const commonCards = ["Dash", "Drive", "Grasp", "Pulse", "Shot", "Strike"];
const medusaDeck  = ["Alluring", "Arresting", "Irresistible", "Sundering", "Tempting", "Gaze", "Medusa", "Medusa.1", "Stone Counter", "Bellerophon Bridle of Chivalry", "Cybele Mystic Eyes of Petrification"];

function DropCard(event, ui) {
    var target = $(event.target);

    var index = ui.draggable.index(".card-wrapper");
    var top = target.offset().top;
    var left = target.offset().left;

    ui.draggable.offset({top: top, left: left});
    socket.emit("card moved", [index, top, left]);
}

function CreateGrid(cellWidth, cellHeight, width, height) {
    var parent = $('<div />', {
        class: 'grid',
        width: width  * cellWidth,
        height: height  * cellHeight
    });

    parent.appendTo('body');

    for (var i = 0; i < height; i++) {
        for (var j = 0; j < width; j++) {
            var cell = $('<div />', {
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

            cell.appendTo(parent);
        }
    }
}

function CreateCard(name) {
    var parent = $('<div />').addClass('card-wrapper')
                             .appendTo("body");

    $("<img />").css("height", defaultCardHeight)
                .addClass("card")
                .attr("src", "/images/" + name + ".jpg")
                .attr("otherSide", "/images/Card Back.jpg")
                .appendTo(parent);

    $("<div />").addClass("overlay")
                .appendTo(parent);
}

function CreateZoomCard(target) {
    var top = Math.max(0, target.offset().top + zoomedCardOffsetY);
    top = Math.min($(window).height() - zoomedCardHeight, top);

    var left = Math.max(0, target.offset().left + zoomedCardOffsetX);
    left = Math.min($(window).width() - zoomedCardWidth, left);

    $("<img />").attr("id", "zoom-card")
                .attr("src", target.attr("src"))
                .offset({top: top, left: left})
                .appendTo("body");
}

function RemoveZoomCard() {
    $("#zoom-card").remove();
}

function FlipCard(target) {
    target.toggleClass("flipped");

    var otherSide = target.attr("otherSide");
    target.attr("otherSide", target.attr("src"));
    target.attr("src", otherSide);
}

$(function() {
    CreateGrid(gridWidth, gridHeight, 7, 5);

    for (var i = 0; i < commonCards.length; i++) {
        CreateCard(commonCards[i]);
    }

    for (var i = 0; i < medusaDeck.length; i++) {
        CreateCard(medusaDeck[i]);
    }

    socket = io();
    socket.on("card moved", function(data) {
        var target = $(".card-wrapper").eq(data[0]);
        if (target) {
            target.animate({top: data[1], left: data[2]}, 100, "linear");
        }
    });

    socket.on("card flipped", function(data) {
        FlipCard($(".card").eq(data));
    });

    $(".card-wrapper").draggable({
        cursor: "move",
        cursorAt: {
            top: defaultCardHeight / 2,
            left: defaultCardWidth / 2
        },
        containment: "parent",
        scroll: false,
        stack: ".card-wrapper",
        start: function(event) {
            dragging = true;
            RemoveZoomCard();
        },
        stop: function(event) {
            dragging = false;
        }
    })

    $(".card").hover(
        function(event) {
            var target = $(event.target)
            if (!dragging && !target.hasClass("flipped")) {
                CreateZoomCard(target);
            }
        },
        function(event) {
            RemoveZoomCard();
        }
    );

    $(".card-wrapper").click(function(event) {
        var target = $(event.target);
        if (!target.hasClass("flipped")) {
            RemoveZoomCard();
            target.siblings(".overlay").toggleClass("overlay-shown");
            socket.emit("card flipped", target.index(".card"));
        }
    });
});