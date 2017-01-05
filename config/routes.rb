Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  get      '/',                                to: 'splash#index'
  get      '/session/channel',                 to: 'session#channel'
  get      '/session/username',                to: 'session#fetch_username'
  get      '/session/destroy',                 to: 'session#destroy'
  get      'auth/facebook/callback',           to: 'session#create'

  get      '/event/search/',                   to: 'event#search'
  get      '/event/my/offers',                 to: 'event#offers'
  post     '/event/create',                    to: 'event#create'

  post     '/trip/create',                     to: 'trip#create'
  delete   '/trip/destroy',                    to: 'trip#destroy'
  post     '/trip/undestroy',                  to: 'trip#undestroy'
  get      '/trip/search',                     to: 'trip#search'
  get      '/trip/steps',                      to: 'trip#steps'
end
