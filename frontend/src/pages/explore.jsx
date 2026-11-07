import { useSearchParams } from 'react-router-dom'
import VideoList from '../components/VideoList'
import './explore.css'

export default function Explore() {

    const [searchParams] = useSearchParams()
    const keyword = searchParams.get('q') || ''

    return <VideoList keyword={keyword}/>
}
