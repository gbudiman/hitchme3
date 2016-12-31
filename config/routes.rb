Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  get      '/',                                to: 'splash#index'
  get      'auth/facebook/callback',           to: 'session#create'
end
