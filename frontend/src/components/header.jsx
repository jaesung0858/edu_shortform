import './header.css'
import {Link} from "react-router-dom"
import {useState} from "react"
import logo from '../assets/logo.png'

function Header(){
    const [search, setSearch]= useState("");
    const id="홍길동";
    return(

        <header className="site-header">
            <Link to='/home'><img src={logo}  alt="로고" className='logo'/></Link>
            <div className='searchInput'>
            <input type="text" placeholder='검색어를 입력하세요' value={search} onChange={(e) => setSearch(e.target.value)}/>
            <button onClick={()=> console.log(search)}>검색</button>
            </div>
            <div className='headId'> {id}님 반갑습니다</div>
            <button className='logout'onClick={()=>console.log("logout")}>로그아웃</button>
        </header>
    )
}
export default Header
