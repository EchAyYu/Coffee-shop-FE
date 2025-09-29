export default function Footer(){
  return (
    <footer className="bg-coffee text-cream mt-10">
      <div className="container-lg py-8 text-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="font-semibold mb-2">About</div>
            <p>Thương hiệu cà phê theo phong cách Highlands.</p>
          </div>
          <div>
            <div className="font-semibold mb-2">Menu</div>
            <ul className="space-y-1">
              <li>Cà phê</li><li>Trà</li><li>Freeze</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">Support</div>
            <ul className="space-y-1">
              <li>Đặt bàn</li><li>Giao hàng</li><li>Liên hệ</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-2">Policies</div>
            <ul className="space-y-1">
              <li>Privacy</li><li>Terms</li>
            </ul>
          </div>
        </div>
        <div className="mt-6 opacity-80">© {new Date().getFullYear()} Highlands-style Coffee</div>
      </div>
    </footer>
  )
}