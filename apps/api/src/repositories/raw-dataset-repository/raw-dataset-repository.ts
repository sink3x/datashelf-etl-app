import { HeadBucketCommand, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3'
import type { S3Client } from '@aws-sdk/client-s3'
import type { IBucketObject } from '@interfaces/bucket-object'

export interface IRawDatasetRepositoryOptions {
  bucket: string
  prefix: string
  maxListedObjects?: number
}

export interface IRawDatasetListing {
  objects: IBucketObject[]
  truncated: boolean
}

export interface IRawDatasetRepository {
  put(params: { key: string; body: Buffer; contentType: string }): Promise<void>
  list(): Promise<IRawDatasetListing>
  ping(signal?: AbortSignal): Promise<void>
}

const PAGE_SIZE = 1000
const DEFAULT_MAX_LISTED_OBJECTS = 10_000

export class RawDatasetRepository implements IRawDatasetRepository {
  private readonly maxListedObjects: number

  constructor(
    private readonly s3: Pick<S3Client, 'send'>,
    private readonly options: IRawDatasetRepositoryOptions,
  ) {
    this.maxListedObjects = options.maxListedObjects ?? DEFAULT_MAX_LISTED_OBJECTS
  }

  public get prefix() {
    return this.options.prefix
  }

  public async put({ key, body, contentType }: { key: string; body: Buffer; contentType: string }) {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.options.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    )
  }

  // S3 cannot sort by date server-side, so the listing is collected (up to a cap) and sorted by the caller.
  public async list(): Promise<IRawDatasetListing> {
    const objects: IBucketObject[] = []
    let continuationToken: string | undefined
    let truncated = false

    do {
      const page = await this.s3.send(
        new ListObjectsV2Command({
          Bucket: this.options.bucket,
          Prefix: `${this.options.prefix}/`,
          MaxKeys: PAGE_SIZE,
          ContinuationToken: continuationToken,
        }),
      )

      for (const { Key, LastModified, Size } of page.Contents ?? []) {
        const fileName = Key?.split('/').at(-1)

        if (!Key || !fileName) {
          continue
        }

        objects.push({
          fileName,
          key: Key,
          lastModified: (LastModified ?? new Date(0)).toISOString(),
          size: Size ?? 0,
        })
      }

      continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined

      if (continuationToken && objects.length >= this.maxListedObjects) {
        truncated = true
        break
      }
    } while (continuationToken)

    return { objects, truncated }
  }

  public async ping(signal?: AbortSignal) {
    await this.s3.send(new HeadBucketCommand({ Bucket: this.options.bucket }), { abortSignal: signal })
  }
}
