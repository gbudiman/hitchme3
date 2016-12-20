class CreateTrips < ActiveRecord::Migration[5.0]
  def change
    create_table :trips do |t|
      t.belongs_to             :user, index: true, foreign_key: true, type: :bigint, null: false
      t.belongs_to             :event, index: true, foreign_key: true, null: false

      t.text                   :encoded_polylines, null: false
      t.datetime               :time_start, null: false
      t.integer                :space_passenger, null: false
      t.integer                :space_cargo, null: false

      t.timestamps
    end
  end
end
