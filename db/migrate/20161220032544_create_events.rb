class CreateEvents < ActiveRecord::Migration[5.0]
  def change
    create_table :events do |t|
      t.belongs_to             :user, index: true, foreign_key: true, type: :bigint, null: false

      t.string                 :name, null: false, index: true
      t.string                 :address, null: false
      t.datetime               :time_start, null: false, index: true
      t.datetime               :time_end

      t.timestamps
    end
  end
end
