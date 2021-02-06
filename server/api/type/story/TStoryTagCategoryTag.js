import {GraphQLInt as TInt, GraphQLString as TString} from "graphql"

import Type from "parasprite/Type"

import TDates from "server/api/type/common/TDates"

const TStoryTagCategoryTag = Type("StoryTagCategoryTag")
  .field({
    name: "id",
    type: TInt,
    required: true
  })
  .field({
    name: "name",
    type: TString,
    required: true
  })
  .field({
    name: "slug",
    type: TString,
    required: true
  })
  .field({
    name: "description",
    type: TString
  })
  .field({
    name: "dates",
    type: TDates,
    required: true
  })
.end()

export default TStoryTagCategoryTag
