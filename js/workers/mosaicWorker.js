/**
 * Web worker that will calculate avg rgb of one tile
 * fetch the tile img from server and return to the Main thread
 *
 * @todo: improvements: use cached tile img pool, add new tile img to the pool then fetch from pool first then server
 */

importScripts('../modules/constants.js', '../modules/http.js',
    '../modules/colorTool.js', '../modules/mosaicWorkerHelper.js',
    '../models/tile.js', '../models/mosaicRowUI.js');

onmessage = function (e) {
    'use strict';

    var data = e.data,
        imgData = data.imgData,
        tileHeight = data.tileHeight,
        tileWidth = data.tileWidth,
        canvasWidth = data.canvasWidth,
        canvasHeight = data.canvasHeight,
        tileRowYInImg = data.tileRowYInImg,// tile's y in the image = row num of current row * tile height
        currentTileXInImg = 0,// tile's x in the image = row num of current row * img width
        pixelData = imgData.data,
        numOfTilesInRow = data.numOfTilesX,
        hexColor = '',// the hex color code that will be used in the color url, converted from the avg rgb
        svgContent = '',// the svg images composing the tile row
        completedAjax = 0,// the counter of the ajax calls, to track how many has completed
        rowContent = [],// stores the svg images in the order of tile position in the row
        currentTileIndex = 0,// current tile's index in the tile row, 0 - (number of tiles in the row -1)
        avgRGB = {},
        currentTile = new Tile(tileWidth, tileHeight),
        mosaicRowUI = new MosaicRowUI();//set the default tile width and tile height

    //adjust current tile height
    if (tileRowYInImg + tileHeight > canvasHeight) {
        currentTile.height = canvasHeight - tileRowYInImg;
    }

    // calculate avg color
    for (currentTileIndex; currentTileIndex < numOfTilesInRow; currentTileIndex += 1) {// loop over each tile in the row
        currentTileXInImg = currentTileIndex * tileWidth;// reset current tile row X in img
        // adjust tile width
        if (currentTileXInImg + tileWidth > canvasWidth) {
            currentTile.width = canvasWidth - currentTileXInImg;
        } else {
            currentTile.width = tileWidth;
        }
        // calculate avg rgb of current tile
        avgRGB = currentTile.getAvgRBG(pixelData, canvasWidth, currentTileIndex, tileWidth);
        // convert rgb to hex
        hexColor = ColorTool.rgbToHex(avgRGB.r, avgRGB.g, avgRGB.b);
        // fetch tile img from server
        /**
         * @todo can use tile image pool(cached tile images) to improve performance
         */
        MosaicWorkerHelper.getTile(hexColor, currentTileIndex).then(function (response) {
            rowContent[response.index] = response.response;
            completedAjax += 1;
            if (completedAjax === numOfTilesInRow) {// all promises have been completed
                svgContent = rowContent.join('');
                MosaicWorkerHelper.returnImgRow(mosaicRowUI, svgContent);
            }
        });
    }
};
