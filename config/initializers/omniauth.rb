OmniAuth.config.logger = Rails.logger

Rails.application.config.middleware.use OmniAuth::Builder do
  provider :facebook, Rails.application.secrets.fb_app_id,
                      Rails.application.secrets.fb_app_secret,
                      scope: 'email,public_profile',
                      info_field: 'email,name,link',
                      display: 'popup'
end