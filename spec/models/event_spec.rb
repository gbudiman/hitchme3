require 'rails_helper'

RSpec.describe Event, type: :model do
  before :each do
    @user = User.create email: 'x@y.com', link: '123', name: 'zz'
    @event = Event.new user_id: @user.id,
                       name: 'event',
                       address: '12412 D',
                       time_start: '2014/5/12'
  end

  it 'should save Event object correctly' do
    expect { @event.save }.to change{Event.count}.by 1
  end

  context 'basic validation' do
    after :each do
      expect { @event.save }.to raise_error(ActiveRecord::StatementInvalid)
    end

    it 'should fail on empty name' do
      @event.name = nil
    end

    it 'should fail on empty user_id' do
      @event.user_id = nil
    end

    it 'should fail on invalid user_id' do
      @event.user_id = -512
    end

    it 'should fail on empty address' do
      @event.address = nil
    end

    it 'should fail on empty time_start' do
      @event.time_start = nil
    end
  end

  context 'referential integrity' do
    before :each do
      @event.save
      @id = @event.id
    end

    it 'should cascade delete from User' do
      @user.destroy
      expect { Event.find(@id) }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end
end
