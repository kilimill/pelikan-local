export class Player{

    elementPlayer;

    elementCanvas;
    elementCanvasWrapper;
    elementCanvasAreaWrapper;

    elementControlPanelTrigger;
    elementToggleFullscreenButton;

    snapshotInterval;

    inMemCanvas;
    inMemCtx;

    name;

    canvasStepMs = 50;

    constructor(refs) {
        this.inMemCanvas = document.createElement('canvas');
        this.inMemCtx = this.inMemCanvas.getContext('2d');
        this.elementPlayer = refs.player;
        this.elementCanvas = refs.playerCanvas;
        this.elementCanvasWrapper = refs.playerCanvasWrapper;
        this.elementCanvasAreaWrapper = refs.playerCanvasAreaWrapper;
        this.elementToggleFullscreenButton = refs.playerToggleFullscreenButton;
        this.setLoadedDataEvent();
        this.setFullscreenEvent();
        this.setFullscreenChangeEvent();
        // this.setControlPanelToggleEvent();
    }

    clearCanvas(){
        clearInterval(this.snapshotInterval);
        this.snapshotInterval = undefined;
        if(typeof this.elementCanvas !== 'undefined'){
            this.elementCanvas.getContext('2d')
                .clearRect(0,0,this.elementCanvas.width, this.elementCanvas.height);
        }
        if(typeof this.inMemCanvas !== 'undefined'){
            this.inMemCanvas.getContext('2d')
                .clearRect(0,0,this.inMemCanvas.width, this.inMemCanvas.height);
        }
    }

    resizeVideoCanvas(){
        clearInterval(this.snapshotInterval);
        this.snapshotInterval = undefined;
        this.setSnapshotInterval();
    }

    stopInterval(){
        clearInterval(this.snapshotInterval);
        this.snapshotInterval = undefined;
    }

    setSnapshotInterval () {
        this.elementCanvasWrapper.style.backgroundColor = '#000000';

        let canvas = this.elementCanvas;

        this.snapshotInterval = setInterval(() => {

            let canvasAreaWidth = Math.round(
              parseInt(this.elementCanvasWrapper.clientWidth));
            let canvasAreaHeight = Math.round(
              parseInt(this.elementCanvasWrapper.clientHeight));
            let canvasWidth, canvasHeight, lastActualVideoWidth,
              lastActualVideoHeight;

            canvasWidth = this.elementCanvasWrapper.clientWidth;
            canvasHeight = this.elementCanvasWrapper.clientHeight;

            let offsetLeft, offsetTop;
            let canvasRatio = canvasWidth / canvasHeight;

            if (
              this.elementPlayer.videoWidth > 0 &&
              this.elementPlayer.videoHeight > 0
            ) {
                lastActualVideoWidth = this.elementPlayer.videoWidth;
                lastActualVideoHeight = this.elementPlayer.videoHeight;
            }

            let actualVideoWidth = this.elementPlayer.videoWidth
              ? this.elementPlayer.videoWidth
              : lastActualVideoWidth;
            let actualVideoHeight = this.elementPlayer.videoHeight
              ? this.elementPlayer.videoHeight
              : lastActualVideoHeight;

            if (
              canvasRatio > 1 &&
              ((actualVideoWidth / actualVideoHeight) <= 1)
            ) {
                canvasHeight = Math.round(canvasAreaHeight);
                canvasWidth = Math.round(
                  (actualVideoWidth / actualVideoHeight) * canvasHeight);
            }

            if (
              (canvasRatio > 1 &&
                ((actualVideoWidth / actualVideoHeight) > 1)) ||
              canvasRatio <= 1
            ) {
                canvasWidth = Math.round(canvasAreaWidth);
                let canvasTryHeight = (actualVideoHeight / actualVideoWidth) *
                  canvasWidth;
                if (canvasHeight >= canvasTryHeight) {
                    canvasHeight = (actualVideoHeight / actualVideoWidth) *
                      canvasWidth;
                } else {
                    canvasWidth = Math.round(
                      (actualVideoWidth / actualVideoHeight) * canvasHeight);
                }
            }

            offsetLeft = (canvasAreaWidth > canvasWidth) ? (canvasAreaWidth -
              canvasWidth) / 2 : 0;
            offsetTop = (canvasAreaHeight > canvasHeight) ? (canvasAreaHeight -
              canvasHeight) / 2 : 0;

            this.elementCanvasAreaWrapper.style.left = offsetLeft + 'px';
            this.elementCanvasAreaWrapper.style.top = offsetTop + 'px';

            this.elementCanvasAreaWrapper.style.width = canvasWidth + 'px';
            this.elementCanvasAreaWrapper.style.height = canvasHeight + 'px';

            this.elementCanvas.width = canvasWidth;
            this.elementCanvas.height = canvasHeight;

            canvas.getContext('2d').
              clearRect(0, 0, canvas.width, canvas.height);

            let wrh = actualVideoWidth / actualVideoHeight;
            let newWidth = this.elementCanvasAreaWrapper.clientWidth;
            let newHeight = newWidth / wrh;
            if (newHeight > this.elementCanvasAreaWrapper.clientHeight) {
                newHeight = this.elementCanvasAreaWrapper.clientHeight;
                newWidth = newHeight * wrh;
            }
            let xOffset = newWidth < this.elementCanvasAreaWrapper.clientWidth
              ? ((this.elementCanvasAreaWrapper.clientWidth - newWidth) / 2)
              : 0;
            let yOffset = newHeight < this.elementCanvasAreaWrapper.clientHeight
              ? ((this.elementCanvasAreaWrapper.clientHeight - newHeight) / 2)
              : 0;

            if (
              this.elementPlayer.videoWidth === 0 &&
              this.elementPlayer.videoHeight === 0
            ) {
                let ctx = canvas.getContext('2d');
                ctx.drawImage(this.inMemCanvas, xOffset, yOffset, newWidth,
                  newHeight);
            } else {
                canvas.getContext('2d').drawImage(
                  this.elementPlayer,
                  xOffset,
                  yOffset,
                  newWidth,
                  newHeight,
                );

                this.inMemCanvas.width = this.elementPlayer.videoWidth;
                this.inMemCanvas.height = this.elementPlayer.videoHeight;
                this.inMemCtx.drawImage(
                  this.elementPlayer,
                  0,
                  0,
                  this.elementPlayer.videoWidth,
                  this.elementPlayer.videoHeight,
                );
            }

            this.elementCanvasWrapper.style.visibility = 'visible';

        }, this.canvasStepMs);
    }

    setLoadedDataEvent () {
        this.elementPlayer.addEventListener(
          'loadeddata',
          () => {
              if (this.snapshotInterval === undefined) {
                  this.setSnapshotInterval();
              }
          },
          false,
        );
    }

    setFullscreenEvent() {
        if(this.elementToggleFullscreenButton === undefined){
            return true;
        }
        this.elementToggleFullscreenButton.addEventListener(
            'click',
            () => {
                if (!document.fullscreenElement) {
                    this.elementCanvasWrapper.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
            }
        );
    }

    setFullscreenChangeEvent(){
        this.elementCanvasWrapper.addEventListener(
            'fullscreenchange',
            () => {
                // if (!document.fullscreenElement) {
                //     PdfController.presentationBlockIsActive = !PdfController.presentationBlockIsActive;
                //     PdfController.changeVideoPdfWrapper(false);
                // }
            }
        );
    }

    setControlPanelToggleEvent() {
        this.elementCanvasWrapper.addEventListener(
            'mouseleave',
            () => {
                clearTimeout(window.fullScreenMoveTimeout);
                this.elementCanvasWrapper.querySelector('.gradient-block').style.display = "none";
                // this.elementCanvasWrapper.find('.gradient-block').fadeOut(0);
            }
        );
        this.elementCanvasWrapper.addEventListener(
          'mousemove',
          () => {
              this.elementCanvasWrapper.querySelector('.gradient-block').style.display = "block";
              clearTimeout(window.fullScreenMoveTimeout);
              window.fullScreenMoveTimeout = setTimeout(() => {
                  this.elementCanvasWrapper.querySelector('.gradient-block').style.display = "none";
                  // this.elementCanvasWrapper.find('.gradient-block').fadeOut(0);
              }, 3000);
          }
        )
    }
}

export class MainPlayer extends Player{
    constructor(refs) {
        super(refs);
        this.name = 'MainPlayer';
    }
}

export class ScreenPlayer extends Player{
    constructor(refs) {
        super(refs);
        this.name = 'ScreenPlayer';
    }
}
