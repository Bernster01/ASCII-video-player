let settings = {
    size: 2,
    frameRate: 30,
    invertedColor: false,
    w: 300,
    h: 150,
    isPlaying: false,
    brightnessThreshold: 230,
    brightnessThresholdFactor: 0.9,
    brightness: 1,
    useColor: false,
    fontSize: 14,
    autoAdjustBrightness: true,
    autoAdjustAgresivity: 0.5,
    playbackSpeed: 1

};
currentFrameData = "";
fetch('./data/info.json').then((response) => response.json()).then((data) => {
    document.getElementById('version').innerHTML = data.version;
});
function starterFunction() {
    //Initialize the app
    addEventListeners();
    displayVideoTime();
    document.getElementById('seekDisplay').style.visibility = 'hidden';
    document.querySelectorAll('input[type="range"]').forEach((input) => {
        input.addEventListener('mousedown', () => window.getSelection().removeAllRanges());
    });
    document.getElementById('textRender').addEventListener('click', () => {
        if (document.getElementById('v').paused) {
            document.getElementById('v').play();
            settings.isPlaying = true;

        } else {
            document.getElementById('v').pause();
            settings.isPlaying = false;
        }
    });


    updateLabel("volumeValue");
    updateLabel("sizeValue");
    updateLabel("frameRateValue");
}
function updateLabel(label) {
    const volumeValue = document.getElementById('volumeValue');
    const sizeValue = document.getElementById('sizeValue');
    const frameRateValue = document.getElementById('frameRateValue');
    switch (label) {
        case "volumeValue":
            volumeValue.innerHTML = Math.round(document.getElementById('volume').value * 100) + '%';
            break;
        case "sizeValue":
            setTimeout(() => {
                sizeValue.innerHTML = `${settings.w}x${Math.round(settings.h)}`;
            }, 100);
            break;
        case "frameRateValue":
            frameRateValue.innerHTML = document.getElementById('frameRate').value;
            break;
    }
}
/** 
* Add event listeners to the elements
*/
function addEventListeners() {
    // Get elements
    const file = document.getElementById('file');
    const volumeControl = document.getElementById('volume');
    const playPause = document.getElementById('play-pause');
    const frameRateControl = document.getElementById('frameRate');
    const sizeControl = document.getElementById('size');
    const v = document.getElementById('v');
    const timeSeek = document.getElementById('videoSeek');
    const fileDropVideo = document.getElementById('fileDrop');
    const playbackSpeed = document.getElementById('playbackSpeed');
    const settingsButton = document.getElementById('settingsButton');
    const brightness = document.getElementById('brightnessReduction');
    const autoBrightnessReductionCheckbox = document.getElementById('autoBrightnessReductionCheckbox');
    const useColor = document.getElementById('useColor');
    const autoBrightnessAgressive = document.getElementById('autoBrightnessAgressive'); 

    // Add event listeners
    useColor.addEventListener('click', () => {
        settings.useColor = useColor.checked;
        document.getElementById('color-canvas-container').style.display = settings.useColor ? 'flex' : 'none';
        document.getElementById('textRender').style.opacity = settings.useColor ? '0' : '1';
    });
    useColor.addEventListener('mouseover', () => {
        document.getElementById('useColorToolTip').style.display = 'inline';
    });
    useColor.addEventListener('mouseleave', () => {
        document.getElementById('useColorToolTip').style.display = 'none';
    });

    playbackSpeed.addEventListener('input', function () {
        settings.playbackSpeed = this.value;
        document.getElementById('playbackSpeedValue').innerHTML = Math.round(settings.playbackSpeed * 100) + '%';
        document.getElementById('v').playbackRate = settings.playbackSpeed;
    });
    brightness.addEventListener('input', function () {
        settings.brightness = this.value;
        document.getElementById('brightnessValue').innerHTML = Math.round(settings.brightness * 100) + '%';
    });
    autoBrightnessReductionCheckbox.addEventListener('click', function () {
        settings.autoAdjustBrightness = this.checked;
    });
    autoBrightnessAgressive.addEventListener('input', function () {
        settings.autoAdjustAgresivity = this.value;
    });
    
    settingsButton.addEventListener('click', () => {
        document.getElementById('vcv').classList.toggle('translateSelfLeft');
    });

    //Drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileDropVideo.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false)
    })
    fileDropVideo.addEventListener('dragover', (e) => { });
    fileDropVideo.addEventListener('drop', (e) => {
        changeVideo(e.dataTransfer.files);
    });
    file.addEventListener('change', function () {
        changeVideo(this.files);

    });

    volumeControl.addEventListener('input', function () {
        document.getElementById('v').volume = this.value
        updateLabel("volumeValue");
    });

    playPause.addEventListener('click', function () {
        const video = document.getElementById('v');
        if (video.paused) {
            video.play();
            this.innerHTML = "<i class='fa fa-pause'></i>";
        } else {
            video.pause();
            this.innerHTML = "<i class='fa fa-play'></i>";
        }
    });

    frameRateControl.addEventListener('input', function () {
        settings.frameRate = this.value
        updateLabel("frameRateValue");
    });
    frameRateControl.addEventListener('dblclick', function () {
        this.value = settings.frameRate = 30;
    });
    
    sizeControl.addEventListener('change', function () {
        changeVideoSize(this.value)

    });
    v.addEventListener('play', function () {
        const back = document.createElement('canvas');
        const backcontext = back.getContext('2d', {
            willReadFrequently: true
        });
        playPause.innerHTML = "<i class='fa fa-pause'></i>";
        if (!settings.isPlaying) {
            settings.w = back.width = 300 / settings.size;
            settings.h = back.height = 150 / settings.size;
            settings.isPlaying = true;
        }
        const elem = document.getElementById('textRender');
        elem.style.width = settings.w + 'px';
        elem.style.height = settings.w + 'px';
        const colorCanvas = document.getElementById('color-canvas');
        colorCanvas.width = settings.w;
        colorCanvas.height = settings.h;



        draw(this, backcontext,0);
        setCorrectWidth();
        setTimeout(setCorrectWidth, 100);
    }, false);
    document.getElementById('robinMode').addEventListener('change', function () {
        if (this.checked) {
            document.getElementById('textRender').classList.add('robin-mode');
        } else {
            document.getElementById('textRender').classList.remove('robin-mode');
        }
    });
    document.getElementById('invertColor').addEventListener('change', function () {
        if (this.checked) settings.invertedColor = true; else settings.invertedColor = false;
    });
    timeSeek.addEventListener('input', seekInVideo);
    timeSeek.addEventListener('mousemove', function () {
        const seekDisplay = document.getElementById('seekDisplay');
        if (seekDisplay.style.visibility === 'hidden') seekDisplay.style.visibility = 'visible';

        //Set to to mouse position
        const mousePosX = window.event.clientX;
        const x = mousePosX - (seekDisplay.getBoundingClientRect().width / 2);
        seekDisplay.style.top = this.getBoundingClientRect().y - seekDisplay.getBoundingClientRect().height + 'px';
        seekDisplay.style.left = x + 'px';
        //Set content to current time in video

        //Get mouse percentage of the seek bar
        const mousePercentage = Math.round((mousePosX - this.getBoundingClientRect().x) / this.getBoundingClientRect().width * 1000) / 1000;
        const video = document.getElementById('v');
        const time = video.duration * mousePercentage;
        seekDisplay.innerHTML = getVideoTime(time);


    });
    timeSeek.addEventListener('mouseout', () => document.getElementById('seekDisplay').style.visibility = 'hidden');
}
function draw(v, bc, tick) {
    if (v.paused || v.ended) return false;
    // First, draw it into the backing canvas
    tick++;
    bc.drawImage(v, 0, 0, settings.w, settings.h);
    settings.w = Math.floor(settings.h * (v.clientWidth / v.clientHeight));
    const idata = bc.getImageData(0, 0, settings.w, settings.h);
    const data = idata.data;
    let pixelData = getPixelData(data);
    let pixels = pixelData.pixels;
    if(settings.autoAdjustBrightness && tick%2==0){
        adjustBrightness(pixelData.frameTotalBrightnessData);
        tick = 0;
    }

    if (settings.useColor)
        drawInColor(pixels);
    else
        drawInNumbers(pixels);
    setTimeout(() => {
        draw(v, bc, tick);
    }, 1000 / settings.frameRate);
}
/**
 * Extracts the pixel data from an canvas image
 * @param {ImageData} data - The image data from a canvas 
 * @returns A matrix of pixels
 */
function getPixelData(data) {
    pixels = [];
    let frameTotalBrightnessData = 0;
    for (let hPixel = 0; hPixel < settings.h; hPixel++) {
        pixels[hPixel] = pixels[hPixel] || [];
        for (let wPixel = 0; wPixel < settings.w; wPixel++) {
            const index = (hPixel * settings.w + wPixel) * 4;
            let brightness = (3 * data[index] + 4 * data[index + 1] + data[index + 2]) >>> 3;
            frameTotalBrightnessData += brightness;
            pixels[hPixel][wPixel] = {
                R: data[index],
                G: data[index + 1],
                B: data[index + 2],
                brightness: brightness
            };
        }
    }
    return {pixels:pixels,frameTotalBrightnessData:frameTotalBrightnessData};
}
function drawInNumbers(pixels) {
    //Get the element
    const textRender = document.getElementById('textRender');

    const text = getText(pixels);

    textRender.innerHTML = text;
}
function getText(pixels, type) {
    let text = "";
    let frameData = [];
    //Loop through the pixels matrix
    for (let hPixel = 0; hPixel < pixels.length; hPixel++) {
        for (let wPixel = 0; wPixel < pixels[hPixel].length; wPixel++) {
            //Get char from brightness
            let char = getChar(pixels[hPixel][wPixel].brightness);
            text += char;
            frameData.push(char);
        }
        text += "\n";
        frameData.push("\n");
    }
    currentFrameData = frameData;
    return text;
}
function getChar(brightness) {
    //Map brightness to a char
    let chars = ["&nbsp;", ".", ",", "+", "%", "#", "0", "$", "@"];
    // chars = ["⠄","⠈","⣿"]
    if (settings.invertedColor) chars = chars.reverse();
    //Check if the brightness is min or max
    if (brightness >= 255) return chars[chars.length - 1];
    //If brightness is near max reduce the brightness
    if (brightness > settings.brightnessThreshold) brightness *= settings.brightnessThresholdFactor;
    brightness *= settings.brightness;
    if (brightness >= 255) return chars[chars.length - 1];

    if (brightness <= 0) return chars[0];
    //Map brightness to a char
    const index = Math.floor(brightness / 256 * chars.length);
    return chars[index];
}
function setCorrectWidth() {
    const width = pixels[0].length * settings.fontSize;
    const height = pixels.length * settings.fontSize;
    const textRender = document.getElementById('textRender');
    const videoControlls = document.getElementById('video-seek-container');
    const colorCanvas = document.getElementById('color-canvas');
    colorCanvas.style.width = width + 'px';
    colorCanvas.style.height = height + 'px';
    textRender.style.width = width + 'px';
    textRender.style.height = height + 'px';
    videoControlls.style.width = width + 'px';

}
function adjustBrightness(frameTotalBrightnessData) {
    // Depending on the average brightness and aggresivity adjust the brightness
    // Change the brightness by the aggresivity, high aggresivity = high correction, low aggresivity = low correction
    let brightness =1- ((frameTotalBrightnessData / (settings.w * settings.h) / 255 -0.3 ) * settings.autoAdjustAgresivity);
    
    //Set the brightness to the settings
    settings.brightness = brightness;
    const brightnessReduction = document.getElementById('brightnessReduction');
    brightnessReduction.value = brightness;
    document.getElementById('brightnessValue').innerHTML = Math.round(settings.brightness * 100) + '%';
}
function changeVideoSize(value) {
    settings.size = 66.5/value;
    settings.fontSize = 7 * settings.size;
    //Change css variables
    document.documentElement.style.setProperty('--font-size', settings.fontSize + 'px');
    const video = document.getElementById('v');
    v.pause();
    settings.isPlaying = false;
    setTimeout(() => {
        video.play();
        updateLabel("sizeValue");

        setCorrectWidth();
    }, 75);

}
function displayVideoTime() {
    const video = document.getElementById('v');
    const time = document.getElementById('time');
    const timeLine = document.getElementById('videoSeek');
    //Timeline in milliseconds
    timeLine.max = video.duration * 1000;
    timeLine.value = video.currentTime * 1000;
    time.innerHTML = getVideoTime(video.currentTime) + ' / ' + ((video.duration) ? getVideoTime(video.duration) : '--:--');
    setTimeout(() => {
        displayVideoTime();
    }, 100);
}
function getVideoTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time - minutes * 60);
    return ((minutes < 10) ? "0" + minutes : minutes) + ":" + ((seconds < 10) ? "0" + seconds : seconds);
}
function seekInVideo() {
    const video = document.getElementById('v');
    const timeLine = document.getElementById('videoSeek');
    video.currentTime = timeLine.value / 1000;
}
function changeVideo(input) {
    //Check if the file is a video
    if (input[0].type.indexOf('video') === -1) {
        alert('Please select a video');
        return;
    }
    settings.isPlaying = false;
    //Add the video to the video element
    const video = document.getElementById('v');
    if (video.isPlaying)
        video.stop()
    video.src = URL.createObjectURL(input[0]);
    video.volume = document.getElementById('volume').value;
    video.play();
    updateLabel("sizeValue");
    setTimeout(() => {
        changeVideoSize(document.getElementById('size').value);
    }, 75);

}
function drawInColor(pixelData) {
    const colorCanvas = document.getElementById('color-canvas');
    const ctx = colorCanvas.getContext('2d', { alpha: false });
    ctx.clearRect(0, 0, colorCanvas.width, colorCanvas.height);
    //Set the canvas size
    if (pixelData[0].length * settings.fontSize != colorCanvas.width || pixelData.length * settings.fontSize != colorCanvas.height) {
        colorCanvas.width = pixelData[0].length * settings.fontSize;
        colorCanvas.height = pixelData.length * settings.fontSize;
        //Increase canvas performance
        ctx.imageSmoothingEnabled = false;
    }
    //Draw the text on the canvas
    ctx.font = `${settings.fontSize}px square`;
    for (let hPixel = 0; hPixel < pixelData.length; hPixel++) {
        for (let wPixel = 0; wPixel < pixelData[hPixel].length; wPixel++) {
            const pixel = pixelData[hPixel][wPixel];
            ctx.fillStyle = `rgb(${pixel.R},${pixel.G},${pixel.B})`;
            let char = getChar(pixel.brightness);
            if (char == "&nbsp;") char = " ";
            ctx.fillText(char, wPixel * settings.fontSize, hPixel * settings.fontSize);
        }
    }
}
function copyText() {
    let text = "Made with Ascii video player by Bernster01 - https://bernster01.github.io/ASCII-video-player/\n\n";
    for (let i = 0; i < currentFrameData.length; i++) {
        text += currentFrameData[i];
    }
    const dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text;
    //Cahnge "&nbsp;" to " "
    // chars = ["⠄","⠈","⣿"]
    dummy.value = dummy.value.replace(/&nbsp;/g, " ");;
    //add a new line at the end
    dummy.value += "\n";
    dummy.value += "Made with Ascii video player by Bernster01 - https://bernster01.github.io/ASCII-video-player/"
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}
async function downloadAsciiVideo() {
    const video = document.getElementById('v');
    console.log("Extracting frames...");
    // Extract frames from video to pixel data
    const videoData = await extractFrames(video);
    console.log(videoData)
    console.log("Rendering frames...");
    let data = [];
    for (let i = 0; i < videoData.length; i++) {
        //draw the frame in ascii
        data.push(drawInAscii(videoData[i].data.pixels));
        console.log("Rendered frame " + i + " of " + videoData.length + " in "+data[i].time+" ms");
    }
    console.log("Creating encoder...");
    //Convert the images to a video
    const encoder = new Whammy.Video(settings.frameRate);
    console.log("Adding frames to encoder...");
    for (let i = 0; i < data.length; i++) {
        encoder.add(data[i].data);
    }
    console.log("Encoding video...");
    // Extract audio from video and compile video frames in parallel
    const [output] = await Promise.all([
        new Promise(resolve => {
            encoder.compile(false, result => {
                resolve(result);
            });
        })
    ]);
    // Output the combinedBlob to the console
    console.log("Creating video element...")
    let videoPlayer = document.createElement("video");
    videoPlayer.src = URL.createObjectURL(new Blob([output], { type: "video/webm" }));
    videoPlayer.controls = true;
    videoPlayer.autoplay = true;
    videoPlayer.loop = true;
    document.body.appendChild(videoPlayer);
    console.log("Done!");
}

function drawInAscii(pixelData) {
    const startTimer = new Date().getTime(); 
    //Create the canvas
    const asciiCanvas = document.createElement('canvas');

    const ctx = asciiCanvas.getContext('2d', { alpha: false, willReadFrequently: true });
    //Set the canvas size
    if (pixelData[0].length * settings.fontSize != asciiCanvas.width || pixelData.length * settings.fontSize != asciiCanvas.height) {
        asciiCanvas.width = pixelData[0].length * settings.fontSize;
        asciiCanvas.height = pixelData.length * settings.fontSize;
        //Increase canvas performance
        ctx.imageSmoothingEnabled = false;
    }
    //Draw the text on the canvas

    ctx.font = `${settings.fontSize}px square`;
    for (let hPixel = 0; hPixel < pixelData.length; hPixel++) {
        for (let wPixel = 0; wPixel < pixelData[hPixel].length; wPixel++) {
            const pixel = pixelData[hPixel][wPixel];
            ctx.fillStyle = `white`;
            if(settings.useColor)
                ctx.fillStyle = `rgb(${pixel.R},${pixel.G},${pixel.B})`;
            let char = getChar(pixel.brightness);
            if (char == "&nbsp;") char = " ";
            ctx.fillText(char, wPixel * settings.fontSize, hPixel * settings.fontSize);
        }
    }
    const time = new Date().getTime() - startTimer;
    return {data:asciiCanvas.toDataURL("image/webp"),time:time};
}
async function extractFrames(video) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: false, willReadFrequently: true });
    const cw = Math.floor(video.clientWidth);
    const ch = Math.floor(video.clientHeight);
    canvas.width = cw;
    canvas.height = ch;
    const frames = [];
    let img;
    let time = 0;
    const interval = 1000 / settings.frameRate;

    let duration = video.duration * settings.frameRate;
    console.log("Total Frames: " + Math.floor(duration));
    //Get all the frames from the video
    for (let i = 0; i < duration; i++) {
        img = await getFrame(video, ctx, i * interval, i);
        frames.push(img);
    }
    //sort the frames
    frames.sort((a, b) => {
        return a.frameNumber - b.frameNumber;
    });
    return frames;
}
function getFrame(video, ctx, seekTo, frameNumber) {
    //Get the frame from the video in base64
    return new Promise((resolve, reject) => {
        video.currentTime = seekTo / 1000;
        video.addEventListener('seeked', () => {
            ctx.drawImage(video, 0, 0, settings.w, settings.h);
            let idata = ctx.getImageData(0, 0, settings.w, settings.h);
            let data = idata.data;
            resolve({ data: getPixelData(data), frameNumber: frameNumber });
        }, { once: true });
    });


}
document.addEventListener("DOMContentLoaded", starterFunction);