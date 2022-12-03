let pixels = [];
let settings = {
    size: 2,
    frameRate: 30,
    invertedColor: false,
    w: 300,
    h: 150,
    isPlaying: false,
    useCropping: true
};

function starterFunction() {
    //Initialize the app
    addEventListeners();
    displayVideoTime();
    document.getElementById('seekDisplay').style.visibility = 'hidden';
    document.getElementById('adv_settings_switch').classList.add('rotated90');
    document.getElementById('Advanced_Settings').style.height = document.getElementById('Advanced_Settings').offsetHeight + 'px';
    advSettings();
}
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
    const advSettingsSwitch = document.getElementById('adv_settings_switch');
    const settingsButton = document.getElementById('settingsButton');
    const useCroppingBtn = document.getElementById('useCropping');
    useCroppingBtn.addEventListener('click', () => {
        settings.useCropping = !settings.useCropping;
    });

    settingsButton.addEventListener('click', () => {
        document.getElementById('vcv').classList.toggle('translateSelfLeft');
    });
    advSettingsSwitch.addEventListener('click', function(){
        advSettings();
    });
    // Add event listeners
    //Drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        fileDropVideo.addEventListener(eventName, (e) =>{
            e.preventDefault();
            e.stopPropagation();
        }, false)
      })
    fileDropVideo.addEventListener('dragover', (e) => {});
    fileDropVideo.addEventListener('drop', (e) => {
        changeVideo(e.dataTransfer.files);
    });
    file.addEventListener('change', function () {
        changeVideo(this.files);
    });


    volumeControl.addEventListener('input', function(){document.getElementById('v').volume = this.value});

    playPause.addEventListener('click', function(){
        const video = document.getElementById('v');
        if (video.paused) {
            video.play();
            this.innerHTML = "<i class='fa fa-pause'></i>";
        } else {
            video.pause();
            this.innerHTML = "<i class='fa fa-play'></i>";
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
        playPause.innerHTML = "<i class='fa fa-pause'></i>";
        if (!settings.isPlaying) {
            settings.w = back.width = 300 / settings.size;
            settings.h = back.height = 150 / settings.size;
            settings.isPlaying = true;
        }
        const elem = document.getElementById('textRender');
        elem.style.width = settings.w + 'px';
        elem.style.height = settings.w + 'px';
        

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
    document.getElementById('invertColor').addEventListener('change', function () {
        if (this.checked) settings.invertedColor = true; else settings.invertedColor = false;
    });
    timeSeek.addEventListener('input', seekInVideo);
    timeSeek.addEventListener('mousemove', function () {
        const seekDisplay = document.getElementById('seekDisplay');
        if(seekDisplay.style.visibility === 'hidden') seekDisplay.style.visibility = 'visible';
        
        //Set to to mouse position
        const mousePosX = window.event.clientX;
        const x = mousePosX - (seekDisplay.getBoundingClientRect().width/2);
        seekDisplay.style.top = this.getBoundingClientRect().y-seekDisplay.getBoundingClientRect().height + 'px';
        seekDisplay.style.left = x + 'px';
        //Set content to current time in video

        //Get mouse percentage of the seek bar
        const mousePercentage = Math.round((mousePosX - this.getBoundingClientRect().x) / this.getBoundingClientRect().width * 1000)/1000;
        const video = document.getElementById('v');
        const time = video.duration * mousePercentage;
        seekDisplay.innerHTML = getVideoTime(time);


    });
    timeSeek.addEventListener('mouseout', () => document.getElementById('seekDisplay').style.visibility = 'hidden');
}
function draw(v, bc) {
    if (v.paused || v.ended) return false;
    // First, draw it into the backing canvas
    //Crop video source to fit the canvas
    if(settings.useCropping) {
    let xCrop = 0;
    let yCrop = 0;
    let wCrop = v.videoWidth;
    let hCrop = v.videoHeight;
    if (v.videoWidth > v.videoHeight) {
        xCrop = (v.videoWidth - v.videoHeight) / 2;
        wCrop = v.videoHeight;
    } else if (v.videoHeight > v.videoWidth) {
        yCrop = (v.videoHeight - v.videoWidth) / 2;
        hCrop = v.videoWidth;
    }
    bc.drawImage(v, xCrop, yCrop, wCrop, hCrop, 0, 0, settings.w, settings.h);
    }
    else bc.drawImage(v, 0, 0, settings.w, settings.h);
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
    let chars = ["&nbsp;", ".", ",", "+", "#", "&#x25A1;", "0", "$", "@"];
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
    const videoControlls = document.getElementById('video-seek-container');

    textRender.style.width = width + 'px';
    textRender.style.height = width * heightFactor + 'px';
    videoControlls.style.width = width + 'px';
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
function displayVideoTime(){
    const video = document.getElementById('v');
    const time = document.getElementById('time');
    const timeLine = document.getElementById('videoSeek');
    //Timeline in milliseconds
    timeLine.max = video.duration * 1000;
    timeLine.value = video.currentTime * 1000;
    time.innerHTML = getVideoTime(video.currentTime)+' / '+ ((video.duration)?getVideoTime(video.duration):'--:--');
    setTimeout(() => {
        displayVideoTime();
    }, 100);
}
function getVideoTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time - minutes * 60);
    return ((minutes <10) ? "0" + minutes : minutes) + ":" + ((seconds < 10) ? "0" + seconds : seconds);
}
function seekInVideo(){
    const video = document.getElementById('v');
    const timeLine = document.getElementById('videoSeek');
    video.currentTime = timeLine.value / 1000;
}
function changeVideo(input){
        //Check if the file is a video
        if(input[0].type.indexOf('video') === -1){
            alert('Please select a video');
            return;
        }
        settings.isPlaying = false;
        //Add the video to the video element
        const video = document.getElementById('v');
        // Remove the width and height attributes
        video.removeAttribute('width');
        video.removeAttribute('height');

        if (video.isPlaying) video.stop()

        video.src = URL.createObjectURL(input[0]);
        video.volume = document.getElementById('volume').value;
        video.play();
}
function advSettings(){
    const advSettings = document.getElementById('Advanced_Settings');
    const advSettingsBtn = document.getElementById('adv_settings_switch');
    if(advSettings.classList.contains('height0')){
        advSettings.classList.remove('height0');
        advSettings.style.padding = '1em';
        advSettingsBtn.classList.add('rotated90');
        return;
    }
    advSettings.classList.add('height0');
    advSettings.style.padding = '0em';
    advSettingsBtn.classList.remove('rotated90');
}
document.addEventListener("DOMContentLoaded", starterFunction);