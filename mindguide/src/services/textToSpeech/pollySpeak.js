import AWS from 'aws-sdk';

AWS.config.update({
    region: 'eu-central-1',
    accessKeyId: process.env.REACT_APP_AWS_POLLY_ACCESS_KEY_ID,
    secretAccessKey: process.env.REACT_APP_AWS_POLLY_SECRET_ACCESS_KEY,
  });

 const Polly = new AWS.Polly();
 //const Player = new Speaker({
 //    channels: 1,
 //    bitDepth: 16,
 //    sampleRate: 16000
 //})


 export function speakText(text, outputFormat = 'mp3', voiceId = 'Ruth', engine='generative') {

    //const audioRef = useRef(null);  // Define the audioRef here

     let params = {
         'Text': text,
         'OutputFormat': outputFormat,
         'VoiceId': voiceId,
         'Engine': engine
     }

     Polly.synthesizeSpeech(params, (err, data) => {
         if (err) {
             console.log("Error detected: " + err.code + "\n" + err.stack + "\n" + err.message)
         } else if (data && data.AudioStream) {
            
            // Converti il buffer dello stream in un Blob
            const audioBlob = new Blob([data.AudioStream], { type: 'audio/mpeg' });

            // Crea un URL temporaneo per il Blob
            const audioUrl = URL.createObjectURL(audioBlob);

            // Riproduci l'audio usando l'oggetto Audio
            const audio = new Audio(audioUrl);
            audio.play();

            // Rilascia l'URL temporaneo al termine dell'audio per risparmiare memoria
            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
            };
                
            //###
            // var bufferStream = new Stream.PassThrough()
            // bufferStream.end(data.AudioStream)
            // bufferStream.pipe(Player)
                
        }
         
     })
 }