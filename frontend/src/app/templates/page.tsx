"use client";
import { useState, useRef, useEffect } from "react";
import { Plus, Upload, Save, FileType, CheckCircle } from "lucide-react";

export default function TemplatesPage() {
  const [fields, setFields] = useState([
    { id: 1, name: "ReportDate", type: "date" },
    { id: 2, name: "Department", type: "text" },
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [templateName, setTemplateName] = useState("Monthly Report");
  const [category, setCategory] = useState("HR Report");
  const [templateId, setTemplateId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [templatesList, setTemplatesList] = useState<any[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>(["HR Report", "Financial Report", "Visitor Statistics"]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/templates/");
      if (res.ok) {
        const data = await res.json();
        setTemplatesList(data);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    }
  };

  useEffect(() => {
    const savedName = localStorage.getItem("draftTemplateName");
    const savedCat = localStorage.getItem("draftCategory");
    const savedFields = localStorage.getItem("draftFields");
    const savedId = localStorage.getItem("draftTemplateId");

    if (savedName) setTemplateName(savedName);
    if (savedCat) setCategory(savedCat);
    if (savedFields) setFields(JSON.parse(savedFields));
    if (savedId) setTemplateId(parseInt(savedId));

    fetchTemplates();
    
    // Fetch categories
    fetch("http://localhost:8000/api/v1/settings/TEMPLATE_CATEGORIES")
      .then(res => res.json())
      .then(data => {
        if (data.value && Array.isArray(data.value)) {
          setAvailableCategories(data.value);
        }
      })
      .catch(err => console.error("Failed to fetch categories:", err));
  }, []);

  useEffect(() => {
    localStorage.setItem("draftTemplateName", templateName);
    localStorage.setItem("draftCategory", category);
    localStorage.setItem("draftFields", JSON.stringify(fields));
    if (templateId) {
      localStorage.setItem("draftTemplateId", templateId.toString());
    } else {
      localStorage.removeItem("draftTemplateId");
    }
  }, [templateName, category, fields, templateId]);

  const addField = () => {
    setFields([...fields, { id: Date.now(), name: "NewField", type: "text" }]);
  };

  const updateField = (id: number, key: "name" | "type", value: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, [key]: value } : f));
  };

  const removeField = (id: number) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", "New Uploaded Template");
    formData.append("category", "General");

    try {
      const response = await fetch("http://localhost:8000/api/v1/templates/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setTemplateId(data.template_id);
        
        if (data.fields) {
          const parsedFields = Object.entries(data.fields).map(([k, v], i) => ({
            id: i, name: k, type: v as string
          }));
          setFields(parsedFields);
        }
        
        setUploadSuccess(true);
        fetchTemplates(); // Refresh the list
        setTimeout(() => setUploadSuccess(false), 3000);
      } else {
        alert("Failed to upload template.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading file.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSaveTemplate = async () => {
    setIsSaving(true);
    const payload = {
      name: templateName,
      category: category,
      fields: fields.reduce((acc, field) => ({ ...acc, [field.name]: field.type }), {}),
    };

    try {
      const url = templateId 
        ? `http://localhost:8000/api/v1/templates/${templateId}` 
        : `http://localhost:8000/api/v1/templates`;
      
      const method = templateId ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        setTemplateId(data.id);
        alert("Template saved successfully!");
        fetchTemplates(); // Refresh the list
      } else {
        alert("Failed to save template.");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Error saving template.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">គ្រប់គ្រងគំរូឯកសារ (Templates)</h2>
        <div className="flex items-center space-x-3">
          {uploadSuccess && <span className="text-sm text-green-600 flex items-center"><CheckCircle className="h-4 w-4 mr-1"/> បានបញ្ចូល</span>}
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".docx,.pdf,image/png,image/jpeg,image/jpg" 
            onChange={handleFileUpload} 
          />
          <button 
            onClick={handleUploadClick}
            disabled={isUploading}
            className="flex items-center space-x-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:bg-blue-400"
          >
            {isUploading ? (
              <span className="animate-pulse">កំពុងបញ្ចូល...</span>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>បញ្ចូលឯកសារ (Upload DOCX)</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl border shadow-sm">
        <div className="w-1/2">
          <label className="block text-sm font-medium text-gray-700">ជ្រើសរើសគំរូឯកសារដើម្បីកែប្រែ</label>
          <select 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
            value={templateId || ""}
            onChange={(e) => {
              const selectedId = parseInt(e.target.value);
              if (!selectedId) {
                setTemplateId(null);
                setTemplateName("");
                setCategory("General");
                setFields([]);
                return;
              }
              const tmpl = templatesList.find(t => t.id === selectedId);
              if (tmpl) {
                setTemplateId(tmpl.id);
                setTemplateName(tmpl.name);
                setCategory(tmpl.category);
                const parsedFields = Object.entries(tmpl.fields || {}).map(([k, v], i) => ({
                  id: i, name: k, type: v as string
                }));
                setFields(parsedFields);
              }
            }}
          >
            <option value="">-- បង្កើតគំរូថ្មី --</option>
            {templatesList.map(t => (
              <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-medium mb-4">ព័ត៌មានលម្អិត</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">ឈ្មោះគំរូឯកសារ</label>
              <input 
                type="text" 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" 
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ប្រភេទ (Category)</label>
              <select 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {availableCategories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">បង្កើតវាលទិន្នន័យ (Dynamic Fields)</h3>
            <button onClick={addField} className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
              <Plus className="h-4 w-4 mr-1" /> បន្ថែមវាល
            </button>
          </div>
          
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-3 p-3 border rounded-md bg-gray-50">
                <div className="flex-1">
                  <label className="text-xs text-gray-500">ឈ្មោះវាល (Variable) {"{{"}{field.name}{"}}"}</label>
                  <input 
                    type="text" 
                    className="block w-full text-sm border-gray-300 rounded p-1 border mt-1" 
                    value={field.name}
                    onChange={(e) => updateField(field.id, "name", e.target.value)}
                  />
                </div>
                <div className="w-32">
                  <label className="text-xs text-gray-500">ប្រភេទបញ្ចូល</label>
                  <select 
                    className="block w-full text-sm border-gray-300 rounded p-1 border mt-1" 
                    value={field.type}
                    onChange={(e) => updateField(field.id, "type", e.target.value)}
                  >
                    <option value="text">អក្សរ (Text)</option>
                    <option value="number">លេខ (Number)</option>
                    <option value="date">កាលបរិច្ឆេទ (Date)</option>
                    <option value="textarea">អត្ថបទវែង (Long Text)</option>
                  </select>
                </div>
                <div className="w-8 pt-5">
                  <button onClick={() => removeField(field.id)} className="text-red-500 hover:text-red-700 font-bold" title="Remove Field">×</button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button 
              onClick={handleSaveTemplate}
              disabled={isSaving}
              className="flex items-center space-x-2 rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:bg-green-400"
            >
              <Save className="h-4 w-4" />
              <span>{isSaving ? "កំពុងរក្សាទុក..." : "រក្សាទុកគំរូឯកសារ"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
