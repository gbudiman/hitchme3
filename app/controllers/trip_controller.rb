class TripController < ApplicationController
  def create
    trips = Trip.create_from_web params: params, session: session
    render json: {
      status: trips.length > 0 ? 'OK' : 'error',
      result: trips
    }
  end

  def destroy
    destroyed = Trip.find(params[:id].to_i).update(mark_for_deletion: true)

    render json: {
      status: destroyed ? 'OK' : 'error'
    }
  end

  def undestroy
    undestroyed = Trip.find(params[:id].to_i).update(mark_for_deletion: false)

    render json: {
      status: undestroyed ? 'OK' : 'error'
    }
  end

  def search
    ap params
    Trip.search_box params: params, event_id: params[:event_id].to_i
  end
end
