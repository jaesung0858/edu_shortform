import Sidebar from '../components/sidebar';
import Header from '../components/header';
import {Outlet, useNavigate} from "react-router-dom";
import {useEffect, useState} from 'react';
import {getCurrentUser, logout} from '../api/auth';
import './layout.css'

function Layout(){
    const navigate = useNavigate();
    const [session, setSession] = useState({loading: true, user: null, error: ''});
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        let active = true;
        getCurrentUser()
            .then(user => active && setSession({loading: false, user, error: ''}))
            .catch(error => active && setSession({loading: false, user: null,
                error: error.response?.status === 401 ? '' : '회원 정보를 불러오지 못했습니다. 서버 연결을 확인해주세요.'}));
        return () => { active = false; };
    }, []);

    async function handleLogout() {
        if (loggingOut) return;
        setLoggingOut(true);
        try {
            await logout();
            setSession({loading: false, user: null, error: ''});
            navigate('/login', {replace: true});
        } catch {
            setSession(previous => ({...previous, error: '로그아웃하지 못했습니다. 다시 시도해주세요.'}));
        } finally {
            setLoggingOut(false);
        }
    }

    return(
    <div className="layout">
        <Header user={session.user} loading={session.loading} onLogout={handleLogout} loggingOut={loggingOut} />
        {session.error && <p role="alert" className="session-error">{session.error}</p>}
        <div className="layout-body">
            <Sidebar />
            <main className="layout-main">
                <Outlet context={session} />
            </main>
        </div>
    </div>
    )
}

export default Layout
