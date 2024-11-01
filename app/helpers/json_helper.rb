module JsonHelper
  def valid_json?(json_string)
    begin
      ActiveSupport::JSON.decode(json_string)
      true
    rescue JSON::ParserError => e
      puts "Failed to parse JSON: #{e.message}"
      false
    end
  end
end
