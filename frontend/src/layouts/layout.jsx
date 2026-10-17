import Sidebar from '../components/sidebar';
import Header from '../components/header';
import {Outlet} from "react-router-dom";
import './layout.css'

function Layout(){
    return(
    <div className="layout">
        <Header />
        <div className="layout-body">
            <Sidebar />
            <main className="layout-main">
                <Outlet />
            </main>
        </div>
    </div>
    )
}

export default Layout
