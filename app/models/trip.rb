class Trip < ApplicationRecord
  belongs_to :user
  validates :user, presence: true, strict: ActiveRecord::StatementInvalid

  belongs_to :event
  validates :event, presence: true, strict: ActiveRecord::StatementInvalid

  validates :encoded_polylines, presence: true, strict: ActiveRecord::StatementInvalid
  validates :time_start, presence: true, strict: ActiveRecord::StatementInvalid
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
end
