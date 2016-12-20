class CreateUsers < ActiveRecord::Migration[5.0]
  def change
    create_table :users, id: false do |t|
      t.bigserial               :id, primary_key: true

      t.string                  :token
      t.datetime                :expiration

      t.string                  :email, null: false
      t.string                  :link, null: false
      t.string                  :name, null: false

      t.timestamps
    end
  end
end
