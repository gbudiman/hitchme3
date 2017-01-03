class Step < ApplicationRecord
  belongs_to :trip
  validates :trip, presence: true, strict: ActiveRecord::StatementInvalid

  validates :lat_e6, presence: true, strict: ActiveRecord::StatementInvalid
  validates :lng_e6, presence: true, strict: ActiveRecord::StatementInvalid
  validates :time_estimation, presence: true, strict: ActiveRecord::StatementInvalid

  def self.create_polylines encoded:, durations:, trip_id:
    Polylines::Decoder.decode_polyline(encoded).each_with_index do |point, i|
      Step.create trip_id: trip_id,
                  lat_e6: point[0] * 1000000,
                  lng_e6: point[1] * 1000000,
                  time_estimation: durations[i]
    end
  end
end
