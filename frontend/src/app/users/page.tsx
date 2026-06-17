"use client";
import { useState, useEffect } from "react";
import { Users, Plus, Shield, Edit, Trash2 } from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "Staff"
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch("http://localhost:8000/api/v1/users");
    if (res.ok) {
      setUsers(await res.json());
    }
  };

  const handleSave = async () => {
    if (editingUserId) {
      const updateData = { ...formData };
      if (!updateData.password) {
        delete (updateData as any).password;
      }
      const res = await fetch(`http://localhost:8000/api/v1/users/${editingUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      });
      if (res.ok) {
        setShowModal(false);
        fetchUsers();
      } else {
        alert("បរាជ័យក្នុងការកែប្រែគណនី។");
      }
    } else {
      const res = await fetch("http://localhost:8000/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          is_active: true
        })
      });
      if (res.ok) {
        setShowModal(false);
        fetchUsers();
      } else {
        alert("បរាជ័យក្នុងការបង្កើតគណនី។ អាចមកពីអ៊ីមែលស្ទួន។");
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("តើអ្នកពិតជាចង់លុបគណនីនេះមែនទេ? (Are you sure you want to delete this user?)")) {
      const res = await fetch(`http://localhost:8000/api/v1/users/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchUsers();
      } else {
        alert("បរាជ័យក្នុងការលុបគណនី។");
      }
    }
  };

  const openCreateModal = () => {
    setEditingUserId(null);
    setFormData({ full_name: "", email: "", password: "", role: "Staff" });
    setShowModal(true);
  };

  const openEditModal = (u: any) => {
    setEditingUserId(u.id);
    setFormData({ full_name: u.full_name, email: u.email, password: "", role: u.role });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">បញ្ជីបុគ្គលិក (Staff Directory)</h1>
          <p className="mt-2 text-sm text-gray-600">គ្រប់គ្រងគណនីអ្នកប្រើប្រាស់ អ្នកកែសម្រួល (Editor) និងប្រធាន (President)។</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>បន្ថែមបុគ្គលិកថ្មី</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ឈ្មោះពេញ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">អ៊ីមែល</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">តួនាទី (Role)</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">សកម្មភាព (Actions)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {u.full_name?.charAt(0) || "U"}
                  </div>
                  <span>{u.full_name}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    u.role === 'Editor' ? 'bg-purple-100 text-purple-800' :
                    u.role === 'President' ? 'bg-red-100 text-red-800' :
                    u.role === 'Department Head' ? 'bg-indigo-100 text-indigo-800' :
                    u.role === 'Admin' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    <Shield className="w-3 h-3 mr-1" />
                    {u.role || "Staff"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => openEditModal(u)} className="text-indigo-600 hover:text-indigo-900 mr-4" title="កែប្រែ (Edit)">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-900" title="លុប (Delete)">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                  មិនទាន់មានបុគ្គលិកនៅឡើយទេ។ សូមបង្កើតគណនីថ្មីមួយចំនួន!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-gray-900">{editingUserId ? "កែប្រែគណនីបុគ្គលិក" : "បន្ថែមគណនីបុគ្គលិក"}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">ឈ្មោះពេញ</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  value={formData.full_name}
                  onChange={e => setFormData({...formData, full_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">អ៊ីមែល</label>
                <input
                  type="email"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">លេខសម្ងាត់ (Password) {editingUserId && <span className="text-gray-400 font-normal ml-1">(ទុកចោលបើមិនចង់ដូរ)</span>}</label>
                <input
                  type="password"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  placeholder={editingUserId ? "វាយបញ្ចូលលេខសម្ងាត់ថ្មី..." : ""}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">តួនាទី</label>
                <select
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  <option value="Staff">Staff (អ្នកបង្កើតរបាយការណ៍)</option>
                  <option value="Editor">Editor (អ្នកកែសម្រួល)</option>
                  <option value="Department Head">Department Head (ប្រធាននាយកដ្ឋាន)</option>
                  <option value="Admin">Admin (រដ្ឋបាល)</option>
                  <option value="President">President (ប្រធានស្ថាប័ន)</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                បោះបង់
              </button>
              <button
                onClick={handleSave}
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                រក្សាទុក
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
