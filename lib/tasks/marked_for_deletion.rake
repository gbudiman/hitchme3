namespace :marked_for_deletion do
  task delete: :environment do
    Trip.where(mark_for_deletion: true)
        .where('updated_at < :t', t: Time.now - 6.hours)
  end
end
