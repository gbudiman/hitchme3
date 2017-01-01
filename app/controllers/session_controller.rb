class SessionController < ApplicationController
  def create
    render layout: false
    user = User.login data: request.env['omniauth.auth']

    session[:user_id] = user.id
  end

  def fetch_username
    user = User.find_by_session_id(session[:user_id])
    render json: {
      valid: user ? true : false,
      name: user ? user[:name] : nil
    }
  end

  def destroy
    reset_session
  end
end
