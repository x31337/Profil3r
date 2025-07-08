require 'sinatra'
require 'json'

set :bind, '0.0.0.0'
set :port, 4567

get '/' do
  content_type :json
  { message: 'Hello from Ruby Sinatra!', service: 'profil3r-ruby', version: '1.0.0' }.to_json
end

get '/health' do
  content_type :json
  { status: 'ok', service: 'profil3r-ruby', timestamp: Time.now.iso8601 }.to_json
end

get '/info' do
  content_type :json
  { ruby_version: RUBY_VERSION, service: 'profil3r-ruby', environment: ENV['RAILS_ENV'] || 'development' }.to_json
end
