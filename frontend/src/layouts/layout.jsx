import Sidebar from '../components/sidebar';
import Header from '../components/header';
import {Outlet} from "react-router-dom";
import './layout.css'

function layout(){
    return(
    <div className="layout">
        <header className='header'><Header /></header>
        <div className="body">
            <aside className='sidebar'><Sidebar /></aside>
            <main className="main">
                <Outlet />
            </main>
        </div>
    </div>
    )
}

export default layout