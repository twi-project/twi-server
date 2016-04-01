'use strict'

requireDir = require 'require-dir'
{isFunction} = require 'lodash'
{logger} = require '../components'
NotFoundException = require '../errors/NotFoundException'

module.exports = (app) ->
  # Require all controllers
  oControllers = requireDir app.__ROOT__ + '/controller'
  for __sName, __controller of oControllers
    unless isFunction __controller
      logger.logLine "Notice: Controller \"#{__sName}\" is not a function.", logger.LOG_INFO
      continue

    __controller app

  # Render 404
  app.route '*'
    .get (req, res, next) ->
      next new NotFoundException "This is not the web page you are looking for."
      return
  return
