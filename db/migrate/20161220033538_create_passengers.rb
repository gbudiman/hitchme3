class CreatePassengers < ActiveRecord::Migration[5.0]
  def change
    create_table :passengers do |t|
      t.belongs_to             :trip, index: true, foreign_key: true, null: false

      t.bigint                 :driver_id, index: true, null: false
      t.bigint                 :passenger_id, index: true, null: false

      t.string                 :address, null: false
      t.datetime               :pickup_time, null: false  
      t.timestamps
    end

    add_foreign_key :passengers, :users, column: :driver_id, primary_key: :id
    add_foreign_key :passengers, :users, column: :passenger_id, primary_key: :id
  end
end
