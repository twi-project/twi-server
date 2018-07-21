import {basename, extname} from "path"

import Router from "koa-router"

import {graphqlKoa, graphiqlKoa} from "graphql-server-koa"

import checkCtorCall from "core/helper/util/checkCtorCall"
import formatError from "core/graphql/formatError"
import schema from "core/graphql/schema"
import noop from "core/middleware/noop"
import config from "core/config"
import log from "core/log"

// GraphQL endpoint name for GraphiQL (based on current module name)
const endpointURL = `/${basename(module.filename, extname(module.filename))}`

// GraphiQL IDE handler. Will rendered only in "development" env
const actionGraphiQL = async function(ctx, next) {
  const {dev, test} = config.env

  const middleware = dev && !test ? graphiqlKoa({endpointURL}) : noop()

  return middleware(ctx, next)
}

// GraphQL queries/mutations/subscriptions handler
const actionGraphQL = graphqlKoa(async context => ({
  schema, context, formatError
}))

const r = new Router()

// TODO: Move schema explorer to an external repo
r.get("/", actionGraphiQL)

r.all("/", actionGraphQL)

/**
 * @constructor
 */
function GraphQLController() {
  checkCtorCall(GraphQLController, this)
}

// Add GraphQL endpoint to GraphQLController
GraphQLController.prototype.router = r

const {server} = config

if (config.env.dev) {
  log.info(
    "GraphiQL IDE will be mounted on http://%s:%s%s",
    server.host, server.port, endpointURL
  )
}

export default GraphQLController
