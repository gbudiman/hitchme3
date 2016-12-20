class Passenger < ApplicationRecord
  belongs_to :trip
  validates :trip, presence: true, strict: ActiveRecord::StatementInvalid

  belongs_to :user, foreign_key: :driver_id
  validates :user, presence: true, strict: ActiveRecord::StatementInvalid

  belongs_to :user, foreign_key: :passenger_id
  validates :user, presence: true, strict: ActiveRecord::StatementInvalid

  validates :address, presence: true, strict: ActiveRecord::StatementInvalid
  validates :pickup_time, presence: true, strict: ActiveRecord::StatementInvalid
end
