class Event < ApplicationRecord
  validates :name, presence: true, strict: ActiveRecord::StatementInvalid
  validates :address, presence: true, strict: ActiveRecord::StatementInvalid
  validates :time_start, presence: true, strict: ActiveRecord::StatementInvalid

  belongs_to :user
  validates :user, presence: true, strict: ActiveRecord::StatementInvalid

  has_many :trip, dependent: :destroy
end
