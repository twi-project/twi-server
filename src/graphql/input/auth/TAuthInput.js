import {GraphQLEmail as TEmail} from "graphql-custom-types"
import {GraphQLString as TString} from "graphql"

import Input from "parasprite/Input"

const TAuthInput = Input(
  "AuthInput", "User credentials for local authentication"
)
  .field({name: "email", type: TEmail, required: true})
  .field({name: "password", type: TString, required: true})
.end()

export default TAuthInput
