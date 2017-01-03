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
          result[:to_home] = trip_return.id
        end
      end
    end

    return result
  end

  def self.find_offers event_id:, user_id:
    return Trip.where(user_id: user_id, event_id: event_id)
               .joins(:event)
               .select('trips.*')
               .select('events.address as event_address')
               .select('events.time_start as event_start')
  end
end
