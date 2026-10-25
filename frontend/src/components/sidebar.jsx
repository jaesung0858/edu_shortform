import './sidebar.css';
import {NavLink} from "react-router-dom";

function Sidebar(){
    return (
        <aside className = "site-sidebar">
            <nav>
                <NavLink to='/home' className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>홈</NavLink>
                <NavLink to='/explore' className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>탐색</NavLink>
                <NavLink to='/learn/1' className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>학습</NavLink>
                <NavLink to='/myChannel' className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>내 채널</NavLink>
                <NavLink to='/myPage' className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>마이페이지</NavLink>
            </nav>
        </aside>
    )

}
export default Sidebar
