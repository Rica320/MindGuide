class ContentController < ApplicationController
  include JsonHelper
  skip_before_action :verify_authenticity_token, only: :generate

  def generate
    prompt = params[:prompt] || "Write a story about a magic backpack."
    response = GenerativeAiClient.new.generate_content(prompt)
    if response
      content_text = response.dig("candidates", 0, "content", "parts", 0, "text")
      render json: { content: content_text }
    else
      render json: { error: "Failed to generate content" }, status: :unprocessable_entity
    end
  end

  def show_content
    @content = "Once upon a time, there was a magic backpack that could fly."
  end

  def custom_content
    @id = params[:id]
    prompt = generate_prompt
    response = GenerativeAiClient.new.generate_content(prompt)
    if response
      content_text = response.dig("candidates", 0, "content", "parts", 0, "text")
      if content_text && valid_json?(content_text)
        response_data = ActiveSupport::JSON.decode(content_text)
        @summary, @point_of_view, @pick_up = extract_response_data(response_data)
      else
        @summary, @point_of_view, @pick_up = assign_default_values
      end
    else
      @summary, @point_of_view, @pick_up = assign_default_values
    end

    render :custom_content, id: params[:id]
  end

  private

  def generate_prompt
    user =  'user' + params[:id]
    point_of_view_key = "point_of_view_of_#{user}"
    <<-PROMPT
      I have a conversation with my friends about a robotics project,
      {
        "conversation": [
          {"user1": "Hey everyone, did you all check the project requirements for our robotics course?"},
          {"user2": "Yeah, I went through it last night. The hardware list is intense! We need to decide on the components first."},
          {"user3": "I can get the microcontroller and sensors from the lab, but we might need to buy some motors. Do you guys think we should go for the high-torque ones?"},
          {"user4": "I would say yes, better safe than sorry. Our robot will need to handle some weight with all the wiring and components."},
          {"user1": "True, and we don’t want to run into issues halfway through testing. Also, anyone got a handle on the coding side of things? I can help, but I’m not an expert at controlling multiple components."},
          {"user2": "I can take lead on that! I worked on something similar in the IoT project last semester. We can divide tasks—coding, hardware assembly, and documentation."},
          {"user3": "Sounds good. I’ll handle the hardware assembly part. By the way, have you guys started the lab report for Professor Lee’s class?"},
          {"user4": "I was going to do it over the weekend. But now with the robotics project, we might have to split the workload. We’ve got deadlines coming up in three different courses!"},
          {"user1": "I know, it’s crazy. Maybe we can meet up after classes tomorrow? Finish up the robotics part, then get started on the report?"},
          {"user2": "That works. Let’s meet in the library around 3 p.m. I’ll bring my laptop for coding, and we can finalize the parts list too."},
          {"user3": "Perfect! I’ll bring the materials I’ve gathered so far. Let’s try to wrap this up quickly because I’ve got an exam next week."},
          {"user4": "Same here. Engineering life, am I right? Always something to juggle!"}
        ]
      },
      could you give me json object composed by summary, #{point_of_view_key}, and pick_up as keys and their values as arrays of strings?
      summary should contains discussion summary,  #{point_of_view_key} should descrive concerns and thought of #{user}, and pick_up should contain todo list or suggestions for #{user}.
    PROMPT
  end

  def extract_response_data(response_data)
    user_id = params[:id]
    point_of_view_key = "point_of_view_of_user#{user_id}"
    summary = response_data['summary']
    point_of_view = response_data[point_of_view_key]
    pick_up = response_data['pick_up']
    [
      summary.is_a?(Array) ? summary : default_summary,
      point_of_view.is_a?(Array) ? point_of_view : default_point_of_view,
      pick_up.is_a?(Array) ? pick_up : default_pick_up
    ]
  end

  def assign_default_values
    [default_summary, default_point_of_view, default_pick_up]
  end

  def default_summary
    ['summary1', 'summary2', 'summary3']
  end

  def default_point_of_view
    ['point_of_view1', 'point_of_view2', 'point_of_view3']
  end

  def default_pick_up
    ['pick_up_line1', 'pick_up_line2', 'pick_up_line3']
  end
end
