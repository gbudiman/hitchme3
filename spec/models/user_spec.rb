require 'rails_helper'

RSpec.describe User, type: :model do
  before :each do
    @user = User.new id: 4611686018427387904, # 2^62
                     email: 'e@b.com',
                     link: '5123',
                     name: 'name'
  end

  it 'should save User object correctly' do
    expect { @user.save }.to change{User.count}.by 1
  end

  context 'basic validation' do
    after :each do
      expect { @user.save }.to raise_error(ActiveRecord::StatementInvalid)
    end

    it 'should fail on empty email' do
      @user.email = nil
    end

    it 'should fail on empty link' do
      @user.link = nil
    end

    it 'should fail on empty name' do
      @user.name = nil
    end
  end

  context 'duplication' do
    before :each do
      @user.save
      @user_dup = @user.dup
    end

    it 'should invalidate duplicate email' do
      expect { @user_dup.save }.to raise_error(ActiveRecord::StatementInvalid)
    end

    it 'should allow duplicate user but with different email' do
      @user_dup.email = 'different@d.com'
      expect { @user_dup.save }.to change{User.count}.by 1
    end
  end
end
