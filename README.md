# MindGuide🍄
Empowered by large language models, MindGuide can simulate a live group therapy session.

## Setup
1. **Run**
    ```bash
    git clone https://github.com/Rica320/MindGuide.git
    cd MindGuide/mindguide
    npm install
    ```

2. **Create a `.env` file with:**
    ```
    REACT_APP_MICROSOFT_SPEECH_KEY=your_speech_key
    REACT_APP_MICROSOFT_SPEECH_REGION=your_speech_region

    REACT_APP_OPENAI_KEY=your_openai_api_key
    REACT_APP_OPENAI_MODEL=openai_model

    # only to use polly for speech synthesize
    REACT_APP_USE_POLLY = true
    REACT_APP_AWS_POLLY_ACCESS_KEY_ID = your_aws_polly_key
    REACT_APP_AWS_POLLY_SECRET_ACCESS_KEY = your_aws_polly_secret
    ```
    
3. **Start the Development Server for running App**
    ```
    npm start
    ```
    
5. **Run the Backend Server for logging (optional)**
    ```
    node server.js
    ```

## Prequisites
- Node.js (v18.x or higher)
- npm (v9.x or higher)
- Git

## Roles
MindGuide can participate in the sessions acting as the following roles:
- **moderator:** mostly passive and more focused on controlling the session
- **empathic:** provides empathic responses in addition to moderating the conversation
- **peer:** more involved in the conversation than the other two options and provides suggestions as an additional peer
