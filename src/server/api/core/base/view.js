import {join} from "path"

import {compile} from "pug"
import {readFile} from "promise-fs"
import {version, codename} from "package.json"

import merge from "lodash/merge"
import isFunction from "lodash/isFunction"

const VIEWS = join(process.cwd(), "view")

// Default settions of view renderer
const defaults = {
  views: VIEWS,
  debug: false,
  cache: false,
  locals: {
    system: {
      version,
      codename
    }
  }
}

// Tiny cache for Pug's template functions
const cache = {}

/**
 * Run Pug compiler
 *
 * @param string filename
 * @param object options
 *
 * @return function
 */
const compileFile = async (filename, options) => compile(
  await readFile(filename), {
    ...options, filename
  }
)

/**
 * Compile template from given path
 *
 * @param string filename
 * @param object options
 *
 * @return function
 */
async function compileTemplate(filename, options) {
  if (options.cache && isFunction(cache[filename])) {
    return cache[filename]
  }

  const fn = await compileFile(filename, options)

  return options.cache ? (cache[filename] = fn) : fn
}

/**
 * Get render function for Koa context
 *
 * @param object options
 *
 * @return function render
 */
const getViewRenderer = options => async function render(filename, locals) {
  const fn = await compileTemplate(
    `${options.views}/${filename}.pug`, options
  )

  locals = merge({}, locals, options.locals)

  this.body = fn(locals)
}

/**
 * Set up Pug view renderer on Koa context
 *
 * @param Koa koa
 * @param options object
 */
const view = options => getViewRenderer(
  merge({}, defaults, options, {
    pretty: false
  })
)

export default view
