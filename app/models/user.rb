class User < ApplicationRecord
  validates :email, presence: true, uniqueness: true, strict: ActiveRecord::StatementInvalid
  validates :link, presence: true, strict: ActiveRecord::StatementInvalid
  validates :name, presence: true, strict: ActiveRecord::StatementInvalid

  has_many :events, dependent: :destroy
  has_many :trips, dependent: :destroy
  has_many :passengers, foreign_key: :driver_id, dependent: :destroy
  has_many :passengers, foreign_key: :passenger_id, dependent: :destroy
end
