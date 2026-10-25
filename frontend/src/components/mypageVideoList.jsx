import './mypageVideoList.css'
import clickVideo from './clickVideo'
import { useNavigate } from 'react-router-dom';

function mypageVideoList({title, videos}){

    const navigate = useNavigate();
    
    return(
        <section className="video-list-section">
            <h3>{title}</h3>
            <div className="video-list">
                {videos.map((video) => (<div className="video-item" key={video.id}>
                    <img src={video.thumbnail} alt={video.title}  onClick={() => clickVideo(navigate,video)}/>
                    <p>{video.title}</p>
                    </div>
                ))}
            </div>
        </section>
    )

}
export default mypageVideoList