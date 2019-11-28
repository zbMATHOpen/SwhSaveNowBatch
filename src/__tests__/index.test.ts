import { swh, deleteCacheEntry, processLink } from '..'
import * as log from 'loglevel'

log.setDefaultLevel('info')
jest.setTimeout(300000) // Allow 5 min to process all links

test('Process pseudo-link', async () => processLink(0, 'https://github.com/fairmath/SwhSaveNowBatch.git'))
test('Process pseudo-link again', async () => processLink(0, 'https://github.com/fairmath/SwhSaveNowBatch.git'))
test('Delete pseudo-link', async () => deleteCacheEntry(0))

test('Get swh list again', async () => swh())
