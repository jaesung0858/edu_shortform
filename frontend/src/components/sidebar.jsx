import './sidebar.css';
import {NavLink} from "react-router-dom";

function sidebar(){
    return (
        <aside className = "sidebar">
            <nav>
                <NavLink to='/home'>홈</NavLink>
                <NavLink to='/explore'>탐색</NavLink>
                <NavLink to='/myChannel'>내 채널</NavLink>
                <NavLink to='/myPage'>마이페이지</NavLink>
            </nav>
        </aside>
    )

}
export default sidebar