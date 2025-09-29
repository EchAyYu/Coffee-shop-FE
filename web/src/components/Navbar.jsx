import { Link, NavLink } from 'react-router-dom'

export default function Navbar(){
  return (
    <header className="fixed top-0 left-0 right-0 h-[var(--header-h)] bg-maroon shadow z-50">
      <div className="container-lg h-full flex items-center justify-between">
        <Link to="/" className="text-cream font-bold tracking-wide text-lg">Highlands-style</Link>
        <nav className="flex gap-6">
          <NavLink to="/menu" className="nav-link">Menu</NavLink>
          <NavLink to="/reservation" className="nav-link">Reservation</NavLink>
          <NavLink to="/cart" className="nav-link">Cart</NavLink>
        </nav>
      </div>
    </header>
  )
}