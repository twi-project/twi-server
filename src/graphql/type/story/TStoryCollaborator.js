import {GraphQLString as TString} from "graphql"

import concat from "core/helper/string/concatFromArray"

import Type from "parasprite/Type"

import TUser from "../user/TUser"

const TStoryCollaborator = Type("StoryCollaborator", concat([
  // TODO: Improve this description :D
  "The story collaborator information. ",
  "Is that the user who helped a publisher with the story translation ",
  "or something else."
]))
  .field("role", TString, true)
  .field("user", TUser, true)
.end()

export default TStoryCollaborator