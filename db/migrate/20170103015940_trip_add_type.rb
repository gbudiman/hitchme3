class TripAddType < ActiveRecord::Migration[5.0]
  def change
    add_column :trips, :trip_type, :integer, null: false
  end
end
