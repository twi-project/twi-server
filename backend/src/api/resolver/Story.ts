import {InjectRepository} from "typeorm-typedi-extensions"
import {
  FieldResolver,
  Resolver,
  Query,
  Mutation,
  Ctx,
  Arg,
  Args,
  Root,
  Authorized
} from "type-graphql"
import {Context} from "koa"

import StoryRepo from "repo/Story"
import UserRepo from "repo/User"

import Story from "entity/Story"
import User from "entity/User"

import {StoryPage, StoryPageParams} from "api/type/story/StoryPage"

import PageArgs from "api/args/PageArgs"
import StoryAddInput from "api/input/story/Add"

@Resolver(() => Story)
class StoryResolver {
  @InjectRepository()
  private _storyRepo!: StoryRepo

  @InjectRepository()
  private _userRepo!: UserRepo

  @FieldResolver(() => User)
  async publisher(@Root() {publisher, publisherId}: Story): Promise<User> {
    if (!publisher) {
      return this._userRepo.findOne(publisherId)
    }

    return publisher
  }

  @Query(() => StoryPage)
  async stories(
    @Args() {limit, page, offset}: PageArgs
  ): Promise<StoryPageParams> {
    const [rows, count] = await this._storyRepo.findAndCount({
      skip: offset, take: limit, where: {isDraft: false}
    })

    return {rows, count, page, limit, offset}
  }

  @Query(() => Story)
  async story(@Ctx() ctx: Context, @Arg("slug") slug: string): Promise<Story> {
    const post = await this._storyRepo.findOne({where: {slug, isDraft: false}})

    if (!post) {
      ctx.throw(404)
    }

    return post
  }

  @Mutation(() => Story)
  @Authorized()
  async storyAdd(
    @Ctx() ctx: Context,
    @Arg("story", () => StoryAddInput) story: Story
  ): Promise<Story> {
    const {userId} = ctx.session

    return this._storyRepo.createAndSave(userId, story)
  }
}

export default StoryResolver
