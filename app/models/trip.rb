class Trip < ApplicationRecord
  enum trip_type: [ :to_event, :to_home ]
  validates :trip_type, presence: true, strict: ActiveRecord::StatementInvalid

  belongs_to :user
  validates :user, presence: true, strict: ActiveRecord::StatementInvalid

  belongs_to :event
  validates :event, presence: true, strict: ActiveRecord::StatementInvalid

  validates :encoded_polylines, presence: true, strict: ActiveRecord::StatementInvalid
  validates :time_start, presence: true, strict: ActiveRecord::StatementInvalid
  validates :address, presence: true, strict: ActiveRecord::StatementInvalid
  validates :space_passenger, numericality: {
    integer_only: true,
    greater_than_or_equal_to: 0
  }, strict: ActiveRecord::StatementInvalid
  validates :space_cargo, numericality: {
    integer_only: true,
    greater_than_or_equal_to: 0
  }, strict: ActiveRecord::StatementInvalid

  has_many :passengers, dependent: :destroy
  has_many :steps, dependent: :destroy

  def self.create_from_web params:, session:
    result = Hash.new

    ActiveRecord::Base.transaction do
      trip = Trip.new user_id: session[:user_id],
                      event_id: params[:event_id].to_i,
                      space_passenger: params[:space_passenger].to_i,
                      space_cargo: params[:space_cargo].to_i

      if params[:offer_departure] == 'true'
        departure = trip.dup.tap do |t|
          t.trip_type = Trip.trip_types[:to_event]
          t.time_start = Time.at(params[:time_start].to_i)
          t.address = params[:address_depart_from]
          t.encoded_polylines = params[:to_event_encoded_polylines]
        end

        departure.save
        if departure.id
          Step.create_polylines encoded: departure.encoded_polylines,
                                durations: params[:to_event_durations],
                                trip_id: departure.id
          result[:to_event] = departure.id
        end
      end

      if params[:offer_return] == 'true'
        trip_return = trip.dup.tap do |t|
          t.trip_type = Trip.trip_types[:to_home]
          t.time_start = Time.at(params[:time_end].to_i)
          t.address = params[:address_return_to]
          t.encoded_polylines = params[:to_home_encoded_polylines]
        end

        trip_return.save
        if trip_return.id
          Step.create_polylines encoded: trip_return.encoded_polylines,
                                durations: params[:to_home_durations],
                                trip_id: trip_return.id
          result[:to_home] = trip_return.id
        end
      end
    end

    return result
  end

  def self.find_offers event_id:, user_id:
    return Trip.where(user_id: user_id, event_id: event_id, mark_for_deletion: false)
               .joins(:event)
               .select('trips.id as id,
                        trips.address as address,
                        trips.trip_type as trip_type,
                        trips.time_start as time_start,
                        events.address as event_address,
                        events.time_start as event_start')
  end

  def self.search_box event_id:, params:
    bounds = params[:bounds]
    result = Hash.new

    t = Trip.joins(:steps)
            .joins(:event)
            .where(mark_for_deletion: false)
            .where(event_id: event_id)
            .where(trip_type: Trip.trip_types[params[:trip_type]])
            .where('steps.lat_e6 BETWEEN :lo AND :hi', lo: bounds[:lat_lo].to_i, hi: bounds[:lat_hi].to_i)
            .where('steps.lng_e6 BETWEEN :lo AND :hi', lo: bounds[:lng_lo].to_i, hi: bounds[:lng_hi].to_i)
            .select('steps.id AS step_id,
                     steps.lat_e6 AS step_lat_e6,
                     steps.lng_e6 AS step_lng_e6,
                     steps.time_estimation AS step_estimation,
                     trips.id AS trip_id,
                     trips.address AS trip_start_address,
                     trips.time_start AS trip_start_time,
                     trips.trip_type AS trip_type,
                     events.address AS event_address').each do |r|
      result[r[:trip_id]] ||= {
        trip_type: r[:trip_type],
        trip_start_address: r[:trip_start_address],
        trip_start_time: r[:trip_start_time],
        event_address: r[:event_address],
        steps: Array.new
      }

      result[r[:trip_id]][:steps].push({
        step_id: r[:step_id],
        lat_e6: r[:step_lat_e6],
        lng_e6: r[:step_lng_e6],
        estimation: r[:step_estimation]
      })
    end

    ap result
  end
end
