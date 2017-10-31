import {GraphQLID as TID} from "graphql"
import Type from "parasprite/Type"

import TLogin from "../../scalar/user/TLogin"

import INode, {isTypeOf} from "../../interface/common/INode"

// May be I need to replace this type with type User?
const TPublisher = Type(
  "Publisher", "The actual publisher of the story",
  [INode], isTypeOf
)
  .field({
    name: "id",
    type: TID,
    required: true
  })
  .field({
    name: "login",
    type: TLogin,
    required: true
  })
.end()

export default TPublisher
