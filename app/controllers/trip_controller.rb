class TripController < ApplicationController
  def create
    trips = Trip.create_from_web params: params, session: session
    render json: {
      status: trips.length > 0 ? 'OK' : 'error',
      result: trips
    }
  end
end
