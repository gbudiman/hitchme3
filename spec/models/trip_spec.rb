require 'rails_helper'

RSpec.describe Trip, type: :model do
  before :each do
    @user = User.create email: 'x@y.com', link: '123', name: 'zz'
    @event = Event.create user_id: @user.id, name: 'event', address: '12412 D', time_start: '2014/5/12'
    @trip = Trip.new user_id: @user.id,
                     event_id: @event.id,
                     encoded_polylines: 'dummy',
                     time_start: '2014/5/12',
                     space_passenger: 1,
                     space_cargo: 1
  end

  it 'should save Trip object correctly' do
    expect { @trip.save }.to change{Trip.count}.by 1
  end

  context 'basic validation' do
    after :each do
      expect { @trip.save }.to raise_error(ActiveRecord::StatementInvalid)
    end

    it 'should fail on empty user_id' do
      @trip.user_id = nil
    end

    it 'should fail on invalid user_id' do
      @trip.user_id = 512
    end

    it 'should fail on empty event_id' do
      @trip.event_id = nil
    end

    it 'should fail on invalid event_id' do
      @trip.event_id = 512
    end

    it 'should fail on empty polyline' do
      @trip.encoded_polylines = nil
    end

    it 'should fail on empty time_start' do
      @trip.time_start = nil
    end

    it 'should fail on empty space_passenger' do
      @trip.space_passenger = nil
    end

    it 'should fail on empty space_cargo' do
      @trip.space_cargo = nil
    end

    it 'should fail on negative space_passenger' do
      @trip.space_passenger = -1
    end

    it 'should fail on negative space_cargo' do
      @trip.space_cargo = -1
    end
  end

  context 'referential integrity' do
    before :each do
      @trip.save
      @id = @event.id
    end

    after :each do
      expect { Trip.find(@id) }.to raise_error(ActiveRecord::RecordNotFound)
    end

    it 'should cascade delete from User' do
      @user.destroy
    end

    it 'should cascade delete from Event' do
      @event.destroy
    end
  end

  context 'duplication' do
    before :each do
      @trip.save
      @dup = @trip.dup
    end

    it 'should disallow duplicate trip with identical time_start' do
      expect { @dup.save }.to raise_error(ActiveRecord::RecordNotUnique)
    end

    it 'shoould allow duplicate trip with different time_start' do
      @dup.time_start = '2014/5/13'
      expect { @dup.save }.to change{Trip.count}.by 1
    end
  end
end
