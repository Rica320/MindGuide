import AWS from 'aws-sdk';

export const usePolly = process.env.REACT_APP_USE_POLLY === "true";

let Polly;
let audio;

if (usePolly) {
    AWS.config.update({
        region: 'eu-central-1',
        accessKeyId: process.env.REACT_APP_AWS_POLLY_ACCESS_KEY_ID,
        secretAccessKey: process.env.REACT_APP_AWS_POLLY_SECRET_ACCESS_KEY,
      });
    
    Polly = new AWS.Polly();
}

export function stopSpeaking() {
    if (audio) {
        audio.pause();
        audio.currentTime = audio.duration;
        audio = null;
    }
}

export function speakText(text, outputFormat = 'mp3', voiceId = 'Ruth', engine='generative') {
    if (!usePolly) {
        console.log("polly is not available");
        return;
    }

    return new Promise((resolve, reject) => {
        const params = {
            'Text': text,
            'OutputFormat': outputFormat,
            'VoiceId': voiceId,
            'Engine': engine
        };

        Polly.synthesizeSpeech(params, (err, data) => {
            if (err) {
                console.log("Error detected: " + err.code + "\n" + err.stack + "\n" + err.message);
                reject(err);
            } else if (data && data.AudioStream) {
                // Converti il buffer dello stream in un Blob
                const audioBlob = new Blob([data.AudioStream], { type: 'audio/mpeg' });

                // Crea un URL temporaneo per il Blob
                const audioUrl = URL.createObjectURL(audioBlob);

                // Riproduci l'audio usando l'oggetto Audio
                audio = new Audio(audioUrl);
                audio.play();

                // Rilascia l'URL temporaneo al termine dell'audio per risparmiare memoria
                audio.onended = () => {
                    URL.revokeObjectURL(audioUrl);
                    resolve(); // Risolvi la promessa quando l'audio termina
                };

                // In caso di errore durante la riproduzione dell'audio
                audio.onerror = (error) => {
                    URL.revokeObjectURL(audioUrl);
                    reject(error); // Rifiuta la promessa in caso di errore
                };
            } else {
                reject(new Error("No audio stream received from Polly"));
            }
        });
    });
}
