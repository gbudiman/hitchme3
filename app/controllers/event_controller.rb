class EventController < ApplicationController
  def create
    event = Event.new user_id: session[:user_id],
                      name: params[:name],
                      address: params[:address],
                      time_start: Time.at(params[:start_time].to_i),
                      time_end: params[:end_time].length == 0 ? nil : Time.at(params[:end_time].to_i)

    ap event
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

  def offers
    render json: {
      status: 'OK',
      results: Trip.find_offers(event_id: params[:id].to_i,
                                user_id: session[:user_id])
    }
  end
end
