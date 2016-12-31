class SessionController < ApplicationController
  def create
    User.login data: request.env['omniauth.auth']
    redirect_to '/'
  end
end
