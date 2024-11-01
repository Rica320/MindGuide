require "test_helper"

class ChatControllerTest < ActionDispatch::IntegrationTest
  test "should get home" do
    get chat_home_url
    assert_response :success
  end
end
