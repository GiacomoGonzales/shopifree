'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'

// Importar ReactQuill dinámicamente para evitar problemas de SSR
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="h-40 bg-gray-50 animate-pulse rounded-md" />
})

// Importar estilos CSS
import 'react-quill/dist/quill.snow.css'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  required?: boolean
  className?: string
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Describe tu producto...",
  label,
  required = false,
  className = ""
}) => {


  // Configuración del toolbar personalizado (similar a la imagen)
  const modules = {
    toolbar: [
      // Primera fila: Formato de texto y párrafo
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ 'color': [] }],
      
      // Segunda fila: Alineación y listas
      [{ 'align': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      
      // Tercera fila: Enlaces, imagen, video y código
      ['link', 'image', 'video'],
      ['code-block'],
      ['clean']
    ],
  }

  const formats = [
    'header',
    'bold', 'italic', 'underline', 
    'color',
    'align', 'list',
    'link', 'image', 'video',
    'code-block'
  ]

  // Estilos personalizados para el editor
  useEffect(() => {
    // Agregar estilos personalizados al editor
    const style = document.createElement('style')
    style.textContent = `
      .ql-editor {
        min-height: 120px;
        font-family: inherit;
        font-size: 14px;
        line-height: 1.5;
      }
      
      .ql-toolbar {
        border-top: 1px solid #d1d5db;
        border-left: 1px solid #d1d5db;
        border-right: 1px solid #d1d5db;
        border-bottom: 1px solid #e5e7eb;
        border-radius: 6px 6px 0 0;
        padding: 12px;
        background: #ffffff;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 4px;
      }
      
      .ql-container {
        border-bottom: 1px solid #d1d5db;
        border-left: 1px solid #d1d5db;
        border-right: 1px solid #d1d5db;
        border-top: none;
        border-radius: 0 0 6px 6px;
        font-family: inherit;
      }
      
      .ql-toolbar .ql-picker-label {
        color: #374151;
      }
      
      .ql-toolbar .ql-stroke {
        stroke: #6b7280;
      }
      
      .ql-toolbar .ql-fill {
        fill: #6b7280;
      }
      
      .ql-toolbar button:hover,
      .ql-toolbar button:focus {
        color: #1f2937;
      }
      
      .ql-toolbar button:hover .ql-stroke {
        stroke: #1f2937;
      }
      
      .ql-toolbar button:hover .ql-fill {
        fill: #1f2937;
      }
      
      .ql-toolbar .ql-active {
        color: #3b82f6;
      }
      
      .ql-toolbar .ql-active .ql-stroke {
        stroke: #3b82f6;
      }
      
      .ql-toolbar .ql-active .ql-fill {
        fill: #3b82f6;
      }
      
      .ql-editor.ql-blank::before {
        color: #9ca3af;
        font-style: normal;
      }
      
      .ql-editor:focus {
        outline: none;
      }
      
      .ql-container.ql-snow {
        border: 1px solid #d1d5db;
      }
      
      .ql-snow .ql-tooltip {
        background: white;
        border: 1px solid #d1d5db;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        border-radius: 6px;
      }
      
      .ql-toolbar .ql-formats {
        margin-right: 8px;
      }
      
      .ql-toolbar .ql-formats:last-child {
        margin-right: 0;
      }
      
      .ql-picker.ql-expanded .ql-picker-options {
        border: 1px solid #d1d5db;
        border-radius: 6px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        background: white;
      }
      
      .ql-editor p {
        margin-bottom: 0.5em;
      }
      
      .ql-editor ul, .ql-editor ol {
        padding-left: 1.5em;
        margin-bottom: 0.5em;
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          className="bg-white"
        />
      </div>
    </div>
  )
} 