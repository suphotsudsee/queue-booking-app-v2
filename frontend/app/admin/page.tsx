"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Appointment = {
  id: number;
  customer_name: string;
  customer_phone: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  note?: string;
};

export default function Admin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [msg, setMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"appointments" | "business-hours" | "holidays" | "services" | "staff">("appointments");
  const [businessHours, setBusinessHours] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);

  // Modal states
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);

  // State สำหรับฟอร์มเพิ่มบริการ
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceDescription, setNewServiceDescription] = useState("");
  const [newServiceDuration, setNewServiceDuration] = useState(30);
  const [newServicePrice, setNewServicePrice] = useState(0);

  // State สำหรับฟอร์มแก้ไขบริการ
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [editServiceName, setEditServiceName] = useState("");
  const [editServiceDescription, setEditServiceDescription] = useState("");
  const [editServiceDuration, setEditServiceDuration] = useState(30);
  const [editServicePrice, setEditServicePrice] = useState(0);

  // State สำหรับฟอร์มเพิ่มพนักงาน
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffPhone, setNewStaffPhone] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");

  // State สำหรับฟอร์มแก้ไขพนักงาน
  const [editingStaffId, setEditingStaffId] = useState<number | null>(null);
  const [editStaffName, setEditStaffName] = useState("");
  const [editStaffPhone, setEditStaffPhone] = useState("");
  const [editStaffEmail, setEditStaffEmail] = useState("");
  const [editStaffIsActive, setEditStaffIsActive] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("jwt");
    if (t) setToken(t);
  }, []);

  const authHeader = () => token ? { Authorization: `Bearer ${token}` } : {};

  const login = async () => {
    try {
      const params = new URLSearchParams();
      params.append("username", email);
      params.append("password", password);
      params.append("grant_type", "password");
      const res = await axios.post(`${API}/auth/login`, params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
      });
      
      const token = res.data.access_token;
      setToken(token);
      localStorage.setItem("jwt", token);
      setMsg("เข้าสู่ระบบสำเร็จ");
      
      // เรียก load() และ loadServices() หลังจากได้ token แล้ว
      await load();
      await loadServices();
      await loadStaff(); // โหลดพนักงานหลังจาก login
      
    } catch (e: any) {
      setMsg(e?.response?.data?.detail || "เข้าสู่ระบบไม่สำเร็จ");
    }
  };

  const load = async () => {
    // ตรวจสอบ token ก่อนเรียก API
    const currentToken = token || localStorage.getItem("jwt");
    if (!currentToken) return;
    
    try {
      const res = await axios.get(`${API}/appointments`, {
        params: { date_from: dateFrom || undefined, date_to: dateTo || undefined },
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      setAppointments(res.data || []);
    } catch (e: any) {
      setMsg(e?.response?.data?.detail || "โหลดรายการไม่สำเร็จ");
    }
  };

  const act = async (id: number, action: "confirm" | "cancel") => {
    try {
      await axios.post(`${API}/appointments/${id}/${action}`, {}, { headers: authHeader() });
      setMsg(action === "confirm" ? "ยืนยันคิวสำเร็จ" : "ยกเลิกคิวสำเร็จ");
      load();
    } catch (e: any) {
      setMsg(e?.response?.data?.detail || "ทำรายการไม่สำเร็จ");
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("jwt");
    setAppointments([]);
    setDateFrom("");
    setDateTo("");
    setMsg("ออกจากระบบสำเร็จ");
  };

  const loadBusinessHours = async () => {
    try {
      const res = await axios.get(`${API}/settings/business-hours`, { headers: authHeader() });
      setBusinessHours(res.data || []);
    } catch (e: any) {
      setMsg(e?.response?.data?.detail || "โหลดเวลาทำการไม่สำเร็จ");
    }
  };

  const saveBusinessHours = async () => {
    try {
      await axios.post(`${API}/settings/business-hours`, businessHours, { headers: authHeader() });
      setMsg("บันทึกเวลาทำการสำเร็จ");
    } catch (e: any) {
      setMsg(e?.response?.data?.detail || "บันทึกเวลาทำการไม่สำเร็จ");
    }
  };

  const loadHolidays = async () => {
    try {
      const res = await axios.get(`${API}/settings/holidays`, { headers: authHeader() });
      setHolidays(res.data || []);
    } catch (e: any) {
      setMsg(e?.response?.data?.detail || "โหลดวันหยุดไม่สำเร็จ");
    }
  };

  const saveHolidays = async () => {
    try {
      await axios.post(`${API}/settings/holidays`, holidays, { headers: authHeader() });
      setMsg("บันทึกวันหยุดสำเร็จ");
    } catch (e: any) {
      setMsg(e?.response?.data?.detail || "บันทึกวันหยุดไม่สำเร็จ");
    }
  };

  const loadServices = async () => {
    console.log("เริ่มต้น loadServices...");
    try {
      console.log("กำลังเรียก API:", `${API}/services`);
      const res = await axios.get(`${API}/services`, { headers: authHeader() });
      console.log("API Response:", res);
      setServices(res.data || []);
      console.log("โหลดบริการสำเร็จ:", res.data);
      console.log("จำนวนบริการ:", res.data?.length || 0);
    } catch (e: any) {
      const errorMsg = e?.response?.data?.detail || "โหลดรายการบริการไม่สำเร็จ";
      setMsg(errorMsg);
      console.error("โหลดบริการล้มเหลว:", errorMsg);
      console.error("Error details:", e);
    }
  };

  const loadStaff = async () => {
    console.log("เริ่มต้น loadStaff...");
    try {
      console.log("กำลังเรียก API:", `${API}/staff`);
      const res = await axios.get(`${API}/staff`, { headers: authHeader() });
      console.log("API Response:", res);
      setStaff(res.data || []);
      console.log("โหลดพนักงานสำเร็จ:", res.data);
      console.log("จำนวนพนักงาน:", res.data?.length || 0);
    } catch (e: any) {
      const errorMsg = e?.response?.data?.detail || "โหลดรายการพนักงานไม่สำเร็จ";
      setMsg(errorMsg);
      console.error("โหลดพนักงานล้มเหลว:", errorMsg);
      console.error("Error details:", e);
    }
  };

  const createService = async () => {
    try {
      const newService = {
        name: newServiceName,
        description: newServiceDescription,
        duration_minutes: newServiceDuration,
        price: newServicePrice,
        is_active: true
      };
      
      console.log("กำลังเพิ่มบริการ:", newService);
      const res = await axios.post(`${API}/services`, newService, { headers: authHeader() });
      console.log("เพิ่มบริการสำเร็จ:", res.data);
      
      setMsg("✅ เพิ่มบริการสำเร็จ");
      setNewServiceName("");
      setNewServiceDescription("");
      setNewServiceDuration(30);
      setNewServicePrice(0);
      
      // โหลดข้อมูลใหม่
      await loadServices();
    } catch (e: any) {
      const errorMsg = e?.response?.data?.detail || "เพิ่มบริการไม่สำเร็จ";
      setMsg(`❌ ${errorMsg}`);
      console.error("เพิ่มบริการล้มเหลว:", errorMsg);
    }
  };

  const updateService = async (id: number, updates: any) => {
    try {
      console.log("กำลังอัปเดตบริการ ID:", id, "ข้อมูล:", updates);
      const res = await axios.put(`${API}/services/${id}`, updates, { headers: authHeader() });
      console.log("อัปเดตบริการสำเร็จ:", res.data);
      
      setMsg("✅ อัปเดตบริการสำเร็จ");
      
      // โหลดข้อมูลใหม่
      await loadServices();
    } catch (e: any) {
      const errorMsg = e?.response?.data?.detail || "อัปเดตบริการไม่สำเร็จ";
      setMsg(`❌ ${errorMsg}`);
      console.error("อัปเดตบริการล้มเหลว:", errorMsg);
    }
  };

  const startEditService = (service: any) => {
    setEditingServiceId(service.id);
    setEditServiceName(service.name);
    setEditServiceDescription(service.description || "");
    setEditServiceDuration(service.duration_minutes);
    setEditServicePrice(service.price || 0);
  };

  const deleteService = async (id: number) => {
    try {
      console.log("กำลังลบบริการ ID:", id);
      await axios.delete(`${API}/services/${id}`, { headers: authHeader() });
      console.log("ลบบริการสำเร็จ");
      
      setMsg("✅ ลบบริการสำเร็จ");
      
      // โหลดข้อมูลใหม่
      await loadServices();
    } catch (e: any) {
      const errorMsg = e?.response?.data?.detail || "ลบบริการไม่สำเร็จ";
      setMsg(`❌ ${errorMsg}`);
      console.error("ลบบริการล้มเหลว:", errorMsg);
    }
  };

  const createStaff = async () => {
    try {
      const newStaff = {
        name: newStaffName,
        phone: newStaffPhone,
        email: newStaffEmail,
        is_active: true
      };
      console.log("กำลังเพิ่มพนักงาน:", newStaff);
      const res = await axios.post(`${API}/staff`, newStaff, { headers: authHeader() });
      console.log("เพิ่มพนักงานสำเร็จ:", res.data);
      setMsg("✅ เพิ่มพนักงานสำเร็จ");
      setNewStaffName("");
      setNewStaffPhone("");
      setNewStaffEmail("");
      await loadStaff();
    } catch (e: any) {
      const errorMsg = e?.response?.data?.detail || "เพิ่มพนักงานไม่สำเร็จ";
      setMsg(`❌ ${errorMsg}`);
      console.error("เพิ่มพนักงานล้มเหลว:", errorMsg);
    }
  };

  const updateStaff = async (id: number, updates: any) => {
    try {
      console.log("กำลังอัปเดตพนักงาน ID:", id, "ข้อมูล:", updates);
      const res = await axios.put(`${API}/staff/${id}`, updates, { headers: authHeader() });
      console.log("อัปเดตพนักงานสำเร็จ:", res.data);
      setMsg("✅ อัปเดตพนักงานสำเร็จ");
      await loadStaff();
    } catch (e: any) {
      const errorMsg = e?.response?.data?.detail || "อัปเดตพนักงานไม่สำเร็จ";
      setMsg(`❌ ${errorMsg}`);
      console.error("อัปเดตพนักงานล้มเหลว:", errorMsg);
    }
  };

  const startEditStaff = (person: any) => {
    setEditingStaffId(person.id);
    setEditStaffName(person.name);
    setEditStaffPhone(person.phone || "");
    setEditStaffEmail(person.email || "");
    setEditStaffIsActive(person.is_active);
  };

  const deleteStaff = async (id: number) => {
    try {
      console.log("กำลังลบพนักงาน ID:", id);
      await axios.delete(`${API}/staff/${id}`, { headers: authHeader() });
      console.log("ลบพนักงานสำเร็จ");
      setMsg("✅ ลบพนักงานสำเร็จ");
      await loadStaff();
    } catch (e: any) {
      const errorMsg = e?.response?.data?.detail || "ลบพนักงานไม่สำเร็จ";
      setMsg(`❌ ${errorMsg}`);
      console.error("ลบพนักงานล้มเหลว:", errorMsg);
    }
  };

  // เอา useEffect ออก เพราะจะเรียก load() หลังจาก login สำเร็จ
  // useEffect(() => {
  //   if (token) load();
  // }, [token]);

  // เพิ่ม useEffect เพื่อโหลดข้อมูลเมื่อเริ่มต้น
  useEffect(() => {
    if (token) {
      console.log("Token มีค่า, กำลังโหลดข้อมูล...");
      load();
      loadServices();
      loadStaff(); // โหลดพนักงานทุกครั้งที่เปลี่ยน tab
    } else {
      console.log("ไม่มี token");
    }
  }, [token]);

  // เพิ่ม useEffect เพื่อแสดงข้อมูลใน console เมื่อ services state เปลี่ยน
  useEffect(() => {
    console.log("Services state เปลี่ยน:", services);
    console.log("จำนวนบริการ:", services?.length || 0);
  }, [services]);

  // เพิ่ม useEffect เพื่อแสดงข้อมูลใน console เมื่อ staff state เปลี่ยน
  useEffect(() => {
    console.log("Staff state เปลี่ยน:", staff);
    console.log("จำนวนพนักงาน:", staff?.length || 0);
  }, [staff]);

  return (
    <div className="space-y-6">
      {!token && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">เข้าสู่ระบบผู้ดูแล</h2>
          <div className="grid gap-3">
            <input className="input" placeholder="อีเมล" value={email} onChange={e => setEmail(e.target.value)} />
            <input className="input" type="password" placeholder="รหัสผ่าน" value={password} onChange={e => setPassword(e.target.value)} />
            <button className="btn border" onClick={login}>เข้าสู่ระบบ</button>
          </div>
          {msg && <p className="mt-3">{msg}</p>}
        </div>
      )}

      {token && (
        <div className="space-y-6">
          {/* Tabs Navigation */}
          <div className="flex space-x-2 border-b">
            <button 
              className={`px-4 py-2 ${activeTab === "appointments" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"}`}
              onClick={() => setActiveTab("appointments")}
            >
              จัดการคิว
            </button>
            <button 
              className={`px-4 py-2 ${activeTab === "business-hours" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"}`}
              onClick={() => {
                setActiveTab("business-hours");
                loadBusinessHours();
              }}
            >
              เวลาทำการ
            </button>
            <button 
              className={`px-4 py-2 ${activeTab === "holidays" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"}`}
              onClick={() => {
                setActiveTab("holidays");
                loadHolidays();
              }}
            >
              วันหยุด
            </button>
            <button 
              className={`px-4 py-2 ${activeTab === "services" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"}`}
              onClick={() => {
                setActiveTab("services");
                loadServices();
              }}
            >
              บริการ
            </button>
            <button 
              className={`px-4 py-2 ${activeTab === "staff" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"}`}
              onClick={() => {
                setActiveTab("staff");
                loadStaff();
              }}
            >
              พนักงาน
            </button>
          </div>

          {/* Appointments Tab */}
          {activeTab === "appointments" && (
            <>
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">ค้นหาคิว</h2>
                  <button 
                    className="btn border bg-red-50 hover:bg-red-100 text-red-700" 
                    onClick={logout}
                  >
                    ออกจากระบบ
                  </button>
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  <input className="input" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                  <input className="input" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                  <button className="btn border" onClick={load}>โหลดรายการ</button>
                </div>
              </div>

              <div className="card">
                <h2 className="text-xl font-semibold mb-4">รายการจอง</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full border">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2 text-left">วันที่</th>
                        <th className="p-2 text-left">เวลา</th>
                        <th className="p-2 text-left">ลูกค้า</th>
                        <th className="p-2 text-left">เบอร์</th>
                        <th className="p-2 text-left">สถานะ</th>
                        <th className="p-2 text-left">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map((a) => (
                        <tr key={a.id} className="border-b">
                          <td className="p-2">{a.date}</td>
                          <td className="p-2">{a.start_time} - {a.end_time}</td>
                          <td className="p-2">{a.customer_name}</td>
                          <td className="p-2">{a.customer_phone}</td>
                          <td className="p-2">{a.status}</td>
                          <td className="p-2 space-x-2">
                            <button className="btn border" onClick={() => act(a.id, "confirm")}>ยืนยัน</button>
                            <button className="btn border" onClick={() => act(a.id, "cancel")}>ยกเลิก</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Business Hours Tab */}
          {activeTab === "business-hours" && (
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">จัดการเวลาทำการ</h2>
                <button 
                  className="btn border bg-red-50 hover:bg-red-100 text-red-700" 
                  onClick={logout}
                >
                  ออกจากระบบ
                </button>
              </div>
              <div className="space-y-4">
                {businessHours.map((hour, index) => (
                  <div key={index} className="grid grid-cols-4 gap-3 items-center">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"][hour.weekday]}
                      </label>
                    </div>
                    <input 
                      type="time" 
                      className="input" 
                      value={hour.open_time} 
                      onChange={(e) => {
                        const newHours = [...businessHours];
                        newHours[index].open_time = e.target.value;
                        setBusinessHours(newHours);
                      }}
                    />
                    <input 
                      type="time" 
                      className="input" 
                      value={hour.close_time} 
                      onChange={(e) => {
                        const newHours = [...businessHours];
                        newHours[index].close_time = e.target.value;
                        setBusinessHours(newHours);
                      }}
                    />
                    <input 
                      type="number" 
                      className="input" 
                      placeholder="นาที" 
                      value={hour.slot_minutes} 
                      onChange={(e) => {
                        const newHours = [...businessHours];
                        newHours[index].slot_minutes = parseInt(e.target.value);
                        setBusinessHours(newHours);
                      }}
                    />
                  </div>
                ))}
                <button className="btn border" onClick={saveBusinessHours}>บันทึกเวลาทำการ</button>
              </div>
            </div>
          )}

          {/* Holidays Tab */}
          {activeTab === "holidays" && (
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">จัดการวันหยุด</h2>
                <button 
                  className="btn border bg-red-50 hover:bg-red-100 text-red-700" 
                  onClick={logout}
                >
                  ออกจากระบบ
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    type="date" 
                    className="input" 
                    placeholder="วันที่" 
                    onChange={(e) => {
                      if (e.target.value) {
                        setHolidays([...holidays, { date: e.target.value, reason: "" }]);
                      }
                    }}
                  />
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="เหตุผล" 
                    onChange={(e) => {
                      if (holidays.length > 0) {
                        const newHolidays = [...holidays];
                        newHolidays[newHolidays.length - 1].reason = e.target.value;
                        setHolidays(newHolidays);
                      }
                    }}
                  />
                </div>
                {holidays.map((holiday, index) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded">
                    <span>{holiday.date} - {holiday.reason}</span>
                    <button 
                      className="btn border bg-red-50 hover:bg-red-100 text-red-700" 
                      onClick={() => {
                        const newHolidays = holidays.filter((_, i) => i !== index);
                        setHolidays(newHolidays);
                      }}
                    >
                      ลบ
                    </button>
                  </div>
                ))}
                <button className="btn border" onClick={saveHolidays}>บันทึกวันหยุด</button>
              </div>
            </div>
          )}

          {/* Services Tab */}
          {activeTab === "services" && (
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">จัดการบริการ</h2>
                <button 
                  className="btn border bg-red-50 hover:bg-red-100 text-red-700" 
                  onClick={logout}
                >
                  ออกจากระบบ
                </button>
              </div>
              
              {/* แสดงข้อความ */}
              {msg && (
                <div className={`mb-4 p-3 rounded-lg ${
                  msg.includes("✅")
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : msg.includes("❌")
                    ? "bg-red-50 text-red-800 border border-red-200"
                    : "bg-blue-50 text-blue-800 border border-blue-200"
                }`}>
                  {msg}
                </div>
              )}
              
              {/* ปุ่มเปิด modal เพิ่มบริการ */}
              <div className="mb-6">
                <button
                  className="btn bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => setShowAddServiceModal(true)}
                >
                  เพิ่มบริการ
                </button>
              </div>

              {/* Modal เพิ่มบริการ */}
              {showAddServiceModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  <div className="bg-white p-6 rounded-lg w-full max-w-lg">
                    <h3 className="text-lg font-medium mb-4">เพิ่มบริการใหม่</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        className="input"
                        placeholder="ชื่อบริการ (เช่น: ตัดผม, สระไดร์)"
                        value={newServiceName}
                        onChange={(e) => setNewServiceName(e.target.value)}
                      />
                      <input
                        type="text"
                        className="input"
                        placeholder="รายละเอียดบริการ"
                        value={newServiceDescription}
                        onChange={(e) => setNewServiceDescription(e.target.value)}
                      />
                      <input
                        type="number"
                        className="input"
                        placeholder="ระยะเวลา (นาที)"
                        value={newServiceDuration}
                        onChange={(e) => setNewServiceDuration(parseInt(e.target.value) || 30)}
                        min="15"
                        step="15"
                      />
                      <input
                        type="number"
                        className="input"
                        placeholder="ราคา (บาท)"
                        value={newServicePrice}
                        onChange={(e) => setNewServicePrice(parseFloat(e.target.value) || 0)}
                        min="0"
                        step="10"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="btn bg-blue-600 text-white hover:bg-blue-700"
                        onClick={async () => {
                          await createService();
                          setShowAddServiceModal(false);
                        }}
                        disabled={!newServiceName.trim()}
                      >
                        บันทึก
                      </button>
                      <button
                        className="btn border"
                        onClick={() => {
                          setShowAddServiceModal(false);
                          setNewServiceName("");
                          setNewServiceDescription("");
                          setNewServiceDuration(30);
                          setNewServicePrice(0);
                        }}
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ฟอร์มแก้ไขบริการ */}
              {editingServiceId && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-medium mb-4">แก้ไขบริการ</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      className="input"
                      placeholder="ชื่อบริการ"
                      value={editServiceName}
                      onChange={(e) => setEditServiceName(e.target.value)}
                    />
                    <input
                      type="number"
                      className="input"
                      placeholder="ระยะเวลา (นาที)"
                      value={editServiceDuration}
                      onChange={(e) => setEditServiceDuration(parseInt(e.target.value) || 0)}
                      min="15"
                      step="15"
                    />
                    <input
                      type="number"
                      className="input"
                      placeholder="ราคา (บาท)"
                      value={editServicePrice}
                      onChange={(e) => setEditServicePrice(parseFloat(e.target.value) || 0)}
                      min="0"
                      step="10"
                    />
                  </div>
                  <textarea
                    className="input mb-4"
                    placeholder="รายละเอียดบริการ"
                    value={editServiceDescription}
                    onChange={(e) => setEditServiceDescription(e.target.value)}
                  />
                  <div className="flex space-x-2">
                    <button
                      className="btn bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => {
                        updateService(editingServiceId!, {
                          name: editServiceName,
                          description: editServiceDescription,
                          duration_minutes: editServiceDuration,
                          price: editServicePrice,
                          is_active: true,
                        });
                        setEditingServiceId(null);
                      }}
                      disabled={!editServiceName.trim()}
                    >
                      บันทึก
                    </button>
                    <button
                      className="btn border"
                      onClick={() => setEditingServiceId(null)}
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              )}

              {/* รายการบริการที่มีอยู่ */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">รายการบริการ</h3>
                {services.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">ยังไม่มีบริการ</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100 text-left">
                          <th className="p-2 border">ชื่อบริการ</th>
                          <th className="p-2 border">รายละเอียด</th>
                          <th className="p-2 border">ระยะเวลา</th>
                          <th className="p-2 border">ราคา</th>
                          <th className="p-2 border">การจัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {services.map((service) => (
                          <tr key={service.id} className="bg-white">
                            <td className="p-2 border">{service.name}</td>
                            <td className="p-2 border">{service.description || "-"}</td>
                            <td className="p-2 border">{service.duration_minutes} นาที</td>
                            <td className="p-2 border">฿{service.price}</td>
                            <td className="p-2 border">
                              <div className="flex space-x-2">
                                <button
                                  className="btn border bg-yellow-50 hover:bg-yellow-100 text-yellow-700 text-sm px-3 py-1"
                                  onClick={() => startEditService(service)}
                                >
                                  แก้ไข
                                </button>
                                <button
                                  className="btn border bg-red-50 hover:bg-red-100 text-red-700 text-sm px-3 py-1"
                                  onClick={() => deleteService(service.id)}
                                >
                                  ลบ
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Staff Tab */}
          {activeTab === "staff" && (
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">จัดการพนักงาน</h2>
                <button 
                  className="btn border bg-red-50 hover:bg-red-100 text-red-700" 
                  onClick={logout}
                >
                  ออกจากระบบ
                </button>
              </div>
              
              {/* แสดงข้อความ */}
              {msg && (
                <div className={`mb-4 p-3 rounded-lg ${
                  msg.includes("✅")
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : msg.includes("❌")
                    ? "bg-red-50 text-red-800 border border-red-200"
                    : "bg-blue-50 text-blue-800 border border-blue-200"
                }`}>
                  {msg}
                </div>
              )}

              {/* ปุ่มเปิด modal เพิ่มพนักงาน */}
              <div className="mb-6">
                <button
                  className="btn bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => setShowAddStaffModal(true)}
                >
                  เพิ่มพนักงาน
                </button>
              </div>

              {/* Modal เพิ่มพนักงาน */}
              {showAddStaffModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  <div className="bg-white p-6 rounded-lg w-full max-w-lg">
                    <h3 className="text-lg font-medium mb-4">เพิ่มพนักงานใหม่</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input
                        type="text"
                        className="input"
                        placeholder="ชื่อพนักงาน"
                        value={newStaffName}
                        onChange={(e) => setNewStaffName(e.target.value)}
                      />
                      <input
                        type="text"
                        className="input"
                        placeholder="เบอร์โทร"
                        value={newStaffPhone}
                        onChange={(e) => setNewStaffPhone(e.target.value)}
                      />
                      <input
                        type="email"
                        className="input"
                        placeholder="อีเมล (ไม่บังคับ)"
                        value={newStaffEmail}
                        onChange={(e) => setNewStaffEmail(e.target.value)}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <button
                        className="btn bg-blue-600 text-white hover:bg-blue-700"
                        onClick={async () => {
                          await createStaff();
                          setShowAddStaffModal(false);
                        }}
                        disabled={!newStaffName.trim() || !newStaffPhone.trim()}
                      >
                        บันทึก
                      </button>
                      <button
                        className="btn border"
                        onClick={() => {
                          setShowAddStaffModal(false);
                          setNewStaffName("");
                          setNewStaffPhone("");
                          setNewStaffEmail("");
                        }}
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {editingStaffId && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-medium mb-4">แก้ไขพนักงาน</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      className="input"
                      placeholder="ชื่อพนักงาน"
                      value={editStaffName}
                      onChange={(e) => setEditStaffName(e.target.value)}
                    />
                    <input
                      type="text"
                      className="input"
                      placeholder="เบอร์โทร"
                      value={editStaffPhone}
                      onChange={(e) => setEditStaffPhone(e.target.value)}
                    />
                    <input
                      type="email"
                      className="input"
                      placeholder="อีเมล (ไม่บังคับ)"
                      value={editStaffEmail}
                      onChange={(e) => setEditStaffEmail(e.target.value)}
                    />
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editStaffIsActive}
                        onChange={(e) => setEditStaffIsActive(e.target.checked)}
                      />
                      <span>พร้อมใช้งาน</span>
                    </label>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="btn bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => {
                        updateStaff(editingStaffId!, {
                          name: editStaffName,
                          phone: editStaffPhone,
                          email: editStaffEmail,
                          is_active: editStaffIsActive,
                        });
                        setEditingStaffId(null);
                      }}
                      disabled={!editStaffName.trim() || !editStaffPhone.trim()}
                    >
                      บันทึก
                    </button>
                    <button
                      className="btn border"
                      onClick={() => setEditingStaffId(null)}
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              )}

              {/* รายการพนักงานที่มีอยู่ */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">รายการพนักงาน</h3>
                {staff.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">ยังไม่มีพนักงาน</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100 text-left">
                          <th className="p-2 border">ชื่อพนักงาน</th>
                          <th className="p-2 border">เบอร์โทร</th>
                          <th className="p-2 border">อีเมล</th>
                          <th className="p-2 border">สถานะ</th>
                          <th className="p-2 border">การจัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staff.map((person) => (
                          <tr key={person.id} className="bg-white">
                            <td className="p-2 border">{person.name}</td>
                            <td className="p-2 border">{person.phone || "-"}</td>
                            <td className="p-2 border">{person.email || "-"}</td>
                            <td className="p-2 border">
                              <span
                                className={
                                  person.is_active ? "text-green-600" : "text-red-600"
                                }
                              >
                                {person.is_active ? "พร้อมใช้งาน" : "ไม่พร้อมใช้งาน"}
                              </span>
                            </td>
                            <td className="p-2 border">
                              <div className="flex space-x-2">
                                <button
                                  className="btn border bg-yellow-50 hover:bg-yellow-100 text-yellow-700 text-sm px-3 py-1"
                                  onClick={() => startEditStaff(person)}
                                >
                                  แก้ไข
                                </button>
                                <button
                                  className="btn border bg-red-50 hover:bg-red-100 text-red-700 text-sm px-3 py-1"
                                  onClick={() => deleteStaff(person.id)}
                                >
                                  ลบ
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {msg && <p className="mt-3">{msg}</p>}
        </div>
      )}
    </div>
  );
}
