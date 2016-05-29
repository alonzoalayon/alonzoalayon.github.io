'use strict';
$(document).ready(function() {
    // Put app logic here
    var towerBlock = null;
    var $tower;
    var $tower1;
    var $block;
    var $block1;
    var $tower2 = $('#tower2');
    var $tower3 = $('#tower3');
    $(document).ready(init);

    function init() {
        $('div[data-stack]').on('click', selectBlock);
    }

    function selectBlock() {
        if (towerBlock === null) {
            $tower = $(this);
            towerBlock = $tower.find($('div[data-block]')).data(
                'val');
            $block = $tower.find($('div[data-block]:last-child'));
            if ($tower.find($('div[data-block]')).length === 0) {
                towerBlock = null;
            } else {
                $block.addClass('selected');
            }
        } else {
            $tower1 = $(this);
            $block1 = $tower1.find($('div[data-block]:last-child'));
            $block.removeClass('selected');
            if ($block.height() < $block1.height() || $tower1.find(
                $('div[data-block]')).length === 0) {
                var move = $block.detach();
                $tower1.append(move);
                checkForWin();
            }
            towerBlock = null;
        }
    }

    function checkForWin() {
        if ($tower2.find($('div[data-block]')).length === 4 ||
            $tower3.find($('div[data-block]')).length === 4) {
            $('#announce-game-won').text("You Won!");
        }
    }
});