class User < ApplicationRecord
  validates :email, presence: true, uniqueness: true, strict: ActiveRecord::StatementInvalid
  validates :link, presence: true, strict: ActiveRecord::StatementInvalid
  validates :name, presence: true, strict: ActiveRecord::StatementInvalid

  has_many :events, dependent: :destroy
  has_many :trips, dependent: :destroy
  has_many :passengers, foreign_key: :driver_id, dependent: :destroy
  has_many :passengers, foreign_key: :passenger_id, dependent: :destroy

  def self.login data:
    ap data
    id = data[:uid].to_i
    token = data[:credentials][:token]
    expiration = Time.at(data[:credentials][:expires_at])
    name = data[:info][:name]
    email = data[:info][:email]

    user = User.find_by id: id

    if user
      now = Time.now

      if expiration < now
        user.tap do |u|
          u.expiration    = expriation
          u.token         = token
          u.name          = name
          u.email         = email
        end

        user.save
      end
    else
      user = User.create! id:          id,
                          token:       token,
                          expiration:  expiration,
                          name:        name,
                          link:        id,
                          email:       email
    end

    return user
  end

  def self.find_by_session_id id
    return User.find(id)
  end
end
