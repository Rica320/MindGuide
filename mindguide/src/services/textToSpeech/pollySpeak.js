// const AWS = require('aws-sdk')
// const Speaker = require('speaker')

// const Polly = new AWS.Polly({
//     signatureVersion: 'v4',
//     region: 'us-east-1',
//     accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY
// })

// const Player = new Speaker({
//     channels: 1,
//     bitDepth: 16,
//     sampleRate: 16000
// })


// export function speakText(text, outputFormat = 'mp3', voiceId = 'Kimberly') {
//     let params = {
//         'Text': text,
//         'OutputFormat': outputFormat,
//         'VoiceId': voiceId
//     }

//     Polly.synthesizeSpeech(params, (err, data) => {
//         if (err) {
//             console.log(err.code)
//         } else if (data) {
//             if (data.AudioStream instanceof Buffer) {
                
//                 var bufferStream = new Stream.PassThrough()
//                 bufferStream.end(data.AudioStream)
//                 bufferStream.pipe(Player)
//             }
//         }
//     })
// }