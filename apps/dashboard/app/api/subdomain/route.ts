import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { subdomain } = await request.json()
    
    // Validaciones
    if (!subdomain) {
      return NextResponse.json(
        { error: 'El subdominio es requerido' },
        { status: 400 }
      )
    }
    
    // Validar formato del subdominio
    const subdomainRegex = /^[a-zA-Z0-9-]+$/;
    if (!subdomainRegex.test(subdomain)) {
      return NextResponse.json(
        { error: 'El subdominio solo puede contener letras, números y guiones' },
        { status: 400 }
      )
    }
    
    if (subdomain.startsWith('-') || subdomain.endsWith('-')) {
      return NextResponse.json(
        { error: 'El subdominio no puede empezar ni terminar con guión' },
        { status: 400 }
      )
    }
    
    // Obtener variables de entorno del servidor
    const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
    const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID || 'prj_7qzFy7LLfbHAMHVRCEZzKgj6Ypa5';
    
    console.log('🔧 [SERVER] Variables de entorno:', {
      hasToken: !!VERCEL_TOKEN,
      tokenLength: VERCEL_TOKEN?.length || 0,
      projectId: VERCEL_PROJECT_ID
    });
    
    if (!VERCEL_TOKEN) {
      console.error('❌ [SERVER] VERCEL_TOKEN no configurado');
      return NextResponse.json(
        { error: 'Token de Vercel no configurado en el servidor' },
        { status: 500 }
      )
    }
    
    // Crear el subdominio en Vercel
    const domainName = `${subdomain}.shopifree.app`;
    console.log('📞 [SERVER] Llamando a Vercel API para crear:', domainName);
    
    const response = await fetch(`https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: domainName,
      }),
    });
    
    console.log('📊 [SERVER] Status de respuesta:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || errorData.message || `Error HTTP ${response.status}: ${response.statusText}`;
      console.error('❌ [SERVER] Error de Vercel API:', errorMessage);
      
      return NextResponse.json(
        { error: `Error al crear el subdominio: ${errorMessage}` },
        { status: response.status }
      )
    }
    
    const result = await response.json();
    console.log('📋 [SERVER] Respuesta de Vercel:', result);
    console.log('🎉 [SERVER] Subdominio creado exitosamente en Vercel');
    
    return NextResponse.json({
      success: true,
      domain: domainName,
      data: result
    });
    
  } catch (error) {
    console.error('❌ [SERVER] Error en API route:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 