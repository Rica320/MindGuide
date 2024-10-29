import azure.cognitiveservices.speech as speechsdk
from playsound import playsound


def text_to_speech(text):
    # key and region
    speech_key = "YOUR_KEY"
    service_region = "germanywestcentral"

    # configuration of the service
    speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=service_region)

    # configuration of the voice
    #female voice
    #speech_config.speech_synthesis_voice_name = "en-US-CoraNeural"

    #male voice
    speech_config.speech_synthesis_voice_name = "en-GB-RyanNeural"

    # Configuration of the audio output
    audio_config = speechsdk.audio.AudioOutputConfig(filename="outputAudio.wav")  # Salva il file come .wav

    # creating the synthesizer
    synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config, audio_config=audio_config)

    # Synthesizing the text
    result = synthesizer.speak_text_async(text).get()

    # Check the result
    if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
        print("Sintesi vocale completata.")
    else:
        print("Errore durante la sintesi vocale: {}".format(result.reason))


# example
text_to_speech("Hello! I am Mindguide, your personal assistant for the care of your mental well-being.")

# play the audio
playsound('outputAudio.wav')