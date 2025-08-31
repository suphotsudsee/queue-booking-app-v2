"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AddService() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration_minutes: 30,
    price: 0,
    is_active: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setMessage("กรุณากรอกชื่อบริการ");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      await axios.post(`${API}/services`, formData);
      setMessage("✅ เพิ่มบริการสำเร็จ!");
      
      // Reset form
      setFormData({
        name: "",
        description: "",
        duration_minutes: 30,
        price: 0,
        is_active: true
      });
      
      // Redirect หลังจาก 2 วินาที
      setTimeout(() => {
        router.push("/");
      }, 2000);
      
    } catch (error: any) {
      setMessage(`❌ เกิดข้อผิดพลาด: ${error.response?.data?.detail || "ไม่สามารถเพิ่มบริการได้"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">เพิ่มบริการใหม่</h1>
            <p className="text-gray-600">กรอกข้อมูลบริการที่ต้องการเพิ่ม</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ชื่อบริการ */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อบริการ *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="เช่น: ตัดผม, สระไดร์, ทำเล็บ"
                required
              />
            </div>

            {/* รายละเอียดบริการ */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                รายละเอียดบริการ
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="อธิบายรายละเอียดของบริการ"
              />
            </div>

            {/* ระยะเวลาและราคา */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700 mb-2">
                  ระยะเวลา (นาที) *
                </label>
                <input
                  type="number"
                  id="duration_minutes"
                  name="duration_minutes"
                  value={formData.duration_minutes}
                  onChange={handleInputChange}
                  min="15"
                  step="15"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="30"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">ขั้นต่ำ 15 นาที</p>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  ราคา (บาท)
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="10"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100"
                />
                <p className="text-sm text-gray-500 mt-1">ใส่ 0 ถ้าไม่มีราคา</p>
              </div>
            </div>

            {/* สถานะการใช้งาน */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                บริการนี้พร้อมใช้งาน
              </label>
            </div>

            {/* ปุ่มส่งฟอร์ม */}
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || !formData.name.trim()}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "กำลังเพิ่ม..." : "เพิ่มบริการ"}
              </button>
              
              <button
                type="button"
                onClick={() => router.push("/")}
                className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                ยกเลิก
              </button>
            </div>
          </form>

          {/* แสดงข้อความ */}
          {message && (
            <div className={`mt-6 p-4 rounded-lg text-center ${
              message.includes("✅") 
                ? "bg-green-50 text-green-800 border border-green-200" 
                : "bg-red-50 text-red-800 border border-red-200"
            }`}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
