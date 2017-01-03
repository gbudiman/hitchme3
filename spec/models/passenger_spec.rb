require 'rails_helper'

RSpec.describe Passenger, type: :model do
  before :each do
    @user = User.create email: 'x@y.com', link: '123', name: 'zz'
    @passenger = User.create email: 'y@ya.com', link: '152', name: 'zz'
    @event = Event.create user_id: @user.id, name: 'event', address: '12412 D', time_start: '2014/5/12'
    @trip = Trip.create user_id: @user.id,
                        event_id: @event.id,
                        encoded_polylines: 'dummy',
                        time_start: '2014/5/12',
                        address: '123 W. Ave, CA',
                        trip_type: Trip.trip_types[:to_event],
                        space_passenger: 1,
                        space_cargo: 1
    @passenger = Passenger.new trip_id: @trip.id,
                               driver_id: @user.id,
                               passenger_id: @passenger.id,
                               address: 'pick me up here',
                               pickup_time: '2014/5/12'
  end

  it 'should save Passenger object correctly' do
    expect { @passenger.save }.to change{Passenger.count}.by 1
  end

  context 'basic validation' do
    after :each do
      expect { @passenger.save }.to raise_error(ActiveRecord::StatementInvalid)
    end

    it 'should fail on empty trip_id' do
      @passenger.trip_id = nil
    end

    it 'should fail on invalid trip_id' do
      @passenger.trip_id = 512
    end

    it 'should fail on empty passenger_id' do
      @passenger.passenger_id = nil
    end

    it 'should fail on invalid passenger_id' do
      @passenger.passenger_id = 512
    end

    it 'should fail on empty address' do
      @passenger.address = nil
    end

    it 'should fail on empty pickup_time' do
      @passenger.pickup_time = nil
    end
  end

  context 'referential integrity' do
    before :each do
      @passenger.save
      @id = @passenger.id
    end

    after :each do
      expect { Passenger.find(@id) }.to raise_error(ActiveRecord::RecordNotFound)
    end

    it 'should cascade delete from User:driver' do
      @user.destroy
    end

    it 'should cascade delete from User:passenger' do
      @passenger.destroy
    end

    it 'should cascade delete from Trip' do
      @trip.destroy
    end
  end
end
