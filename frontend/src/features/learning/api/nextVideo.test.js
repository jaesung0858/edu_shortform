// 실행: node --test src/features/learning/api/nextVideo.test.js
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { findNextVideoId } from './nextVideo.js'

// 12개씩 나눠 주는 GET /api/videos 흉내. 호출한 쪽 번호를 기록한다.
function pager(ids, size = 12) {
  const calls = []
  const fetchPage = async (page) => {
    calls.push(page)
    return {
      videos: ids.slice(page * size, (page + 1) * size).map((videoId) => ({ videoId })),
      hasNext: (page + 1) * size < ids.length,
    }
  }
  return { fetchPage, calls }
}

test('같은 쪽 안에서 다음 영상을 고른다', async () => {
  const { fetchPage } = pager([30, 20, 10])
  assert.equal(await findNextVideoId(fetchPage, 20), 10)
})

test('videoId가 문자열이어도 찾는다', async () => {
  const { fetchPage } = pager([30, 20, 10])
  assert.equal(await findNextVideoId(fetchPage, '30'), 20)
})

test('쪽 경계를 넘어 다음 쪽 첫 영상을 고른다', async () => {
  const ids = Array.from({ length: 13 }, (_, i) => 100 - i) // 100..88
  const { fetchPage, calls } = pager(ids)
  assert.equal(await findNextVideoId(fetchPage, 89), 88)
  assert.deepEqual(calls, [0, 1])
})

test('마지막 영상이면 null', async () => {
  const { fetchPage } = pager([3, 2, 1])
  assert.equal(await findNextVideoId(fetchPage, 1), null)
})

test('currentId가 없으면 첫 영상', async () => {
  const { fetchPage, calls } = pager([3, 2, 1])
  assert.equal(await findNextVideoId(fetchPage, null), 3)
  assert.deepEqual(calls, [0])
})

test('목록에 없는 영상이면 첫 영상으로', async () => {
  const { fetchPage } = pager([3, 2, 1])
  assert.equal(await findNextVideoId(fetchPage, 999), 3)
})

test('목록이 비어 있으면 null', async () => {
  const { fetchPage } = pager([])
  assert.equal(await findNextVideoId(fetchPage, 1), null)
  assert.equal(await findNextVideoId(fetchPage, null), null)
})

test('hasNext가 계속 true여도 상한 쪽수에서 멈춘다', async () => {
  const calls = []
  const endless = async (page) => {
    calls.push(page)
    return { videos: [{ videoId: 1000 + page }], hasNext: true }
  }
  assert.equal(await findNextVideoId(endless, 1, 5), 1000)
  assert.equal(calls.length, 5)
})
