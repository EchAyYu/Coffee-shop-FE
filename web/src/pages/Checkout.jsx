export default function Checkout(){
  return (
    <section className="container-lg py-8">
      <h1 className="text-2xl font-bold mb-4">Thanh toán</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-4">Thông tin nhận hàng (Họ tên, SĐT, địa chỉ...)</div>
        <div className="card p-4">Đơn hàng của bạn (tổng tiền, mã giảm giá, phương thức thanh toán)</div>
      </div>
      <button className="btn mt-4">Đặt hàng</button>
    </section>
  )
}