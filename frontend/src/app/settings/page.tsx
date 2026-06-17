"use client";
import { useState, useEffect } from "react";
import { Plus, Save, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [visitorTypes, setVisitorTypes] = useState<string[]>([]);
  const [newVisitorType, setNewVisitorType] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/api/v1/settings/TEMPLATE_CATEGORIES")
      .then(res => res.json())
      .then(data => {
        if (data.value && Array.isArray(data.value)) {
          setCategories(data.value);
        } else {
          setCategories(["HR Report", "Financial Report", "Visitor Statistics"]); // defaults
        }
      })
      .catch(err => console.error("Error fetching settings:", err));

    fetch("http://localhost:8000/api/v1/settings/VISITOR_TYPES")
      .then(res => res.json())
      .then(data => {
        if (data.value && Array.isArray(data.value)) {
          setVisitorTypes(data.value);
        } else {
          setVisitorTypes([
            "គ្រឹះស្ថានអប់រំ",
            "អង្គការនានា",
            "គណៈប្រតិភូ",
            "អង្គភាពសារព័ត៌មាន",
            "ក្រុមហ៊ុនផលិតវីដេអូ",
            "អ្នកផលិតមាតិកា",
            "សាសនិក",
            "ស្រាវជ្រាវ"
          ]); // defaults
        }
      })
      .catch(err => console.error("Error fetching visitor types:", err));
  }, []);

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory("");
    }
  };

  const handleRemoveCategory = (cat: string) => {
    setCategories(categories.filter(c => c !== cat));
  };

  const handleAddVisitorType = () => {
    if (newVisitorType.trim() && !visitorTypes.includes(newVisitorType.trim())) {
      setVisitorTypes([...visitorTypes, newVisitorType.trim()]);
      setNewVisitorType("");
    }
  };

  const handleRemoveVisitorType = (type: string) => {
    setVisitorTypes(visitorTypes.filter(t => t !== type));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const p1 = fetch("http://localhost:8000/api/v1/settings/TEMPLATE_CATEGORIES", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: categories }),
      });
      const p2 = fetch("http://localhost:8000/api/v1/settings/VISITOR_TYPES", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: visitorTypes }),
      });
      
      const [res1, res2] = await Promise.all([p1, p2]);
      
      if (res1.ok && res2.ok) {
        alert("រក្សាទុកការកំណត់បានជោគជ័យ!");
      } else {
        alert("បរាជ័យក្នុងការរក្សាទុកការកំណត់។");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("មានបញ្ហាក្នុងការរក្សាទុកការកំណត់។");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">ការកំណត់ប្រព័ន្ធ (Settings)</h2>
        <button 
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="flex items-center space-x-2 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:bg-green-400"
        >
          <Save className="h-4 w-4" />
          <span>{isSaving ? "កំពុងរក្សាទុក..." : "រក្សាទុកការកំណត់"}</span>
        </button>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm max-w-2xl">
        <h3 className="text-lg font-medium mb-4">ប្រភេទគំរូឯកសារ (Template Categories)</h3>
        <p className="text-sm text-gray-500 mb-4">គ្រប់គ្រងប្រភេទផ្សេងៗសម្រាប់ជ្រើសរើសពេលបង្កើតគំរូឯកសារថ្មី។</p>
        
        <div className="flex space-x-2 mb-6">
          <input 
            type="text" 
            placeholder="ឈ្មោះប្រភេទថ្មី (New Category Name)" 
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
          />
          <button 
            onClick={handleAddCategory}
            className="flex items-center space-x-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>បន្ថែម</span>
          </button>
        </div>

        <ul className="space-y-2">
          {categories.length === 0 ? (
            <li className="text-sm text-gray-400 italic">មិនទាន់មានប្រភេទកំណត់នៅឡើយទេ។</li>
          ) : (
            categories.map(cat => (
              <li key={cat} className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                <span className="text-sm font-medium">{cat}</span>
                <button 
                  onClick={() => handleRemoveCategory(cat)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Remove Category"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="rounded-xl border bg-white p-6 shadow-sm max-w-2xl">
        <h3 className="text-lg font-medium mb-4">ប្រភេទអ្នកមកទស្សនា (Visitor Types)</h3>
        <p className="text-sm text-gray-500 mb-4">គ្រប់គ្រងជម្រើសប្រភេទអ្នកមកទស្សនានៅក្នុងទម្រង់ស្នើសុំទស្សនកិច្ច។</p>
        
        <div className="flex space-x-2 mb-6">
          <input 
            type="text" 
            placeholder="ឈ្មោះប្រភេទថ្មី (New Visitor Type)" 
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            value={newVisitorType}
            onChange={(e) => setNewVisitorType(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddVisitorType()}
          />
          <button 
            onClick={handleAddVisitorType}
            className="flex items-center space-x-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>បន្ថែម</span>
          </button>
        </div>

        <ul className="space-y-2">
          {visitorTypes.length === 0 ? (
            <li className="text-sm text-gray-400 italic">មិនទាន់មានប្រភេទកំណត់នៅឡើយទេ។</li>
          ) : (
            visitorTypes.map(type => (
              <li key={type} className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                <span className="text-sm font-medium">{type}</span>
                <button 
                  onClick={() => handleRemoveVisitorType(type)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Remove Type"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
