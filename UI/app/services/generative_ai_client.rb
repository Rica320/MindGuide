require 'httparty'
require 'json'

class GenerativeAiClient
  include HTTParty

  base_uri 'https://generativelanguage.googleapis.com/v1beta'

  def initialize(api_key = ENV['GOOGLE_API_KEY'])
    @api_key = api_key
    @headers = { 'Content-Type' => 'application/json' }
  end

  def generate_content(prompt)
    endpoint = "/models/gemini-1.0-pro:generateContent?key=#{@api_key}"
    body = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    }.to_json

    response = self.class.post(endpoint, headers: @headers, body: body)

    if response.success?
      JSON.parse(response.body)
    else
      Rails.logger.error "API request failed: #{response.body}"
      nil
    end
  end
end
