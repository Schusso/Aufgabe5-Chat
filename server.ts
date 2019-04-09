const express = require('express');
const file = require('file-system');
const fs = require('fs');
const cors = require('cors');
const fluent_ffmpeg = require('fluent-ffmpeg');
let mergedVideo = fluent_ffmpeg();
const multer = require("multer");
const path = require('path');
import * as http from "http";
import * as WebSocket from "ws";


const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, 'uploads/')

    },

    filename(req, file, callback): void {

        callback(null, file.originalname);

    }

});

const upload = multer({storage: storage});

const gm = require("gm").subClass({

    imageMagick: true

});
const content = [];
const app = express();

app.use(cors());

//Sinlge Image Upload
app.post('/upload/files/optimize', upload.single('file'), (req, res) => {
    gm(req.file.path)

        .resize(720)

        .write('uploads/small_' + req.file.filename, (err) => {

            console.log(err);

        });

    gm(req.file.path)

        .resize(1280)

        .write('uploads/medium_' + req.file.filename, (err) => {

            console.log(err);

        });

    gm(req.file.path)

        .resize(2044)

        .write('uploads/big_' + req.file.filename, (err) => {

            console.log(err);

        });

    res.status(200).json({success: true});

});
// Multiple Image Uploads
app.post('/upload/files/multiple/optimize', upload.single('file'), (req, res) => {
        gm(req.file.path)

            .resize(720)

            .write('uploads/small_' + req.file.filename, (err) => {

                console.log(err);

            });

        gm(req.file.path)

            .resize(1280)

            .write('uploads/medium_' + req.file.filename, (err) => {

                console.log(err);

            });

        gm(req.file.path)

            .resize(2044)

            .write('uploads/big_' + req.file.filename, (err) => {

                console.log(err);

            });

        res.status(200).json({success: true});


});
const storage2 = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, 'upload/videos/result')

    },

    filename(req, file, callback): void {

        callback(null, file.originalname);

    }

});

const upload2 = multer({storage: storage2});

// Video Upload
app.post('/api/videos', upload2.single('file'), function (req, res) {
    res.status(200).json({succsess: true});
});


// Video Merge
app.get('/api/videos/merge', (req, res) => {
    const source = fs.readdirSync('./upload/videos/result/');
    source.forEach(function(element) {
        const pathJoin = path.join('upload', 'videos', 'result');
        const finalPath = __dirname + '\\' + pathJoin + '\\' + element;
        mergedVideo = mergedVideo.addInput(finalPath);
    });

    mergedVideo.mergeToFile('./upload/videos/zusammengefügt.mp4', '/upload/videos/tempDir/')
        .on('error', function(err) {
            console.log('Error ' + err.message);
        })
        .on('end', function() {
            console.log('Done.');
        });
    res.send('done.');
});
// Audio Sotrage deklaration
const storage3 = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, 'upload/audio/')

    },

    filename(req, file, callback): void {

        callback(null, file.originalname);

    }

});

const upload3 = multer({storage: storage3});

//Audio upload
app.post('/api/audio', upload3.single('file'), (req, res) => {

    res.json({
        audio: __dirname + '/upload/audio/Modul152.mp3',
        vtt: __dirname + '/upload/audio/Subtitle.vtt'
    });


    res.status(200).json({success: true});

});

//Webchat
const server = http.createServer(app);
const wss = new WebSocket.Server({server});

interface ExtWebSocket extends WebSocket {
    isAlive: boolean;
}
function createMessage(content: string, isBroadcast = false, sender = 'NS'): string {
    return JSON.stringify(new Message(content, isBroadcast, sender));
}

export class Message {
    constructor(
        public content: string,
        public isBroadcast = false,
        public sender: string
    ) { }
}

wss.on('connection', (ws: WebSocket) => {

    const extWs = ws as ExtWebSocket;

    extWs.isAlive = true;

    ws.on('pong', () => {
        extWs.isAlive = true;
    });

    //connection is up, let's add a simple simple event
    ws.on('message', (msg: string) => {

        const message = JSON.parse(msg) as Message;

        setTimeout(() => {
            if (message.isBroadcast) {

                //send back the message to the other clients
                wss.clients
                    .forEach(client => {
                        if (client != ws) {
                            client.send(createMessage(message.content, true, message.sender));
                        }
                    });

            }

            ws.send(createMessage(`You sent -> ${message.content}`, message.isBroadcast));

        }, 1000);

    });

    //send immediatly a feedback to the incoming connection
    ws.send(createMessage('Hi there, I am a WebSocket server'));

    ws.on('error', (err) => {
        console.warn(`Client disconnected - reason: ${err}`);
    })
});

setInterval(() => {
    wss.clients.forEach((ws: WebSocket) => {

        const extWs = ws as ExtWebSocket;

        if (!extWs.isAlive) return ws.terminate();

        extWs.isAlive = false;
        ws.ping(null, undefined);
    });
}, 10000);


// Anzeigen
app.use(express.static('uploads'));
app.use(express.static('dist/M152-Projekt-Frontend'));
app.use(express.static('upload/videos'));
app.use(express.static('upload/audio'));


//Ausgabe Images
app.get('/upload/files', function (req, res) {
    fs.readdir('uploads', function (err, images) {
        res.json({files: images});
    });
});
app.get('/upload/audio', function (req, res) {
    fs.readdir('uploads', function (err, audio) {
        res.json({files: audio});
    });
});
app.get('*', (req, res) => {
    res.sendFile(__dirname + '/dist//M152-Projekt-Frontend/index.html');
});

app.listen(process.env.PORT || 4000, function () {

    console.log('Your node js server is running');

});
