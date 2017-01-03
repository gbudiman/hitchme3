class TripAddAddress < ActiveRecord::Migration[5.0]
  def change
    add_column :trips, :address, :string, null: false
  end
end
