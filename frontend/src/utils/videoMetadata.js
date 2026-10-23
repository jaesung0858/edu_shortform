// 영상 길이를 초 단위로 읽는다.
export function readVideoDuration(file, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('영상 읽기를 취소했습니다.', 'AbortError'))
      return
    }
    const video = document.createElement('video')
    const url = URL.createObjectURL(file)
    let finished = false
    const timer = setTimeout(() => finish(new Error('영상 길이를 읽지 못했습니다. 다른 파일을 선택해주세요.')), 15000)

    function finish(error, seconds) {
      if (finished) return
      finished = true
      clearTimeout(timer)
      signal?.removeEventListener('abort', abort)
      video.onloadedmetadata = null
      video.onerror = null
      video.removeAttribute('src')
      video.load()
      URL.revokeObjectURL(url)
      if (error) reject(error)
      else resolve(Math.ceil(seconds))
    }

    function abort() {
      finish(new DOMException('영상 읽기를 취소했습니다.', 'AbortError'))
    }

    video.onloadedmetadata = () => {
      const seconds = video.duration
      if (!Number.isFinite(seconds) || seconds <= 0 || seconds > 2147483647) {
        finish(new Error('영상 길이가 올바르지 않습니다. 다른 파일을 선택해주세요.'))
      } else {
        finish(null, seconds)
      }
    }
    video.onerror = () => finish(new Error('영상 정보를 읽지 못했습니다. 재생 가능한 MP4 파일을 선택해주세요.'))
    signal?.addEventListener('abort', abort, { once: true })
    video.preload = 'metadata'
    video.src = url
    video.load()
  })
}
