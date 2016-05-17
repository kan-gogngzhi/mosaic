/**
 * @module MosaicPageController
 * Current page controller
 */
var MosaicPageController = (function (MosaicProcessor) {
    'use strict';

    var privateObj = {}, // private module properties and methods
        publicObj = {}; // public API interface obj

    /**
     * @type {{tileWidth: number, tileHeight: number, addImgButton: Element, hiddenInput: Element, canvas: Element,
     *     mosaicContainer: Element, initMosaicContainer: privateObj.initMosaicContainer, addBindings:
     *     privateObj.addBindings, processImgMosaic:
     *     privateObj.processImgMosaic, handleFiles: privateObj.handleFiles}}
     *
     * @todo improvements: dom elements could be wrapped into different models
     */
    privateObj = {
        tileWidth: 0,
        tileHeight: 0,
        // this is the button visible on the page to add a photo, it will trigger the hiddenInput click event
        addImgButton: document.querySelector('#input-button'),
        // the hidden input that selects a file
        hiddenInput: document.querySelector("#source-image"),
        // the canvas that will draw the selected img
        canvas: document.querySelector("#img-canvas"),
        // the container that will display the mosaic img
        mosaicContainer: document.querySelector('#mosaic-container'),

        initCanvas: function (img) {
            var canvas = privateObj.canvas;
            canvas.width = Math.floor(window.innerWidth / 2);
            canvas.height = (img.height / img.width) * canvas.width;
            //canvas.width = img.width;
            //canvas.height = img.height;
        },

        getCanvasContext: function () {
            return privateObj.canvas.getContext('2d');
        },

        drawImgOnCanvas: function (img) {
            privateObj.getCanvasContext().drawImage(img, 0, 0, img.width, img.height,
                0, 0, privateObj.canvas.width, privateObj.canvas.height);
        },

        /**
         * Initialise the mosaic container -> empty it and set its height
         */
        initMosaicContainer: function (width, height) {
            var mosaicContainer = privateObj.mosaicContainer;

            mosaicContainer.innerHTML = '';
            mosaicContainer.style.height = height + 'px';
            mosaicContainer.style.width = width + 'px';
        },
        /**
         * Add bindings to dom elements
         *
         * Click on the {@link privateObj.addImgButton} will trigger the {@link privateObj.hiddenInput}
         *
         * When a different file is selected it will trigger the {@link privateObj.handleFiles} function
         */
        addBindings: function () {
            var inputElement = privateObj.hiddenInput,
                inputButton = privateObj.addImgButton;
            inputButton.onclick = function () {
                inputElement.click();
            };
            inputElement.onchange = privateObj.handleFiles;
        },
        /**
         * Process image and start drawing mosaic by {@link module:MosaicProcessor}
         * @param {Image} img
         * @param {Element} canvas
         * @param {number} tileWidth
         * @param {number} tileHeight
         */
        processImgMosaic: function (canvas, tileWidth, tileHeight) {
            var canvasWidth = canvas.width,
                canvasHeight = canvas.height,
                numOfTilesX = Math.ceil(canvasWidth / tileWidth),
                numOfTilesY = Math.ceil(canvasHeight / tileHeight),
                mosaicRowNum = 0,
                mosaicContainer = privateObj.mosaicContainer,
                mosaicContainerHeight = numOfTilesY * tileHeight,
                mosaicContainerWidth = numOfTilesX * tileWidth;

            privateObj.initMosaicContainer(mosaicContainerWidth, mosaicContainerHeight); // initilise mosaic container width and height based
            // initilise the Mosaic Processor
            MosaicProcessor.init(tileWidth, tileHeight, canvasWidth, canvasHeight, numOfTilesX, numOfTilesY);
            //draw Mosaic row by row
            MosaicProcessor.drawMosaic(canvas.getContext('2d'), mosaicRowNum, mosaicContainer);
        },

        /**
         * Read file and start processing the mosaic img
         *
         * @todo improvements: may consider separating the read file and start processing img logic into two functions
         */
        handleFiles: function () {
            var fileList = this.files,
                selectedFile = fileList[0],
                img = new Image(),
                reader = new FileReader(),
                canvas = privateObj.canvas;

            if (selectedFile) {
                reader.onloadstart = function () {
                    console.log('uploading');
                };
                reader.onload = (function (img) {
                    console.log('uploaded');
                    return function () {
                        MosaicProcessor.stopDrawing();
                        img.src = reader.result;
                        privateObj.initCanvas(img); // initialise the width and height of canvas
                        privateObj.drawImgOnCanvas(img); // draw image on the canvas, scale up/down for the screen size
                        // on canvas
                        privateObj.processImgMosaic(canvas, privateObj.tileWidth, privateObj.tileHeight);
                    };
                }(img));

                reader.readAsDataURL(selectedFile);
            }
        }
    };

    publicObj = {
        /**
         * Public interface: set tile width and height and initialise dom event bindings
         * @param {number} tileWidth
         * @param {number} tileHeight
         */
        init: function (tileWidth, tileHeight) {
            privateObj.tileWidth = tileWidth;
            privateObj.tileHeight = tileHeight;
            privateObj.addBindings();
        }
    };

    return publicObj;
}(MosaicProcessor));