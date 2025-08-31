"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Slot = { start: string; end: string; available: boolean; staff_id?: number; service_id?: number; duration_minutes?: number };

export default function Home() {
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [date, setDate] = useState<string>("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selected, setSelected] = useState<Slot | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  // โหลดรายการบริการ
  useEffect(() => {
    axios.get(`${API}/services`)
      .then(res => setServices(res.data))
      .catch(() => setServices([]));
  }, []);

  // แก้ไขการเรียก slots API
  useEffect(() => {
    if (!date || !selectedService) return;
    axios.get(`${API}/appointments/slots`, { 
      params: { 
        d: date,
        service_id: selectedService.id 
      } 
    })
      .then(res => setSlots(res.data.slots || []))
      .catch(() => setSlots([]));
  }, [date, selectedService]);

  const canSubmit = useMemo(() => !!(date && selectedService && selected && name && phone), [date, selectedService, selected, name, phone]);

  const submit = async () => {
    if (!selected || !selectedService) return;
    const payload = {
      customer_name: name,
      customer_phone: phone,
      date,
      start_time: selected.start,
      end_time: selected.end,
      service_id: selectedService.id,
      staff_id: selected.staff_id,
      note,
      status: "pending"
    };
    try {
      const res = await axios.post(`${API}/appointments`, payload);
      setBookingDetails({
        id: res.data.id,
        status: res.data.status,
        service: selectedService.name,
        date: date,
        time: `${selected.start} - ${selected.end}`,
        customer: name
      });
      setShowSuccessModal(true);
      setSelected(null); setName(""); setPhone(""); setNote("");
      // refresh slots
      const s = await axios.get(`${API}/appointments/slots`, { 
        params: { 
          d: date,
          service_id: selectedService.id 
        } 
      });
      setSlots(s.data.slots || []);
    } catch(e: any) {
      setMessage(e?.response?.data?.detail || "เกิดข้อผิดพลาด");
    }
  };

  const closeModal = () => {
    setShowSuccessModal(false);
    setBookingDetails(null);
  };

  return (
    <div className="space-y-6">


      {/* เลือกบริการ */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">เลือกบริการ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {services.map((service) => (
            <button
              key={service.id}
              className={`selectable ${selectedService?.id === service.id ? "ring-2 ring-black" : ""}`}
              onClick={() => setSelectedService(service)}
            >
              <div className="font-medium">{service.name}</div>
              <div className="text-sm text-gray-600">{service.duration_minutes} นาที</div>
              {service.price && <div className="text-sm text-green-600">฿{service.price}</div>}
            </button>
          ))}
        </div>
      </div>

      {/* เลือกวันที่ (แสดงเฉพาะเมื่อเลือกบริการแล้ว) */}
      {selectedService && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">เลือกวันที่</h2>
          <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} />
        </div>
      )}

      {date && selectedService && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">ช่วงเวลาที่ว่าง</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {slots.map((s, i) => (
              <button key={i}
                disabled={!s.available}
                className={`selectable ${selected?.start === s.start ? "ring-2 ring-black" : ""} ${s.available ? "" : "opacity-50 cursor-not-allowed"}`}
                onClick={() => s.available && setSelected(s)}>
                {s.start} - {s.end}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">ข้อมูลผู้จอง</h2>
        <div className="grid gap-3">
          <input className="input" placeholder="ชื่อ-สกุล" value={name} onChange={e => setName(e.target.value)} />
          <input className="input" placeholder="เบอร์โทร" value={phone} onChange={e => setPhone(e.target.value)} />
          <textarea className="input" placeholder="หมายเหตุ (ถ้ามี)" value={note} onChange={e => setNote(e.target.value)} />
          <button className="btn border" disabled={!canSubmit} onClick={submit}>ยืนยันการจอง</button>
        </div>
        {message && <p className="mt-3">{message}</p>}
      </div>

      {/* Modal แจ้งเตือนการจองสำเร็จ */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              {/* ไอคอนสำเร็จ */}
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">จองสำเร็จ! 🎉</h3>
              
              <div className="text-sm text-gray-600 space-y-2 mb-6">
                <p><span className="font-medium">เลขที่การจอง:</span> #{bookingDetails?.id}</p>
                <p><span className="font-medium">บริการ:</span> {bookingDetails?.service}</p>
                <p><span className="font-medium">วันที่:</span> {bookingDetails?.date}</p>
                <p><span className="font-medium">เวลา:</span> {bookingDetails?.time}</p>
                <p><span className="font-medium">ชื่อ:</span> {bookingDetails?.customer}</p>
                <p><span className="font-medium">สถานะ:</span> <span className="text-blue-600">{bookingDetails?.status}</span></p>
              </div>
              
              <button
                onClick={closeModal}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
