import React, { useMemo, useEffect, useState } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function QuillEditorInner({ value, onChange, className }: QuillEditorProps) {
  const [isModuleLoaded, setIsModuleLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('quill-image-resize-module-react').then(module => {
        Quill.register('modules/imageResize', module.default);
        setIsModuleLoaded(true);
      }).catch(err => {
        console.error("Failed to load image resize module", err);
        setIsModuleLoaded(true); // proceed anyway
      });
    }
  }, []);

  const modules = useMemo(() => {
    if (!isModuleLoaded) return { toolbar: false };
    return {
      toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        ['image'],
        ['clean']
      ],
      imageResize: {
        parchment: Quill.import('parchment'),
        modules: [ 'Resize', 'DisplaySize' ]
      }
    };
  }, [isModuleLoaded]);

  if (!isModuleLoaded) {
    return <div className="p-4 text-center text-gray-500 border rounded min-h-[200px] flex items-center justify-center">កំពុងទាញយកកម្មវិធីកែសម្រួល...</div>;
  }

  return (
    <ReactQuill 
      theme="snow" 
      value={value} 
      onChange={onChange}
      className={className}
      modules={modules}
    />
  );
}
