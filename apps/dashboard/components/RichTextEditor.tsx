'use client'

import { useEffect, useRef, useState } from 'react'
import type Quill from 'quill'

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
  const editorRef = useRef<HTMLDivElement>(null)
  const quillRef = useRef<Quill | null>(null)
  const [mounted, setMounted] = useState(false)
  const [quillLoaded, setQuillLoaded] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !editorRef.current) return

    // Cargar Quill dinámicamente
    const loadQuill = async () => {
      try {
        // Cargar CSS primero
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://cdn.quilljs.com/1.3.7/quill.snow.css'
        
        if (!document.querySelector('link[href="https://cdn.quilljs.com/1.3.7/quill.snow.css"]')) {
          document.head.appendChild(link)
        }

        // Cargar Quill JS
        const QuillConstructor = (await import('quill')).default

        if (quillRef.current) {
          quillRef.current = null
        }

        // Configurar Quill
        if (!editorRef.current) return
        
        quillRef.current = new QuillConstructor(editorRef.current, {
          theme: 'snow',
          placeholder,
          modules: {
            toolbar: [
              [{ 'header': [1, 2, 3, false] }],
              ['bold', 'italic', 'underline'],
              [{ 'color': [] }],
              [{ 'align': [] }],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              ['link'],
              ['clean']
            ],
          },
          formats: [
            'header',
            'bold', 'italic', 'underline', 
            'color',
            'align', 'list',
            'link'
          ]
        })

        // Establecer contenido inicial
        if (value) {
          quillRef.current.clipboard.dangerouslyPasteHTML(value)
        }

        // Escuchar cambios
        quillRef.current.on('text-change', () => {
          if (quillRef.current) {
            const html = quillRef.current.root.innerHTML
            onChange(html)
          }
        })

        setQuillLoaded(true)

      } catch (error) {
        console.error('Error loading Quill:', error)
      }
    }

    loadQuill()

    return () => {
      if (quillRef.current) {
        quillRef.current = null
      }
    }
  }, [mounted, placeholder])

  // Actualizar contenido cuando cambie value desde fuera
  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      const selection = quillRef.current.getSelection()
      quillRef.current.clipboard.dangerouslyPasteHTML(value)
      if (selection) {
        quillRef.current.setSelection(selection)
      }
    }
  }, [value])

  // Estilos personalizados
  useEffect(() => {
    if (!quillLoaded) return

    const style = document.createElement('style')
    style.textContent = `
      .ql-editor {
        min-height: 120px;
        font-family: inherit;
        font-size: 16px;
        line-height: 1.5;
      }
      
      .ql-toolbar {
        border-top: 1px solid rgb(var(--dashboard-border));
        border-left: 1px solid rgb(var(--dashboard-border));
        border-right: 1px solid rgb(var(--dashboard-border));
        border-bottom: 1px solid rgb(var(--dashboard-border));
        border-radius: 6px 6px 0 0;
        padding: 12px;
        background: rgb(var(--dashboard-card-bg));
      }
      
      .ql-container {
        border-bottom: 1px solid rgb(var(--dashboard-border));
        border-left: 1px solid rgb(var(--dashboard-border));
        border-right: 1px solid rgb(var(--dashboard-border));
        border-top: none;
        border-radius: 0 0 6px 6px;
        font-family: inherit;
      }
      
      .ql-editor.ql-blank::before {
        color: rgb(var(--dashboard-muted-foreground));
        font-style: normal;
      }
      
      .ql-editor:focus {
        outline: none;
      }
    `
    document.head.appendChild(style)
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [quillLoaded])

  if (!mounted) {
    return (
      <div className={`space-y-1 ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="h-40 bg-gray-50 animate-pulse rounded-md border border-gray-300 flex items-center justify-center">
          <span className="text-gray-500 text-sm">Cargando editor...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <div ref={editorRef} className="bg-white" />
        {!quillLoaded && (
          <div className="absolute inset-0 bg-gray-50 animate-pulse rounded-md border border-gray-300 flex items-center justify-center">
            <span className="text-gray-500 text-sm">Inicializando editor...</span>
          </div>
        )}
      </div>
    </div>
  )
} 