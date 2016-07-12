'use strict'

_ = require 'lodash'
moment = require 'moment'

model = require '../core/database'
story = model 'story', require '../core/database/schemas/stories'
character = model 'character', require '../core/database/schemas/character'
characterLocale = model 'characterLocale',
  require '../core/database/schemas/characterLocale'

character.hasMany characterLocale,
  as: 'locale'
  foreignKey: 'character_id'

class Story
  getCharacters: -> yield character.findAll raw: yes

  getCharactersByName: (name) ->
    yield character.findAll
      raw: yes
      include: [
        as: 'locale'
        model: characterLocale
        attributes: [
          'name'
        ]
        where:
          name:
            $like: "%#{decodeURI name}%"
      ]

module.exports = new Story
