# syntax=docker/dockerfile:1
# Base stage
FROM ruby:3.2-alpine AS base

# Dependencies stage
FROM base AS dependencies
WORKDIR /app
RUN apk add --no-cache build-base
COPY Gemfile Gemfile.lock ./
RUN gem install sinatra rerun && \
    bundle install --deployment --without development test

# Production image
FROM base AS production
WORKDIR /app
RUN apk add --no-cache build-base
RUN gem install sinatra rerun rackup puma
COPY . .
EXPOSE 4567
CMD ["ruby", "app.rb"]
