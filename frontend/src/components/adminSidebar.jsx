import { NavLink } from 'react-router-dom'

const videoManagementLabel = '\uC601\uC0C1 \uAD00\uB9AC'

export default function AdminSidebar() {
  return (
    <aside className="site-sidebar" aria-label="\uAD00\uB9AC\uC790 \uBA54\uB274">
      <nav>
        <NavLink
          to="/admin/videos"
          end
          className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}
        >
          {videoManagementLabel}
        </NavLink>
      </nav>
    </aside>
  )
}
