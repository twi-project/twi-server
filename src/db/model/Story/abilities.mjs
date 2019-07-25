import {AbilityBuilder as Builder} from "@casl/ability"

import Story from "db/model/Story"
import User from "db/model/User"

const getStoryAbilities = user => Builder.define(allow => {
  allow("read", Story)

  allow("manage", Story, {userId: user.id})

  if (user.role === Story.roles.moderator) {
    allow(["update", "delete"], User, ["title", "description"])
  }
})

export default getStoryAbilities
