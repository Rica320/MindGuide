import boto3
from playsound import playsound

# Configuration of the credentials and the client
polly_client = boto3.Session(
                aws_access_key_id='YOUR_ACCESS_KEY',
                aws_secret_access_key='YOUR_SECRET_ACCESS_KEY',
                region_name='eu-central-1').client('polly')

# Text to synthesize
text = "Hello! I am Mindguide, your personal assistant for the care of your mental well-being."

# Synthesizing the text
response = polly_client.synthesize_speech(
    #VoiceId='Ruth',                # female English voice
    VoiceId='Matthew',              # Male English voice
    OutputFormat='mp3',              # Format of the output audio
    Text=text,
    Engine='generative',                # Engine for the synthesis
)
# Save the audio
with open('speech.mp3', 'wb') as file:
    file.write(response['AudioStream'].read())

# Play the audio
playsound('speech.mp3')


print("Audio salvato con successo come speech.mp3")
