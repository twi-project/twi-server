import {createReadStream} from "fs"
import {createHash} from "crypto"

/**
 * Calculate sha512 hash based on a file content.
 * The file will be read from given path.
 *
 * @param {string} path
 *
 * @return {string}
 */
async function calcHash(algorithm, path) {
  const hash = createHash(algorithm)

  for await (const chunk of createReadStream(path)) {
    hash.update(chunk)
  }

  return hash.digest("hex")
}

export default calcHash
