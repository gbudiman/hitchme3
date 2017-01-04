class TripAddMarkForDeletion < ActiveRecord::Migration[5.0]
  def change
    add_column :trips, :mark_for_deletion, :boolean, default: false
  end
end
