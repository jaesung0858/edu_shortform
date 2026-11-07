import { afterEach, beforeEach, mock, test } from 'node:test'
import assert from 'node:assert/strict'
import { setImmediate } from 'node:timers'
import { readVideoMetadata } from './videoMetadata.js'

let originalDocument
let media
let mode
let seconds
let revoke
let canvas
let encodedCallback
let jpeg

beforeEach(() => {
  originalDocument = globalThis.document
  media = []
  mode = 'metadata'
  seconds = 12.4
  encodedCallback = null
  jpeg = new Blob(['jpeg'], { type: 'image/jpeg' })
  canvas = {
    getContext() { return { drawImage: (...args) => { canvas.drawn = args } } },
    toBlob(callback, type) {
      assert.equal(type, 'image/jpeg')
      if (mode === 'encoding') encodedCallback = callback
      else queueMicrotask(() => callback(mode === 'no-image' ? null : jpeg))
    },
  }
  globalThis.document = {
    createElement(tag) {
      if (tag === 'canvas') return canvas
      assert.equal(tag, 'video')
      const video = {
        src: '', duration: seconds, videoWidth: 1280, videoHeight: 720, readyState: 2,
        set currentTime(value) {
          if (mode === 'seek-error') throw new Error('seek failed')
          this.position = value
          queueMicrotask(() => this.onseeked?.())
        },
        removeAttribute() { this.src = '' },
        load() {
          if (!this.src) return
          if (mode !== 'pending' && mode !== 'error') queueMicrotask(() => this.onloadedmetadata?.())
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

test('captures at half a second, scales the frame, and releases the source URL', async () => {
  const result = await readVideoMetadata(new Blob(['video']))
  assert.equal(result.seconds, 13)
  assert.equal(result.thumbnail, jpeg)
  assert.equal(media[0].position, 0.5)
  assert.equal(canvas.width, 480)
  assert.equal(canvas.height, 270)
  assert.deepEqual(canvas.drawn, [media[0], 0, 0, 480, 270])
  assert.equal(revoke.mock.callCount(), 1)
  assert.equal(media[0].src, '')
  assert.equal(media[0].onseeked, null)
})

test('captures very short clips before their end', async () => {
  seconds = 0.2
  const result = await readVideoMetadata(new Blob(['short video']))
  assert.equal(media[0].position, 0.1)
  assert.equal(result.seconds, 1)
})

test('rejects invalid or unknown durations', async () => {
  for (const value of [0, -1, Infinity, NaN, 2147483648]) {
    seconds = value
    await assert.rejects(readVideoMetadata(new Blob(['video'])), /영상 길이가 올바르지/)
  }
  assert.equal(revoke.mock.callCount(), 5)
})

test('reports a media error and releases the source URL', async () => {
  mode = 'error'
  await assert.rejects(readVideoMetadata(new Blob(['video'])), /영상 정보를 읽지 못/)
  assert.equal(revoke.mock.callCount(), 1)
})

test('cancels a previous read and allows another file', async () => {
  mode = 'pending'
  const controller = new AbortController()
  const pending = readVideoMetadata(new Blob(['video']), controller.signal)
  controller.abort()
  await assert.rejects(pending, { name: 'AbortError' })
  mode = 'metadata'
  seconds = 20
  assert.equal((await readVideoMetadata(new Blob(['next video']))).seconds, 20)
  assert.equal(revoke.mock.callCount(), 2)
})

test('ignores a thumbnail callback after cancellation', async () => {
  mode = 'encoding'
  const controller = new AbortController()
  const pending = readVideoMetadata(new Blob(['video']), controller.signal)
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(typeof encodedCallback, 'function')
  controller.abort()
  encodedCallback(jpeg)
  await assert.rejects(pending, { name: 'AbortError' })
  assert.equal(revoke.mock.callCount(), 1)
})

test('rejects a failed image encoding', async () => {
  mode = 'no-image'
  await assert.rejects(readVideoMetadata(new Blob(['video'])), /썸네일을 만들지 못/)
  assert.equal(revoke.mock.callCount(), 1)
})

test('releases the source URL if seeking fails', async () => {
  mode = 'seek-error'
  await assert.rejects(readVideoMetadata(new Blob(['video'])), /seek failed/)
  assert.equal(revoke.mock.callCount(), 1)
})

test('times out unreadable video information', async context => {
  context.mock.timers.enable({ apis: ['setTimeout'] })
  mode = 'pending'
  const pending = readVideoMetadata(new Blob(['video']))
  context.mock.timers.tick(15000)
  await assert.rejects(pending, /영상 정보를 읽지 못/)
  assert.equal(revoke.mock.callCount(), 1)
})
