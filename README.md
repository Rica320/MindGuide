# Chat Application with Generative AI

This is a Rails application that provides an interactive chat interface using a generative AI client. The application captures user inputs, processes them, and generates responses with emotional context.

## Key Features

- **Chat Interaction**: Users can interact with the application through a chat interface.
- **Generative AI Integration**: The application uses a generative AI client to generate content based on user inputs.
- **Emotion Handling**: The application supports various emotional types to add emotional context to the generated responses.
- **Error Handling**: The application includes error handling for scenarios such as missing configuration files and invalid JSON responses.

## Setup Instructions

### Prerequisites

- Ruby (version 2.7.2 or later)
- Rails (version 6.1 or later)
- Bundler

### Installation

1. **Clone the repository**:
    ```sh
    git clone https://github.com/y1220/mindGuideFE.git
    cd mindGuideFE
    ```
2. **Install dependencies**:
    ```sh
    bundle install
    ```
3. **Set up environment variables**:
    Create a `.env` file in the root directory of your project and add your environment variables. For example:
    ```sh
    GOOGLE_API_KEY=your_google_api_key_here
    ```
4. **Start the Rails server**:
    ```sh
    rails server
    ```

## Usage

### Chat Interaction

- **Navigate to the chat interface**: Go to the chat page in your application.
- **Enter your prompt**: Type your message or use voice input to interact with the chat interface.
- **Receive AI-generated responses**: The application will process your input and generate a response with emotional context.
