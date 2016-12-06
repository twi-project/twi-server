"use strict"

{t} = require "../core/i18n"
blog = require "../model/Blog"

ForbiddenException = require "../core/error/Forbidden"
NotFoundException = require "../core/error/NotFound"

actionTag = (ctx) ->
  {tagName, page} = ctx.params
  {ref} = ctx.query

  return ctx.body = await blog.getTagsByName tagName if ref is "ed"

  post = await blog.getByTagName tagName, page

  await ctx.render "blog/tag", {title: "Поиск по тегу #{tagName}", post}

  await return

actionIndex = (ctx) ->
  await ctx.render "blog/index",
    title: "Блог"

  await return

actionNew = (ctx) ->
  {user} = ctx.req

  unless user? or user?.role < 3
    throw new ForbiddenException "Unauthorized access to #{ctx.url}"

  await ctx.render "blog/new",
    title: t "blog.title.new"
    _csrf: ctx.csrf

  await return

actionCreate = (ctx) ->
  {user} = ctx.req

  unless user? or user?.role < 3
    throw new ForbiddenException "Unauthorized access to #{ctx.url}"

  {title, content, tags} = ctx.request.body

  # post = await blog.createPost user.userId, title, content, tags

  # ctx.body = post
  ctx.body = {title, content, tags}

  await return

actionEdit = (ctx) ->
  {user} = ctx.req

  unless user? or user?.role < 3
    throw new ForbiddenException "Unauthorized access to #{ctx.url}"

  await return

actionSave = (ctx) -> await return

actionDelete = (ctx) -> await return

actionRead = (ctx) ->
  {title} = post = await blog.getPost ctx.params.slug

  await ctx.render 'blog/post', {title, post}

  await return

module.exports = (r) ->
  r "/blog/tag/:tagName/:page?"
    .get actionTag

  r "/blog/post/:slug"
    .get actionRead

  r "/blog/new"
    .get actionNew
    .post actionCreate

  r "/blog/edit/:slug"
    .get actionEdit
    .put actionSave

  r "/blog/delete/:slug"
    .delete actionDelete

  r "/blog/:page?"
    .get actionIndex

  return
