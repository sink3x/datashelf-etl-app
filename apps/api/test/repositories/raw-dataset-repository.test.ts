import type { ListObjectsV2Command} from '@aws-sdk/client-s3';
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { describe, expect, it, vi } from 'vitest'

import { RawDatasetRepository } from '../../src/repositories/raw-dataset-repository/raw-dataset-repository'

const page = (keys: string[], nextToken?: string) => ({
  Contents: keys.map((Key) => ({ Key, LastModified: new Date('2025-01-01T00:00:00.000Z'), Size: 10 })),
  IsTruncated: Boolean(nextToken),
  NextContinuationToken: nextToken,
})

describe('RawDatasetRepository', () => {
  it('follows continuation tokens under the configured prefix', async () => {
    const send = vi
      .fn()
      .mockResolvedValueOnce(page(['raw-data/a.csv', 'raw-data/'], 'token-2'))
      .mockResolvedValueOnce(page(['raw-data/b.json']))
    const repository = new RawDatasetRepository({ send }, { bucket: 'datashelf', prefix: 'raw-data' })

    const { objects, truncated } = await repository.list()

    expect(objects.map(({ fileName }) => fileName)).toEqual(['a.csv', 'b.json'])
    expect(truncated).toBe(false)
    expect(send).toHaveBeenCalledTimes(2)

    const [firstCommand] = send.mock.calls[0] as [ListObjectsV2Command]
    const [secondCommand] = send.mock.calls[1] as [ListObjectsV2Command]

    expect(firstCommand.input).toMatchObject({ Bucket: 'datashelf', Prefix: 'raw-data/', MaxKeys: 1000 })
    expect(secondCommand.input.ContinuationToken).toBe('token-2')
  })

  it('stops at the listing cap and reports truncation', async () => {
    const send = vi.fn().mockResolvedValue(page(['raw-data/a.csv', 'raw-data/b.csv'], 'more'))
    const repository = new RawDatasetRepository(
      { send },
      { bucket: 'datashelf', prefix: 'raw-data', maxListedObjects: 2 },
    )

    await expect(repository.list()).resolves.toMatchObject({ truncated: true })
    expect(send).toHaveBeenCalledOnce()
  })

  it('stores uploads with their content type', async () => {
    const send = vi.fn().mockResolvedValue({})
    const repository = new RawDatasetRepository({ send }, { bucket: 'datashelf', prefix: 'raw-data' })

    await repository.put({ key: 'raw-data/a.csv', body: Buffer.from('a'), contentType: 'text/csv' })

    const [command] = send.mock.calls[0] as [PutObjectCommand]

    expect(command).toBeInstanceOf(PutObjectCommand)
    expect(command.input).toMatchObject({
      Bucket: 'datashelf',
      Key: 'raw-data/a.csv',
      ContentType: 'text/csv',
    })
  })
})
