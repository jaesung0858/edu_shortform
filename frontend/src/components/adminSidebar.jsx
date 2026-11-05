import './adminSidebar.css';
import {NavLink} from "react-router-dom";

function AdminSidebar(){
    return (
        <aside className = "site-sidebar">
            <nav>
                <NavLink to='/admin/users' className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>회원관리</NavLink>
                <NavLink to='/home' className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>이부분에 연결하시면 됩니다.</NavLink>
            </nav>
        </aside>
    )

}
export default AdminSidebar
