require 'rails_helper'

RSpec.describe Step, type: :model do
  before :each do
    @user = User.create email: 'x@y.com', link: '123', name: 'zz'
    @passenger = User.create email: 'y@ya.com', link: '152', name: 'zz'
    @event = Event.create user_id: @user.id, name: 'event', address: '12412 D', time_start: '2014/5/12'
    @trip = Trip.create user_id: @user.id,
                        event_id: @event.id,
                        encoded_polylines: 'dummy',
                        time_start: '2014/5/12',
                        space_passenger: 1,
                        space_cargo: 1
    @step = Step.new trip_id: @trip.id,
                     lat_e6: 1240,
                     lng_e6: 6132,
                     time_estimation: 12
  end

  it 'should save Step object correctly' do
    expect { @step.save }.to change{Step.count}.by 1
  end

  context 'basic validation' do
    after :each do
      expect { @step.save }.to raise_error(ActiveRecord::StatementInvalid)
    end

    it 'should fail on empty trip_id' do
      @step.trip_id = nil
    end

    it 'should fail on invalid trip_id' do
      @step.trip_id = 512
    end

    it 'should fail on empty latitude' do
      @step.lat_e6 = nil
    end

    it 'should fail on empty longitude' do
      @step.lng_e6 = nil
    end

    it 'should fail on empty time_estimation' do
      @step.time_estimation = nil
    end
  end

  context 'referential integrity' do
    before :each do
      @step.save
      @id = @step.id
    end

    it 'shoud cascade delete from Trip' do
      @trip.destroy
      expect { Step.find(@id) }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
