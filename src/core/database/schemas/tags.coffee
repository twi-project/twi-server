'use strict'

module.exports = (oTypes) ->
  tagId:
    type: oTypes.INTEGER
    primaryKey: yes
    allowNull: no
    autoIncrement: on
  name:
    type: oTypes.STRING
    allowNull: no
    unique: yes
  title:
    type: oTypes.STRING
    allowNull: no
    unique: yes
  about:
    type: oTypes.TEXT
    allowNull: yes