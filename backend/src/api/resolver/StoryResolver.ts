import {join} from "path"

import {InjectConnection} from "typeorm-typedi-extensions"
import {Connection, TransactionRepository, Transaction} from "typeorm"
import {Service} from "typedi"
import {
  FieldResolver,
  Resolver,
  Query,
  Mutation,
  Ctx,
  Arg,
  Args,
  Root,
  Authorized,
  UseMiddleware,
  ID
} from "type-graphql"
import {ParameterizedContext} from "koa"
import {set, isEmpty} from "lodash"

import {StoryRepo} from "repo/StoryRepo"
import {FileRepo} from "repo/FileRepo"
import {TagRepo} from "repo/TagRepo"

import {Story} from "entity/Story"
import {File} from "entity/File"
import {Tag} from "entity/Tag"

import {writeFile, removeFile, WriteFileResult} from "helper/util/file"

import {BaseContext} from "app/context/BaseContext"
import {StateWithViewer} from "app/state/WithViewer"

import {StoryPage, StoryPageParams} from "api/type/story/StoryPage"

import PageArgs from "api/args/PageArgs"
import StoryAddInput from "api/input/story/Add"
import StoryUpdateInput from "api/input/story/Update"
import FileNodeInput from "api/input/common/FileNode"

import NotFound from "api/middleware/NotFound"
import GetViewer from "api/middleware/GetViewer"

type Context = ParameterizedContext<StateWithViewer, BaseContext>

@Service()
@Resolver(() => Story)
class StoryResolver {
  @InjectConnection()
  private _db!: Connection

  @FieldResolver(() => [Tag], {nullable: "items"})
  tags(
    @Root()
    {tags}: Story
  ) {
    if (isEmpty(tags)) {
      return []
    }

    return tags
  }

  @Query(() => StoryPage)
  async stories(
    @Args()
    {limit, page, offset}: PageArgs
  ): Promise<StoryPageParams> {
    const storyRepo = this._db.getCustomRepository(StoryRepo)

    const [rows, count] = await storyRepo.findAndCount({
      skip: offset, take: limit, where: {isDraft: false}
    })

    return {rows, count, page, limit, offset}
  }

  @Query(() => Story, {description: "Finds a story by given id or slug"})
  @UseMiddleware(NotFound)
  async story(
    @Arg("idOrSlug") idOrSlug: string
  ): Promise<Story | undefined> {
    const storyRepo = this._db.getCustomRepository(StoryRepo)

    return storyRepo.findByIdOrSlug(idOrSlug)
  }

  @Mutation(() => Story, {description: "Creates a new story"})
  @Authorized()
  @UseMiddleware(GetViewer)
  @Transaction()
  async storyAdd(
    @Arg("story", () => StoryAddInput)
    {tags, ...fields}: StoryAddInput,

    @Ctx()
    ctx: Context,

    @TransactionRepository()
    storyRepo: StoryRepo,

    @TransactionRepository()
    tagRepo: TagRepo
  ): Promise<Story> {
    const {viewer} = ctx.state

    const story = storyRepo.create(fields)

    story.publisher = viewer

    if (tags) {
      story.tags = await tagRepo.findOrCreateMany(tags)
    }

    return storyRepo.save(story)
  }

  @Mutation(() => Story, {description: "Updates story with given ID."})
  @Authorized()
  @Transaction()
  async storyUpdate(
    @Arg("story")
    {id, tags, ...fields}: StoryUpdateInput,

    @Ctx()
    ctx: Context,

    @TransactionRepository()
    storyRepo: StoryRepo,

    @TransactionRepository()
    tagRepo: TagRepo
  ): Promise<Story> {
    const story = await storyRepo.findOne(id)

    if (!story) {
      ctx.throw(400)
    }

    Object.entries(fields).forEach(([key, value]) => set(story, key, value))

    if (tags) {
      story.tags = await tagRepo.findOrCreateMany(tags)
    } else if (tags === null) { // Remove all tags from the story if "tags" parameter is null
      story.tags = null
    }

    return storyRepo.save(story)
  }

  @Mutation(() => ID, {description: "Removed story with given ID."})
  @Authorized()
  @Transaction()
  async storyRemove(
    @Arg("storyId", () => ID)
    storyId: number,

    @Ctx()
    ctx: Context,

    @TransactionRepository()
    storyRepo: StoryRepo
  ): Promise<number> {
    const story = await storyRepo.findOne(storyId)

    if (!story) {
      ctx.throw(400)
    }

    return storyRepo.softRemove(story).then(() => storyId)
  }

  @Mutation(() => File, {description: "Updates story's cover."})
  @Authorized()
  @UseMiddleware([GetViewer, NotFound])
  @Transaction()
  async storyCoverUpdate(
    @Arg("story")
    {id, file}: FileNodeInput,

    @TransactionRepository()
    storyRepo: StoryRepo,

    @TransactionRepository()
    fileRepo: FileRepo
  ): Promise<File | undefined> {
    // TODO: Check for user's permissions
    const {name, type: mime} = file

    const story = await storyRepo.findOne(id)

    if (!story) {
      return undefined
    }

    const {path, hash}: WriteFileResult = await writeFile(
      join("story", String(story.id), "cover", name),

      file.stream()
    )

    if (story.cover) {
      const {cover} = story
      const {path: oldPath} = cover

      Object
        .entries(({path, hash, mime, name}))
        .forEach(([key, value]) => set(cover, key, value))

      const updated = await fileRepo.save(cover)

      await removeFile(oldPath)

      return updated
    }

    const cover = await fileRepo.createAndSave({
      hash, path, mime, name
    })

    story.cover = cover

    await storyRepo.save(story)

    return cover
  }

  @Mutation(() => ID, {nullable: true, description: "Removes story's cover."})
  @Authorized()
  @UseMiddleware([GetViewer, NotFound])
  @Transaction()
  async storyCoverRemove(
    @Arg("storyId", () => ID)
    storyId: number,

    @TransactionRepository()
    storyRepo: StoryRepo,

    @TransactionRepository()
    fileRepo: FileRepo
  ): Promise<number | null | undefined> {
    // TODO: Check user's permissions
    const story = await storyRepo.findOne(storyId)

    // Report non-existent story to NotFount middleware
    if (!story) {
      return undefined
    }

    // Do nothing and return `null` if the story has no cover
    if (!story.cover) {
      return null
    }

    const {id, path} = story.cover

    await fileRepo.remove(story.cover)
    await removeFile(path)

    return id
  }
}

export default StoryResolver
