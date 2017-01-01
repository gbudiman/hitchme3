class Event < ApplicationRecord
  validates :name, presence: true, strict: ActiveRecord::StatementInvalid
  validates :address, presence: true, strict: ActiveRecord::StatementInvalid
  validates :time_start, presence: true, strict: ActiveRecord::StatementInvalid

  belongs_to :user
  validates :user, presence: true, strict: ActiveRecord::StatementInvalid

  has_many :trip, dependent: :destroy

  def self.search query:
    results = Array.new
    Event.where('name ILIKE :query', query: "#{query}%")
         .where('time_start > :today', today: Time.now)
         .includes(:user)
         .limit(32).each do |e|
      results.push({
        id: e.id,
        organizer: e.user.name,
        time_start: e.time_start.to_i,
        time_end: e.time_end.to_i,
        name: e.name,
        address: e.address
      })
    end

    return results
  end
end
