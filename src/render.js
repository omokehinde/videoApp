
// buttons
// This did not work on windows
// const videoElement = document.querySelector('video');
// const startBtn = document.querySelector('startBtn');
// const stopBtn = document.querySelector('stopBtn');
// const videoSelectBtn = document.querySelector('videoSelectBtn'); 
const videoElement = document.getElementById('video');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const videoSelectBtn = document.getElementById('videoSelectBtn');

const { desktopCapturer, remote, dialog } = require('electron');
const { constants, writeFile } = require('fs');
const { Menu } = remote;

videoSelectBtn.onclick = getVideoSource; //I do not know why this didn't work
// Get the available Video sources
async function getVideoSource() {
    const inputSources = await desktopCapturer.getSources({
        types: ['window', 'screen']
    });

    const videoOptionsMenu = Menu.buildFromTemplate(
        inputSources.map(source => {
            return {
                label: source.name,
                click: () => selectSource(source)
            };
        })
    );

    videoOptionsMenu.popup();
}

let mediaRecorder;
const recordedChunks = [];

// change the video source to record 
async function selectSource(source) {
    videoSelectBtn.innerText = source.name;

    const constraints = {
        audio: false,
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
            }
        }
    };
    // create a stream 
    const stream = await navigator.mediaDevices
                    .getUserMedia(constants);

    // preview the source in a video element
    videoElement.srcObject = stream;
    videoElement.play();
    // create the media recorder 
    const options = { mimeType: 'video/webm; codecs=vp9' };
    mediaRecorder = new MediaRecorder(stream, options);
    // Register Event Handler
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop; 
}
// captures all recorded chunks 
function handleDataAvailable(e) {
    console.log('video data available');
    recordedChunks.push(e.data);
    
}
// saves the video on stop
async function handleStop(e) {
    const blob = new Blob(recordedChunks, {
        type: 'video/webm; codecs=vp9'
    });

    const buffer = Buffer.from(await blob.arrayBuffer());
    const { filepath } = await dialog.showSaveDialog({
        buttonLabel: 'Save video',
        defaultPath: `vid-${Date.now()}.webm`
    });

    console.log(filepath);

    writeFile(filepath, buffer, ()=> console.log('video saved successfully')
    );
    
}