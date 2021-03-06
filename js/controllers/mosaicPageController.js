/**
 * Current page controller
 * @module MosaicPageController
 * needs {@link module:MosaicProcessor} and {@link module:Modal}
 */
var MosaicPageController = (function (MosaicProcessor, Modal) {
    'use strict';

    var privateObj = {},// private module properties and methods
        publicObj = {};// public API interface obj
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
        // the container that contains both the canvas and the mosaic container
        normalNMosaicRow: document.querySelector('#normal-n-mosaic-row'),
        // modal uploading content
        modalContent: 'Image uploading . . .',
        init: function () {
            Modal.setContent(privateObj.modalContent);
            privateObj.addBindings();
        },
        clearImgs: function () {
            var canvas = privateObj.canvas,
                context = canvas.getContext('2d');
            privateObj.mosaicContainer.innerHTML = '';
            context.clearRect(0, 0, canvas.width, canvas.height);
        },
        /**
         * Get half of the {@link privateObj.normalNMosaicRow} clientWidth and minus a tile width to make sure this row
         * can container both the canvas and the mosaic img
         * @returns {number} calculatedCanvasWidth
         */
        getCalculatedCanvasWidth: function () {
            return Math.floor(privateObj.normalNMosaicRow.clientWidth / 2) - privateObj.tileWidth;
        },
        /**
         * Calculate the canvas height based on the img height/width ratio and the canvas width
         * @param {number} canvasWidth
         * @param {number} imgWidth
         * @param {number} imgHeight
         * @returns {number}
         */
        getCalculatedCanvasHeight: function (canvasWidth, imgWidth, imgHeight) {
            return (imgHeight / imgWidth) * canvasWidth;
        },
        /**
         * Initialise the width and height of the canvas baed on the image width and height
         * @param {Image} img
         */
        initCanvas: function (img) {
            var canvas = privateObj.canvas,
                calculatedWidth = privateObj.getCalculatedCanvasWidth();
            canvas.width = calculatedWidth;
            canvas.height = privateObj.getCalculatedCanvasHeight(calculatedWidth, img.width, img.height);
        },
        /**
         * Get the context of the {@link privateObj.canvas} canvas
         * @returns {CanvasRenderingContext2D}
         */
        getCanvasContext: function () {
            return privateObj.canvas.getContext('2d');
        },
        /**
         * Get the number of tiles in a row
         * @returns {number}
         */
        getNumOfTilesX: function () {
            return Math.ceil(privateObj.canvas.width / privateObj.tileWidth);
        },
        /**
         * Get the number of tiles in a col
         * @returns {number}
         */
        getNumOfTilesY: function () {
            return Math.ceil(privateObj.canvas.height / privateObj.tileHeight);
        },
        /**
         * Get calculated mosaic container height based on the number of tiles {@link privateObj.getNumOfTilesY} in col
         * and the tile height {@link privateObj.tileHeight}
         * @returns {number}
         */
        getCalculatedMosaicContainerHeight: function () {
            return privateObj.getNumOfTilesY() * privateObj.tileHeight;
        },
        /**
         * Get calculated mosaic container width based on the number of tiles {@link privateObj.getNumOfTilesX} in row
         * and the tile height {@link privateObj.tileWidth}
         * @returns {number}
         */
        getCalculatedMosaicContainerWidth: function () {
            return privateObj.getNumOfTilesX() * privateObj.tileWidth;
        },
        /**
         * Draw image on the {@link privateObj.canvas} canvas
         * @param img
         */
        drawImgOnCanvas: function (img) {
            privateObj.getCanvasContext().drawImage(img, 0, 0, img.width, img.height,
                0, 0, privateObj.canvas.width, privateObj.canvas.height);
        },
        /**
         * Initialise the mosaic container -> empty it and set its height
         */
        initMosaicContainer: function () {
            var mosaicContainer = privateObj.mosaicContainer;

            mosaicContainer.innerHTML = '';
            mosaicContainer.style.height = privateObj.getCalculatedMosaicContainerHeight() + 'px';
            mosaicContainer.style.width = privateObj.getCalculatedMosaicContainerWidth() + 'px';
        },
        /**
         * Add bindings to dom elements
         *
         * Click on the {@link privateObj.addImgButton} will trigger the {@link privateObj.hiddenInput}
         *
         * When a different file is selected it will trigger the {@link privateObj.handleFiles} handleFiles function
         */
        addBindings: function () {
            var inputElement = privateObj.hiddenInput,
                inputButton = privateObj.addImgButton,
                inputElementClick = function () {
                    inputElement.click();
                };
            inputButton.onclick = inputElementClick;
            inputElement.onchange = privateObj.handleFiles;
        },
        /**
         * Process image and start drawing mosaic by {@link module:MosaicProcessor}
         */
        processImgMosaic: function () {
            var canvas = privateObj.canvas,
                mosaicRowNum = 0;// starting row number of the mosaic tiled image;

            privateObj.initMosaicContainer();// initialise mosaic container: empty its content and set width and height
            // initialise the Mosaic Processor
            MosaicProcessor.init(privateObj.tileWidth,
                privateObj.tileHeight,
                canvas.width,
                canvas.height,
                privateObj.getNumOfTilesX(),
                privateObj.getNumOfTilesY(),
                privateObj.mosaicContainer);
            // start drawing the mosaic image
            MosaicProcessor.drawMosaic(privateObj.getCanvasContext(), mosaicRowNum);
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
                imgStartUploadingHandler = function () {
                    privateObj.clearImgs();
                    Modal.show();
                    MosaicProcessor.stopDrawing();
                },
                imgUploadedHandler = function () {
                    img.src = reader.result;
                },
                imgLoadedHandler = function () {
                    Modal.hide();
                    // initialise the width and height of canvas
                    privateObj.initCanvas(img);
                    // draw image on the canvas, scale up/down for the screen size on canvas
                    privateObj.drawImgOnCanvas(img);
                    privateObj.processImgMosaic();
                };

            if (selectedFile) {
                reader.onloadstart = imgStartUploadingHandler;
                reader.onload = imgUploadedHandler;
                img.onload = imgLoadedHandler;
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
            privateObj.init();
        }
    };

    return publicObj;
}(MosaicProcessor, Modal));