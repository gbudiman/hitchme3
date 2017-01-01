Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  get      '/',                                to: 'splash#index'
  get      '/session/channel',                 to: 'session#channel'
  get      '/session/username',                to: 'session#fetch_username'
  get      '/session/destroy',                 to: 'session#destroy'
  get      'auth/facebook/callback',           to: 'session#create'

  post     '/event/create',                    to: 'event#create'
end
