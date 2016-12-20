class CreateSteps < ActiveRecord::Migration[5.0]
  def change
    create_table :steps do |t|
      t.belongs_to             :trip, index: true, foreign_key: true, null: false

      t.integer                :lat_e6, null: false, index: true
      t.integer                :lng_e6, null: false, index: true
      t.integer                :time_estimation, null: false
      t.timestamps
    end
  end
end
