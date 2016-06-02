'use strict'

koa = require 'koa'
serve = require 'koa-static'
bodyparser = require 'koa-bodyparser'
sess = require 'koa-generic-session'
redisStore = require 'koa-redis'
csrf = require 'koa-csrf'
passport = require 'koa-passport'
controller = require './controller'
view = require './view'
oConfig = require '../helpers/configure-helper'
errorHandler = require '../errors/error-handler'

{ok, info, logger}  = require '../logger'
{readFileSync, realpathSync} = require 'fs'
{app: {name, port, theme, lang}, session} = oConfig

app = do koa
app.keys = [session.secret]

# Set error handler
app.use errorHandler

app.use serve realpathSync "#{__dirname}/../../themes/#{theme}/public"

app.use logger

# Bodyparser
app.use do bodyparser

# Session
app.use sess
  store: do redisStore
  prefix: session.prefix
  key: "#{session.prefix}#{session.sessidName}"

csrf app
app.use csrf.middleware

# Passport
app
  .use do passport.initialize
  .use do passport.session

# Just add a redirectUrl
app.use (next) ->
  @redirectUrl = @url
  yield next

# Set controllers
controller app

# Set view engine
view app, debug: off

# Run server
do ->
  CERTS = realpathSync "#{__dirname}/../../configs/cert"
  try
    # TODO: Test this code with "Let's encrypt!" certificates.
    oOptions =
      key: readFileSync "#{CERTS}/twi.key"
      cert: readFileSync "#{CERTS}/twi.crt"
    require 'http2'
      .cteateServer oOptions, do app.callback
      .listen port
    info "Starting with HTTP2 server."
  catch err
    app.listen port
  ok "Twi started on http://localhost:#{port}"