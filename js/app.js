let pixels = [];
let settings = {
    size: 2,
    frameRate: 30,
    invertedColor: false,
    w: 300,
    h: 150,
    isPlaying: false
};

function starterFunction() {
    //Initialize the app
    addEventListeners();
}
function addEventListeners() {
    // Get elements
    const file = document.getElementById('file');
    const volumeControl = document.getElementById('volume');
    const playPause = document.getElementById('play-pause');
    const frameRateControl = document.getElementById('frameRate');
    const sizeControl = document.getElementById('size');
    const v = document.getElementById('v');

    // Add event listeners
    file.addEventListener('change', function () {
        const files = this.files;
        settings.isPlaying = false;
        //Add the video to the video element
        const video = document.getElementById('v');
        // Remove the width and height attributes
        video.removeAttribute('width');
        video.removeAttribute('height');

        if (video.isPlaying) video.stop()

        video.src = URL.createObjectURL(files[0]);
        video.volume = volumeControl.value;
        video.play();
    });

    volumeControl.addEventListener('input', function(){document.getElementById('v').volume = this.value});

    playPause.addEventListener('click', () => {
        const video = document.getElementById('v');
        if (video.paused) {
            video.play();
            document.getElementById('controller').style.opacity = 0.25;
        } else {
            video.pause();
            document.getElementById('controller').style.opacity = 1;
        }
    });

    frameRateControl.addEventListener('input', function(){ settings.frameRate = this.value});
    frameRateControl.addEventListener('dblclick', function(){
        this.value = 30;
        settings.frameRate = 30;
    });
    
    sizeControl.addEventListener('change', function(){changeVideoSize(this.value)});
    v.addEventListener('play', function() {
        const back = document.createElement('canvas');
        const backcontext = back.getContext('2d', {
            willReadFrequently: true
        });
        if (!settings.isPlaying) {
            settings.w = back.width = 300 / settings.size;
            settings.h = back.height = 150 / settings.size;
            settings.isPlaying = true;
        }
        const elem = document.getElementById('textRender');
        elem.style.width = settings.w + 'px';
        elem.style.height = settings.w + 'px';
        document.getElementById('controller').style.opacity = 0.25;

        draw(this, backcontext);

        setCorrectWidth();
    }, false);
    document.getElementById('robinMode').addEventListener('change', function () {
        if (this.checked) {
            document.getElementById('textRender').classList.add('robin-mode');
        } else {
            document.getElementById('textRender').classList.remove('robin-mode');
        }
    });
    document.getElementById('controller').addEventListener('mouseover', function () {
        this.style.opacity = 1;
    });
    document.getElementById('controller').addEventListener('mouseout', function () {
        if (settings.isPlaying) this.style.opacity = 0.25;
    });
    document.getElementById('invertColor').addEventListener('change', function () {
        if (this.checked) settings.invertedColor = true; else settings.invertedColor = false;
    });
}
function draw(v, bc) {
    if (v.paused || v.ended) return false;
    bc.drawImage(v, 0, 0, settings.w, settings.h);
    const idata = bc.getImageData(0, 0, settings.w, settings.h);
    const data = idata.data;
    pixels = [];
    for (let i = 0; i < settings.h; i++) {
        pixels[i] = pixels[i] || [];
        for (let j = 0; j < settings.w; j++) {
            const index = (i * settings.w + j) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            const brightness = (3 * r + 4 * g + b) >>> 3;

            pixels[i][j] = brightness;
        }
    }


    drawInNumbers();
    setTimeout(() => {
        draw(v, bc);
    }, 1000 / settings.frameRate);
}
function drawInNumbers() {
    //Get the element
    const textRender = document.getElementById('textRender');
    let text = "";
    //Loop through the pixels matrix
    for (let i = 0; i < pixels.length; i++) {
        for (let j = 0; j < pixels[i].length; j++) {
            //Get char from brightness
            let char = getChar(pixels[i][j]);
            text += char;
        }
        //Add a new line
        text += "\n";
    }
    textRender.innerHTML = text;
}
function getChar(brightness) {
    //Map brightness to a char
    const chars = ["&nbsp;", ".", ",", "+", "#", "&#x25A1;", "0", "$", "@"];
    if (settings.invertedColor) chars = chars.reverse();
    //Check if the brightness is min or max
    if (brightness <= 0) return chars[0];
    if (brightness >= 255) return chars[chars.length - 1];
    //If brightness is near max reduce the brightness
    if (brightness > 230) brightness *= 0.9;
    //Map brightness to a char
    const index = Math.floor(brightness / 256 * chars.length);
    return chars[index];
}
function setCorrectWidth() {
    const pixelFactor = 3.86;
    const heightFactor = 1.12;
    const width = pixels[0].length * pixelFactor;
    const textRender = document.getElementById('textRender');
    textRender.style.width = width + 'px';
    textRender.style.height = width * heightFactor + 'px';
}
function changeVideoSize(value) {
    const sizes = ["4", "2", "1"];
    settings.size = sizes[value - 1];
    const video = document.getElementById('v');
    v.pause();
    settings.isPlaying = false;
    setTimeout(() => {
        video.play();
    }, 75);

}
document.addEventListener("DOMContentLoaded", starterFunction);