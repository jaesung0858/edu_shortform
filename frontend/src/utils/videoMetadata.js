// 영상 길이와 시작 부분의 썸네일을 읽는다.
export function readVideoMetadata(file, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('영상 읽기를 취소했습니다.', 'AbortError'))
      return
    }
    const video = document.createElement('video')
    const url = URL.createObjectURL(file)
    let finished = false
    const timer = setTimeout(() => finish(new Error('영상 정보를 읽지 못했습니다. 다른 파일을 선택해주세요.')), 15000)

    function finish(error, metadata) {
      if (finished) return
      finished = true
      clearTimeout(timer)
      signal?.removeEventListener('abort', abort)
      video.onloadedmetadata = null
      video.onseeked = null
      video.onloadeddata = null
      video.onerror = null
      video.removeAttribute('src')
      video.load()
      URL.revokeObjectURL(url)
      if (error) reject(error)
      else resolve(metadata)
    }

    function abort() {
      finish(new DOMException('영상 읽기를 취소했습니다.', 'AbortError'))
    }

    function capture() {
      if (finished || video.readyState < 2) return
      video.onseeked = null
      video.onloadeddata = null
      try {
        const width = video.videoWidth
        const height = video.videoHeight
        if (!width || !height) throw new Error('영상 화면을 읽지 못했습니다.')
        const scale = Math.min(1, 480 / width, 480 / height)
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(width * scale))
        canvas.height = Math.max(1, Math.round(height * scale))
        const context = canvas.getContext('2d')
        if (!context) throw new Error('썸네일을 만들지 못했습니다.')
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        canvas.toBlob(thumbnail => {
          if (!thumbnail || thumbnail.type !== 'image/jpeg') {
            finish(new Error('썸네일을 만들지 못했습니다.'))
          } else {
            finish(null, { seconds: Math.ceil(video.duration), thumbnail })
          }
        }, 'image/jpeg', 0.8)
      } catch (error) {
        finish(error)
      }
    }

    video.onloadedmetadata = () => {
      const seconds = video.duration
      if (!Number.isFinite(seconds) || seconds <= 0 || seconds > 2147483647) {
        finish(new Error('영상 길이가 올바르지 않습니다. 다른 파일을 선택해주세요.'))
      } else {
        const position = Math.min(0.5, seconds / 2)
        video.onseeked = () => {
          video.onloadeddata = capture
          capture()
        }
        try {
          video.currentTime = position
        } catch (error) {
          finish(error)
        }
      }
    }
    video.onerror = () => finish(new Error('영상 정보를 읽지 못했습니다. 재생 가능한 MP4 파일을 선택해주세요.'))
    signal?.addEventListener('abort', abort, { once: true })
    video.preload = 'metadata'
    video.src = url
    video.load()
  })
}
