import React, { useMemo } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import ImageResize from 'quill-image-resize-module-react';

// Register the module
Quill.register('modules/imageResize', ImageResize);

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function QuillEditor({ value, onChange, className }: QuillEditorProps) {
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['image'], // Added image button for signatures
      ['clean']
    ],
    imageResize: {
      parchment: Quill.import('parchment'),
      modules: [ 'Resize', 'DisplaySize' ]
    }
  }), []);

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
