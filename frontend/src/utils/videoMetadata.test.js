import { afterEach, beforeEach, mock, test } from 'node:test'
import assert from 'node:assert/strict'
import { readVideoDuration } from './videoMetadata.js'

let originalDocument
let media
let mode
let seconds
let revoke

beforeEach(() => {
  originalDocument = globalThis.document
  media = []
  mode = 'metadata'
  seconds = 12.4
  globalThis.document = {
    createElement(tag) {
      assert.equal(tag, 'video')
      const video = {
        src: '',
        duration: seconds,
        removeAttribute() { this.src = '' },
        load() {
          if (!this.src) return
          if (mode === 'metadata') queueMicrotask(() => this.onloadedmetadata?.())
          if (mode === 'error') queueMicrotask(() => this.onerror?.())
        },
      }
      media.push(video)
      return video
    },
  }
  mock.method(URL, 'createObjectURL', () => `blob:test-${media.length}`)
  revoke = mock.method(URL, 'revokeObjectURL', () => {})
})

afterEach(() => {
  if (originalDocument === undefined) delete globalThis.document
  else globalThis.document = originalDocument
  mock.restoreAll()
})

test('reads duration in whole seconds and releases the object URL', async () => {
  assert.equal(await readVideoDuration(new Blob(['video'])), 13)
  assert.equal(revoke.mock.callCount(), 1)
  assert.equal(media[0].src, '')
  assert.equal(media[0].onloadedmetadata, null)
})

test('rejects invalid or unknown durations', async () => {
  for (const value of [0, -1, Infinity, NaN, 2147483648]) {
    seconds = value
    await assert.rejects(readVideoDuration(new Blob(['video'])), /영상 길이가 올바르지/)
  }
  assert.equal(revoke.mock.callCount(), 5)
})

test('reports a media error and releases the object URL', async () => {
  mode = 'error'
  await assert.rejects(readVideoDuration(new Blob(['video'])), /영상 정보를 읽지 못/)
  assert.equal(revoke.mock.callCount(), 1)
})

test('cancels a previous file read without keeping the object URL', async () => {
  mode = 'pending'
  const controller = new AbortController()
  const pending = readVideoDuration(new Blob(['video']), controller.signal)
  controller.abort()
  await assert.rejects(pending, { name: 'AbortError' })
  assert.equal(revoke.mock.callCount(), 1)
  mode = 'metadata'
  seconds = 20
  assert.equal(await readVideoDuration(new Blob(['next video'])), 20)
})

test('times out unreadable metadata and releases the object URL', async context => {
  context.mock.timers.enable({ apis: ['setTimeout'] })
  mode = 'pending'
  const pending = readVideoDuration(new Blob(['video']))
  context.mock.timers.tick(15000)
  await assert.rejects(pending, /영상 길이를 읽지 못/)
  assert.equal(revoke.mock.callCount(), 1)
})
