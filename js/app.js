let pixels = [];
    let size = 2;
    let isPlaying = false;
    let invertedColor = false;
    let sourceSize = {
        width: 300,
        height: 150
    };
    let w;
    let h;
    let frameRate = 30;
    function starterFunction() {
        //Enter fullscreen

        let file = document.getElementById('file');
        let volumeControl = document.getElementById('volume');
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
            if (isPlaying) this.style.opacity = 0.25;
        });
        file.addEventListener('change', function () {
            let elem = document.documentElement;
            let files = this.files;
            isPlaying = false;
            //Add the video to the video element
            let video = document.getElementById('v');
            // Remove the width and height attributes
            video.removeAttribute('width');
            video.removeAttribute('height');
        
            
            
            if (video.isPlaying) {
                video.stop()
            }
            video.src = URL.createObjectURL(files[0]);
            video.volume = volumeControl.value;
            video.play();
        });
        let playPause = document.getElementById('play-pause');
        playPause.addEventListener('click', function () {
            let video = document.getElementById('v');
            if (video.paused) {
                video.play();
                document.getElementById('controller').style.opacity = 0.25;
            } else {
                video.pause();
                document.getElementById('controller').style.opacity = 1;
            }
        });
        volumeControl.addEventListener('mousemove', function () {
            let video = document.getElementById('v');
            video.volume = this.value;
        });
        volumeControl.addEventListener('change', function () {
            let video = document.getElementById('v');
            video.volume = this.value;
        });
        let frameRateControl = document.getElementById('frameRate');
        frameRateControl.addEventListener('input', function () {
            frameRate = this.value;
        });
        frameRateControl.addEventListener('dblclick', function () {
            this.value = 30;
            frameRate = 30;
        });
        let v = document.getElementById('v');
        let back = document.createElement('canvas');
        let backcontext = back.getContext('2d', {
            willReadFrequently: true
        });
        let cw, ch;
        let sizeControl = document.getElementById('size');
        sizeControl.addEventListener('change', function () {
            changeVideoSize(this.value,back);
        });
        v.addEventListener('play', function () {
            if (!isPlaying) {
                cw = back.width = sourceSize.width/size;
                ch = back.height = sourceSize.height/size;
                isPlaying = true;
                w = cw;
                h = ch;
            }
            document.getElementById('textRender').style.width = cw + 'px';
            document.getElementById('textRender').style.height = cw + 'px';
            document.getElementById('controller').style.opacity = 0;
            // document.getElementById('textRender').style.height = ch + 'px';
            
            draw(this, backcontext);
            console.log(v.videoHeight,v.height,v.clientHeight);
            setCorrectWidth();
            console.log(v.videoHeight,v.height,v.clientHeight);
        }, false);
        document.getElementById('invertColor').addEventListener('change', function () {
            if (this.checked) invertedColor = true; else invertedColor = false;
        });

    }
    function draw(v, bc) {
        if (v.paused || v.ended) return false;
        bc.drawImage(v, 0, 0, w, h);
        let idata = bc.getImageData(0, 0, w, h);
        let data = idata.data;
        pixels = [];
        for (let i = 0; i < h; i++) {
            pixels[i] = pixels[i] || [];
            for (let j = 0; j < w; j++) {
                let index = (i * w + j) * 4;
                let r = data[index];
                let g = data[index + 1];
                let b = data[index + 2];
                let a = data[index + 3];
                let brightness = (3*r + 4*g + b) >>> 3;
                
                pixels[i][j] = brightness;
            }
        }


        drawInNumbers(w);
        setTimeout(() => {
            draw(v, bc);
        }, 1000 / frameRate);
    }
    function drawInNumbers(width) {
        //Shrink the pixels array to 1/4 of its size 

        let textRender = document.getElementById('textRender');
        //Draw the pixels as plain text
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
        //Map brightness to a char from brightest to darkest let chars = [".","~","#","&","@","$","%","*","!",";"];
        let chars = ["&nbsp;", ".", ",", "+", "#", "&#x25A1;", "0", "$", "@"];
        if (invertedColor) chars = chars.reverse();
        if (brightness > 230) brightness *= 0.9;
        if (brightness <= 0) return chars[0];
        if (brightness >= 255) return chars[chars.length - 1];

        let index = Math.floor(brightness / 256 * chars.length);
        return chars[index];
    }
    function setCorrectWidth() {
        let pixelCount = pixels[0].length;
        let width = pixelCount * 3.86;
        document.getElementById('textRender').style.width = width + 'px';
        document.getElementById('textRender').style.height = width*1.12 + 'px';
    }
    function changeVideoSize(value,c){
        let sizes = ["4","2","1"];
        size = sizes[value-1];
        let video = document.getElementById('v');
        v.pause();
        isPlaying = false;
        setTimeout(() => {
            video.play();
        }, 75);

    }
    document.addEventListener("DOMContentLoaded", starterFunction);