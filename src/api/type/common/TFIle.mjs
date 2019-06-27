import {
  GraphQLID as TID,
  GraphQLInt as TInt,
  GraphQLString as TString
} from "graphql"

import Type from "parasprite/Type"

import TDates from "api/type/common/TDates"

const TFile = Type("File")
  .field({
    name: "id",
    type: TID,
    require: true
  })
  // TODO: Add a resolver to convert file path to URL
  .field({
    name: "path",
    type: TString,
    require: true
  })
  .field({
    name: "mime",
    type: TString,
    required: true
  })
  .field({
    name: "hash",
    type: TString,
    required: true
  })
  // Add a resolver with types convertation
  .field({
    name: "size",
    type: TInt,
    required: true
  })
  .field({
    name: "dates",
    type: TDates,
    required: true
  })
.end()

export default TFile