class PassengerAddMarkForDeletion < ActiveRecord::Migration[5.0]
  def change
    add_column :passengers, :mark_for_deletion, :boolean, defaut: false
  end
end
