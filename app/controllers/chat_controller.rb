require 'active_support/json'

class ChatController < ApplicationController
  include JsonHelper
  skip_before_action :verify_authenticity_token, only: :chat

  def home
    @chat_response = "Click the button below to start chatting!"
    if params[:chat_response].present?
      @chat_response = params[:chat_response]
    end
    if params[:voice_input].present?
      @voice = params[:voice_input]
    end
    if params[:emotional_type].present?
      @emotional_type = params[:emotional_type]
    end
  end

  def planet
    @chat_response = "Click the button below to start chatting!"
    if params[:chat_response].present?
      @chat_response = params[:chat_response]
    end
    if params[:voice_input].present?
      @voice = params[:voice_input]
    end
    if params[:emotional_type].present?
      @emotional_type = params[:emotional_type]
    end
  end

  def chat
    emotion = params[:emotion]
    voice = params[:voice_input]
    custom_ui = params[:custom_ui]
    unless emotion.present?
      render json: { error: 'Emotion label is required' }, status: :bad_request
      return
    end

    file_path = Rails.root.join('app', 'assets', 'config', 'animated_emoji_description.json')
    unless File.exist?(file_path)
      render json: { error: 'Configuration file not found' }, status: :internal_server_error
      return
    end
    valid_emotions = ['smile', 'smile_with_big_eyes', 'grin', 'laughing', 'joy', 'star_struck',
              'kissing_heart', 'kissing', 'kissing_smiling_eyes', 'partying_face', 'Pleading',
              'thinking_face', 'zipper_mouth', 'screeming', 'rage', 'sweat', 'surprised',
              'scrunched_mouth', 'mind_blown', 'cry', 'yawn']

    prompt = "Can you reply to message with Json object format,
       containing followings,
       {\"response\": reply to my question or ask a question to continue our conversation, \"emotional_type\": emotion type name among
       #{valid_emotions} },
       for the given sentence and please answer concisely: '#{voice}'"
    response = GenerativeAiClient.new.generate_content(prompt)
    response_text = nil
    if response
      content_text = response.dig("candidates", 0, "content", "parts", 0, "text")
      if content_text && valid_json?(content_text)
        response_data = ActiveSupport::JSON.decode(content_text)
        response_text = response_data['response']
        emotional_type = response_data['emotional_type']
        unless valid_emotions.include?(emotional_type)
          emotional_type = "zipper_mouth"
        end
      else
        response_text = "Invalid JSON response"
        emotional_type = "zipper_mouth"
      end
    else
      response_text = "Failed to generate content"
      emotional_type = "zipper_mouth"
    end
    description = response_text
    # file = File.read(file_path)
    # emoji_descriptions = JSON.parse(file)
    # description = emoji_descriptions[emotion]['description']
    action = custom_ui.presence || 'home'
    if description
      redirect_to action: action, chat_response: description, voice_input: voice, emotional_type: emotional_type
    else
      render json: { error: 'Emotion label not found' }, status: :not_found
    end
  end
end
