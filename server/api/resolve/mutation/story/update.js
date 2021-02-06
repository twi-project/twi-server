import {permittedFieldsOf} from "@casl/ability/extra"

import pick from "lodash/pick"
import isEmpty from "lodash/isEmpty"

import bind from "server/lib/helper/graphql/normalizeParams"
import db from "server/lib/db/connection"

import NotFound from "server/lib/error/http/NotFound"
import Forbidden from "server/lib/error/http/Forbidden"

import Story from "server/model/Story"

import getStoryAbilities from "server/acl/story"
import getCommonAbilities from "server/acl/common"

const update = ({args, ctx}) => db.transaction(async transaction => {
  const {user} = ctx.state
  let {id, ...fields} = args.story

  const story = await Story.findByPk(id, {transaction})

  if (!story) {
    throw new NotFound("Can't find requested story.")
  }

  const aclCommon = getCommonAbilities(user)
  const aclStory = getStoryAbilities({user})

  if (aclStory.cannot("update", story) || aclCommon.cannot("update", story)) {
    throw new Forbidden("You can't update the story.")
  }

  const filter = permittedFieldsOf(aclStory, "update", story)

  if (!isEmpty(filter)) {
    fields = pick(fields, filter)
  }

  return story.update(fields, {transaction})
    .then(() => story.reload({transaction}))
})

export default update |> bind
