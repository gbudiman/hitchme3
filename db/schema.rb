# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20161220033747) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "events", force: :cascade do |t|
    t.bigint   "user_id",    null: false
    t.string   "name",       null: false
    t.string   "address",    null: false
    t.datetime "time_start", null: false
    t.datetime "time_end"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_events_on_name", using: :btree
    t.index ["time_start"], name: "index_events_on_time_start", using: :btree
    t.index ["user_id"], name: "index_events_on_user_id", using: :btree
  end

  create_table "passengers", force: :cascade do |t|
    t.integer  "trip_id",      null: false
    t.bigint   "driver_id",    null: false
    t.bigint   "passenger_id", null: false
    t.string   "address",      null: false
    t.datetime "pickup_time",  null: false
    t.datetime "created_at",   null: false
    t.datetime "updated_at",   null: false
    t.index ["driver_id"], name: "index_passengers_on_driver_id", using: :btree
    t.index ["passenger_id"], name: "index_passengers_on_passenger_id", using: :btree
    t.index ["trip_id"], name: "index_passengers_on_trip_id", using: :btree
  end

  create_table "steps", force: :cascade do |t|
    t.integer  "trip_id",         null: false
    t.integer  "lat_e6",          null: false
    t.integer  "lng_e6",          null: false
    t.integer  "time_estimation", null: false
    t.datetime "created_at",      null: false
    t.datetime "updated_at",      null: false
    t.index ["lat_e6"], name: "index_steps_on_lat_e6", using: :btree
    t.index ["lng_e6"], name: "index_steps_on_lng_e6", using: :btree
    t.index ["trip_id"], name: "index_steps_on_trip_id", using: :btree
  end

  create_table "trips", force: :cascade do |t|
    t.bigint   "user_id",           null: false
    t.integer  "event_id",          null: false
    t.text     "encoded_polylines", null: false
    t.datetime "time_start",        null: false
    t.integer  "space_passenger",   null: false
    t.integer  "space_cargo",       null: false
    t.datetime "created_at",        null: false
    t.datetime "updated_at",        null: false
    t.index ["event_id"], name: "index_trips_on_event_id", using: :btree
    t.index ["user_id"], name: "index_trips_on_user_id", using: :btree
  end

  create_table "users", id: :bigserial, force: :cascade do |t|
    t.string   "token"
    t.datetime "expiration"
    t.string   "email",      null: false
    t.string   "link",       null: false
    t.string   "name",       null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  add_foreign_key "events", "users"
  add_foreign_key "passengers", "trips"
  add_foreign_key "passengers", "users", column: "driver_id"
  add_foreign_key "passengers", "users", column: "passenger_id"
  add_foreign_key "steps", "trips"
  add_foreign_key "trips", "events"
  add_foreign_key "trips", "users"
end
