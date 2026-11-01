// 학습 순서상 다음 영상 고르기. 화면·axios와 떼어 둬서 node --test로 바로 테스트할 수 있다.

// 목록 API를 끝없이 넘기지 않도록 둔 상한 (12개 × 20쪽 = 240개)
export const MAX_PAGES = 20

/**
 * fetchPage(page) → { videos: [{ videoId }], hasNext } 를 0쪽부터 넘기며 currentId 다음 영상을 찾는다.
 * - currentId가 없으면 첫 영상
 * - currentId가 마지막이면 null
 * - 목록에 currentId가 없으면(숨김 영상 등) 첫 영상부터 다시 시작
 */
export async function findNextVideoId(fetchPage, currentId, maxPages = MAX_PAGES) {
  let found = currentId == null
  let firstId = null
  for (let page = 0; page < maxPages; page++) {
    const { videos, hasNext } = await fetchPage(page)
    for (const { videoId } of videos) {
      if (found) return videoId
      if (firstId == null) firstId = videoId
      if (videoId === Number(currentId)) found = true
    }
    if (!hasNext) break
  }
  return found ? null : firstId
}
