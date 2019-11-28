import { Response } from 'node-fetch'
import csv = require('fast-csv')
import cacach = require('cacache')
import fetch from 'node-fetch'
import log = require('loglevel')
import PQueue from 'p-queue'

const cachePath = './swh.cache'

export function processLink(id: number, url: string): Promise<boolean | string> {
  log.trace('processing', { id: id, url: url })
  const cacheKey = `${id}`
  return cacach
    .get(cachePath, cacheKey)
    .then((x: any) => {
      return x.data
    })
    .catch(() =>
      fetch(`https://archive.softwareheritage.org/api/1/git/url/${url}/`).then((res: Response) =>
        res.text().then((text) => cacach.put(cachePath, cacheKey, text)),
      ),
    )
}

function parseCSV(res: Response): Promise<PQueue> {
  return new Promise((resolve) => {
    const stream = res.body.pipe(csv.parse({ delimiter: ';', ignoreEmpty: true }))
    const queue = new PQueue({ concurrency: 10 })
    let count = 0
    queue.on('active', () => {
      log.debug(`Working on item #${++count}.  Size: ${queue.size}  Pending: ${queue.pending}`)
    })
    stream
      .on('error', /* istanbul ignore next */ (error: Error) => console.error(error))
      .on('data', (row: [number, string]) => queue.add(() => processLink(row[0], row[1])))
      .on('end', (rowCount: number) => {
        stream.end()
        log.info(`Received ${rowCount} rows from swMATH`)
        resolve(queue)
      })
  })
}

export const swh = () =>
  fetch('http://swmath.org/SWH/')
    .then(parseCSV)
    .then((q) => q.onIdle().then(() => log.info('Processing finished')))

export const deleteCacheEntry = (id: number) => cacach.rm.entry(cachePath, `${id}`)
