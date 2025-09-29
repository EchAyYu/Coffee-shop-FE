import { useState } from 'react'
import { api } from '../api'

export default function Reservation(){
  const [form, setForm] = useState({ name: '', phone: '', date: '', people: 2 })
  const [ok, setOk] = useState(null)

  function submit(e){
    e.preventDefault()
    api.post('/reservations', form).then(r => setOk(r.data))
  }

  return (
    <section className="container-lg py-8">
      <h1 className="text-2xl font-bold mb-4">Đặt bàn</h1>
      <form onSubmit={submit} className="card p-4 grid grid-cols-1 gap-3 max-w-lg">
        <input required placeholder="Họ tên" className="border rounded px-3 py-2" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <input required placeholder="Số điện thoại" className="border rounded px-3 py-2" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})}/>
        <input required type="datetime-local" className="border rounded px-3 py-2" value={form.date} onChange={e=>setForm({...form, date:e.target.value})}/>
        <input type="number" min="1" className="border rounded px-3 py-2" value={form.people} onChange={e=>setForm({...form, people:Number(e.target.value)})}/>
        <button className="btn">Xác nhận đặt bàn</button>
      </form>
      {ok && <div className="mt-4 text-green-700">Đặt bàn thành công! Mã: #{ok.id}</div>}
    </section>
  )
}