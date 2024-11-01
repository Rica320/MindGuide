Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html
  root "chat#home"
  get 'chat/home', to: 'chat#home'
  get 'chat/planet', to: 'chat#planet'
  get 'chat/chat', to: 'chat#chat'
  post 'generate_content', to: 'content#generate'
  get 'show_content', to: 'content#show_content'
  get 'custom_content/:id', to: 'content#custom_content'
end
