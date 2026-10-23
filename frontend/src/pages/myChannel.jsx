import { useEffect, useRef, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { createVideoCategory, createVideoTag, getVideoCategories, uploadVideo } from '../api/videos'
import { readVideoDuration } from '../utils/videoMetadata'
import VideoList from '../components/VideoList'
import './myChannel.css'

export default function MyChannel() {
    const { user, loading, error: sessionError } = useOutletContext()
    const [options, setOptions] = useState({ loading: true, categories: [], error: '' })
    const [categoryId, setCategoryId] = useState('')
    const [tagId, setTagId] = useState('')
    const [pending, setPending] = useState(false)
    const [result, setResult] = useState({ error: '', title: '' })
    const [creator, setCreator] = useState({ kind: '', name: '', pending: false, error: '' })
    const [duration, setDuration] = useState({ status: 'empty', seconds: 0, error: '' })
    const [listVersion, setListVersion] = useState(0)
    const metadataRead = useRef(null)

    useEffect(() => () => metadataRead.current?.abort(), [])

    useEffect(() => {
        if (!user) return
        let active = true
        getVideoCategories()
            .then(categories => active && setOptions({ loading: false, categories, error: '' }))
            .catch(error => active && setOptions({ loading: false, categories: [],
                error: error.response?.status === 401 ? '로그인이 만료되었습니다. 다시 로그인해주세요.'
                    : '카테고리를 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.' }))
        return () => { active = false }
    }, [user])

    async function handleFileChange(event) {
        metadataRead.current?.abort()
        const file = event.target.files?.[0]
        setResult({ error: '', title: '' })
        if (!file) {
            setDuration({ status: 'empty', seconds: 0, error: '' })
            return
        }
        if (!file.size || !file.name.toLowerCase().endsWith('.mp4') || file.size > 100 * 1024 * 1024) {
            setDuration({ status: 'error', seconds: 0, error: '100MB 이하의 MP4 영상 파일을 선택해주세요.' })
            return
        }
        const controller = new AbortController()
        metadataRead.current = controller
        setDuration({ status: 'reading', seconds: 0, error: '' })
        try {
            const seconds = await readVideoDuration(file, controller.signal)
            setDuration({ status: 'ready', seconds, error: '' })
        } catch (error) {
            if (error.name !== 'AbortError') {
                setDuration({ status: 'error', seconds: 0, error: error.message })
            }
        } finally {
            if (metadataRead.current === controller) metadataRead.current = null
        }
    }

    async function createClassification() {
        const name = creator.name.trim()
        if (!name || creator.pending || (creator.kind === 'tag' && !categoryId)) return
        setCreator(previous => ({ ...previous, pending: true, error: '' }))
        try {
            if (creator.kind === 'category') {
                const category = await createVideoCategory(name)
                setOptions(previous => ({ ...previous, categories: [...previous.categories, category] }))
                setCategoryId(String(category.categoryId))
                setTagId('')
            } else {
                const tag = await createVideoTag(categoryId, name)
                setOptions(previous => ({ ...previous, categories: previous.categories.map(category =>
                    String(category.categoryId) === categoryId ? { ...category, tags: [...category.tags, tag] } : category) }))
                setTagId(String(tag.tagId))
            }
            setCreator({ kind: '', name: '', pending: false, error: '' })
        } catch (error) {
            const kind = creator.kind === 'category' ? '카테고리' : '개념 태그'
            const status = error.response?.status
            setCreator(previous => ({ ...previous, pending: false,
                error: status === 409 ? `이미 등록된 ${kind}입니다. 목록에서 선택해주세요.`
                    : status === 401 ? '로그인이 만료되었습니다. 다시 로그인해주세요.'
                        : `등록하지 못했습니다. ${kind} 이름을 확인하고 다시 시도해주세요.` }))
        }
    }

    async function handleSubmit(event) {
        event.preventDefault()
        if (pending || creator.pending) return
        if (duration.status !== 'ready') {
            setResult({ error: '영상 길이를 확인할 수 있는 MP4 파일을 선택해주세요.', title: '' })
            return
        }
        const element = event.currentTarget
        const form = new FormData(element)
        const file = form.get('file')
        if (!file?.size || !file.name.toLowerCase().endsWith('.mp4')) {
            setResult({ error: 'MP4 영상 파일을 선택해주세요.', title: '' })
            return
        }
        if (file.size > 100 * 1024 * 1024) {
            setResult({ error: '영상 파일은 100MB 이하여야 합니다.', title: '' })
            return
        }
        setPending(true)
        setResult({ error: '', title: '' })
        try {
            const video = await uploadVideo(file, {
                title: form.get('title').trim(), description: form.get('description').trim(),
                categoryId: Number(categoryId), tagId: Number(tagId),
                durationSec: duration.seconds,
            })
            setResult({ error: '', title: video.title })
            setListVersion(value => value + 1)
            element.reset()
            setCategoryId('')
            setTagId('')
            setDuration({ status: 'empty', seconds: 0, error: '' })
            setCreator({ kind: '', name: '', pending: false, error: '' })
        } catch (error) {
            const messages = {
                400: '필수 항목과 입력한 영상 정보를 확인해주세요.',
                401: '로그인이 만료되었습니다. 다시 로그인해주세요.',
                404: '선택한 카테고리 또는 개념 태그가 없습니다. 새로고침해주세요.',
                413: '영상 파일은 100MB 이하여야 합니다.',
                415: 'MP4 영상 파일인지 확인해주세요.',
            }
            setResult({ error: messages[error.response?.status] || '영상을 등록하지 못했습니다. 잠시 후 다시 시도해주세요.', title: '' })
        } finally {
            setPending(false)
        }
    }

    if (loading) return <p className="upload-page">회원 정보를 확인하고 있습니다.</p>
    if (!user) return <section className="upload-page">
        <h2>내 채널</h2>
        <p>{sessionError || '로그인 후 영상을 업로드할 수 있습니다.'}</p>
        <Link to="/login">로그인하기</Link>
    </section>

    const categories = options.categories
    const tags = categories.find(category => String(category.categoryId) === categoryId)?.tags || []
    return <><section className="upload-page">
        <h2>영상 업로드</h2>
        <p>MP4 파일을 최대 100MB까지 등록할 수 있습니다.</p>
        {options.loading && <p role="status">카테고리를 불러오고 있습니다.</p>}
        {options.error && <p role="alert" className="upload-error">{options.error}</p>}
        {!options.loading && !options.error && categories.length === 0 && <p>새 카테고리를 추가한 뒤 개념 태그를 등록해주세요.</p>}
        <form onSubmit={handleSubmit}>
            <fieldset disabled={pending || creator.pending || options.loading}>
                <label htmlFor="video-file">영상 파일</label>
                <input id="video-file" name="file" type="file" accept="video/mp4,.mp4" required onChange={handleFileChange} />
                <div className="video-duration" role="status" aria-live="polite">
                    {duration.status === 'ready' ? `영상 길이: ${Math.floor(duration.seconds / 60)}분 ${duration.seconds % 60}초`
                        : duration.status === 'reading' ? '영상 길이를 확인하고 있습니다…'
                            : '영상을 선택하면 길이가 자동으로 표시됩니다.'}
                </div>
                {duration.error && <p role="alert" className="upload-error">{duration.error}</p>}
                <label htmlFor="video-title">제목</label>
                <input id="video-title" name="title" maxLength={100} pattern=".*\S.*" required />
                <label htmlFor="video-description">설명</label>
                <textarea id="video-description" name="description" maxLength={1000} rows={4} />
                <label htmlFor="video-category">카테고리</label>
                <div className="classification-row">
                    <select id="video-category" value={categoryId} required onChange={event => {
                        setCategoryId(event.target.value)
                        setTagId('')
                        setCreator({ kind: '', name: '', pending: false, error: '' })
                    }}>
                        <option value="">선택해주세요</option>
                        {categories.map(category => (
                            <option key={category.categoryId} value={category.categoryId}>{category.name}</option>
                        ))}
                    </select>
                    <button type="button" onClick={() => setCreator({ kind: 'category', name: '', pending: false, error: '' })}>
                        새 카테고리
                    </button>
                </div>
                <label htmlFor="video-tag">개념 태그</label>
                <div className="classification-row">
                    <select id="video-tag" value={tagId} required disabled={!categoryId} onChange={event => setTagId(event.target.value)}>
                        <option value="">선택해주세요</option>
                        {tags.map(tag => (
                            <option key={tag.tagId} value={tag.tagId}>{tag.name}</option>
                        ))}
                    </select>
                    <button type="button" disabled={!categoryId} onClick={() => setCreator({ kind: 'tag', name: '', pending: false, error: '' })}>
                        새 태그
                    </button>
                </div>
                {categoryId && tags.length === 0 && <p>선택한 카테고리에 사용할 태그를 추가해주세요.</p>}
                {creator.kind && <div className="classification-create">
                    <label htmlFor="classification-name">새 {creator.kind === 'category' ? '카테고리' : '개념 태그'} 이름</label>
                    <div className="classification-row">
                        <input id="classification-name" value={creator.name} maxLength={creator.kind === 'category' ? 30 : 50}
                            onChange={event => setCreator(previous => ({ ...previous, name: event.target.value, error: '' }))} />
                        <button type="button" disabled={!creator.name.trim()} onClick={createClassification}>
                            {creator.pending ? '추가 중…' : '추가'}
                        </button>
                        <button type="button" onClick={() => setCreator({ kind: '', name: '', pending: false, error: '' })}>
                            취소
                        </button>
                    </div>
                    {creator.error && <p role="alert" className="upload-error">{creator.error}</p>}
                </div>}
                <button type="submit" disabled={duration.status !== 'ready' || !categoryId || !tagId}>
                    {pending ? '업로드 중…' : '영상 등록'}
                </button>
            </fieldset>
        </form>
        {result.error && <p role="alert" className="upload-error">{result.error}</p>}
        {result.title && <p role="status" className="upload-success">「{result.title}」 영상이 등록되었습니다.</p>}
    </section>
    <section className="channel-videos">
        <h2>내 영상</h2>
        <VideoList key={listVersion} mine />
    </section></>
}
