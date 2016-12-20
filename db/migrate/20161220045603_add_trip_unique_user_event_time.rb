class AddTripUniqueUserEventTime < ActiveRecord::Migration[5.0]
  def change
    add_index :trips, [:user_id, :event_id, :time_start], unique: true
  end
end
