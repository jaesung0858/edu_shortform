import './sidebar.css';
import {NavLink} from "react-router-dom";

function Sidebar({ user }){
    return (
        <aside className = "site-sidebar">
            <nav>
                <NavLink to='/home' className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>홈</NavLink>
                <NavLink to='/explore' className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>탐색</NavLink>
                <NavLink to='/myChannel' className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>내 채널</NavLink>
                <NavLink to='/myPage' className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>마이페이지</NavLink>
                {user?.role === 'ADMIN' && (
                    <NavLink to='/admin/videos' className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
                        {'\uC601\uC0C1 \uAD00\uB9AC'}
                    </NavLink>
                )}
            </nav>
        </aside>
    )

}
export default Sidebar
