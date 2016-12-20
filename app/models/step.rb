class Step < ApplicationRecord
  belongs_to :trip
  validates :trip, presence: true, strict: ActiveRecord::StatementInvalid

  validates :lat_e6, presence: true, strict: ActiveRecord::StatementInvalid
  validates :lng_e6, presence: true, strict: ActiveRecord::StatementInvalid
  validates :time_estimation, presence: true, strict: ActiveRecord::StatementInvalid
end
