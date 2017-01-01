class EventController < ApplicationController
  def create
    event = Event.new user_id: session[:user_id],
                      name: params[:name],
                      address: params[:address],
                      time_start: params[:start_time],
                      time_end: params[:end_time].length == 0 ? nil : params[:end_time]

    event.save
    
    render json: {
      status: event.id ? 'OK' : 'error',
      id: event.id
    }
  end

  def search
    render json: {
      status: 'OK',
      results: Event.search(query: params[:q])
    }
  end
end
