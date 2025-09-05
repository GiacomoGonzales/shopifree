import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { domain } = await request.json()
    
    console.log('🚀 [API] Iniciando agregado de dominio:', domain)
    
    // Validaciones
    if (!domain) {
      return NextResponse.json(
        { error: 'El dominio es requerido' },
        { status: 400 }
      )
    }
    
    // Validar formato básico del dominio
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/
    if (!domainRegex.test(domain)) {
      return NextResponse.json(
        { error: 'Formato de dominio inválido' },
        { status: 400 }
      )
    }
    
    // Usar las variables exactas que tienes configuradas
    const VERCEL_TOKEN = process.env.VERCEL_TOKEN
    const VERCEL_PUBLIC_STORE_PROJECT_ID = process.env.VERCEL_PUBLIC_STORE_PROJECT_ID
    
    console.log('🔧 [API] Verificando variables:', {
      hasToken: !!VERCEL_TOKEN,
      projectId: VERCEL_PUBLIC_STORE_PROJECT_ID?.substring(0, 10) + '...'
    })
    
    if (!VERCEL_TOKEN) {
      console.error('❌ VERCEL_TOKEN no encontrado')
      return NextResponse.json(
        { error: 'Token de Vercel no configurado' },
        { status: 500 }
      )
    }
    
    if (!VERCEL_PUBLIC_STORE_PROJECT_ID) {
      console.error('❌ VERCEL_PUBLIC_STORE_PROJECT_ID no encontrado')
      return NextResponse.json(
        { error: 'Project ID no configurado' },
        { status: 500 }
      )
    }
    
    // Agregar el dominio a Vercel usando la API v9 (igual que subdominios)
    console.log('📞 [API] Llamando a Vercel API para:', domain)
    
    const response = await fetch(`https://api.vercel.com/v9/projects/${VERCEL_PUBLIC_STORE_PROJECT_ID}/domains`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: domain,
      }),
    })
    
    console.log('📊 [API] Respuesta de Vercel:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error?.message || errorData.message || `HTTP ${response.status}`
      console.error('❌ [API] Error de Vercel:', errorMessage)
      
      // Si el dominio ya existe, considerarlo como éxito
      if (response.status === 409 || errorMessage.includes('already exists') || errorMessage.includes('domain is already')) {
        console.log('ℹ️ [API] Dominio ya existe en Vercel')
        return NextResponse.json({
          success: true,
          domain: domain,
          message: 'Dominio ya estaba agregado a Vercel',
          data: { name: domain, verified: false, status: 'existing' }
        })
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }
    
    const result = await response.json()
    console.log('✅ [API] Dominio agregado exitosamente:', result)
    
    return NextResponse.json({
      success: true,
      domain: domain,
      message: 'Dominio agregado a Vercel exitosamente',
      data: result
    })
    
  } catch (error) {
    console.error('❌ [API] Error interno:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
