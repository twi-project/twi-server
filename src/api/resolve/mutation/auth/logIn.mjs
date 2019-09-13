import omit from "lodash/omit"

import conn from "core/db/connection"
import bind from "core/helper/graphql/normalizeParams"
import Unauthorized from "core/error/http/Unauthorized"

import Session from "model/Session"
import User from "model/User"

const logIn = ({args, ctx}) => conn.transaction(async transaction => {
  const {email, password} = args.user
  const {client} = ctx.state

  const user = await User.findOne({where: {email}}, {transaction})

  if (!user || (user && await user.comparePassword(password) === false)) {
    throw new Unauthorized(
      "Can't authenticate user. Check your credentials and try again."
    )
  }

  return Session.sign({
    client, user: omit(user.toJSON(), "password")
  }, {transaction})
})

export default bind(logIn)
