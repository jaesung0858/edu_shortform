import {useState, useEffect} from "react"
import './home.css'
import img from '../assets/video.png'

function home(){
    const [videos, setVideos] = useState([ { id: 1, title: "React 기초 배우기", like: 120, look: 1500, creator: "김철수", category: "개발", thumbnail:img },
    { id: 2, title: "면접 자기소개 잘하는 법", like: 85, look: 980, creator: "이영희", category: "취업", thumbnail:img},
    { id: 3, title: "JavaScript 핵심 문법", like: 230, look: 3200, creator: "박민수", category: "개발" , thumbnail:img},
    { id: 4, title: "직장인 이메일 작성법", like: 65, look: 750, creator: "최지은", category: "직장생활" , thumbnail:img},
    { id: 5, title: "SQL 기본 개념 정리", like: 175, look: 2100, creator: "정우진", category: "개발" , thumbnail:img},
    { id: 6, title: "이력서 작성 꿀팁", like: 310, look: 4500, creator: "한수빈", category: "취업" , thumbnail:img},
    { id: 7, title: "엑셀 함수 3분 정리", like: 145, look: 1800, creator: "오세훈", category: "업무스킬" , thumbnail:img},
    { id: 8, title: "효율적인 시간 관리 방법", like: 95, look: 1200, creator: "윤하늘", category: "자기계발" , thumbnail:img},
    { id: 9, title: "Python 입문 가이드", like: 270, look: 3900, creator: "서준호", category: "개발" , thumbnail:img},
    { id: 10, title: "신입사원이 알아야 할 보고법", like: 190, look: 2600, creator: "강다은", category: "직장생활" , thumbnail:img}]);
        /*샘플 데이터*/
    const [filter, setFilter] =useState("전체");

    function filterVideo(filter){
        if (filter == "전체")
            return videos;
        return videos.filter((video)=> filter===video.category);
        
    }

    /*useEffect(() => {
        fetch("....")
        .then(response => response.json())
        .then(data => setVideos(data))
    },[]);*/ //나중에 api랑 연결

    return (
        <div>

            <div className="category">
                <button onClick={()=>setFilter("전체")}>전체</button>
                {[...new Set(videos.map((video)=>video.category))].map((category) =>(
                    <div key={category}><button onClick={()=>setFilter(category)}>{category}</button></div>))}
                
            </div>
            <div className="video-zone">
                
                {filterVideo(filter).map((video) => (
                    <div className="video" key={video.id}>
                        <img src={video.thumbnail} alt="영상썸네일"/>
                        <h3>{video.title}</h3>
                        <p>조회수: {video.look}</p><p>좋아요: {video.like}</p>
                        <h4>{video.creator}</h4>
                    </div>))}

            </div>
        </div>
    )
}

export default home