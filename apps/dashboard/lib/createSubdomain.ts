/**
 * Crea un subdominio en Vercel para el proyecto shopifree-public-store
 * @param subdomain - El subdominio a crear (sin .shopifree.app)
 * @returns true si fue exitoso
 * @throws Error si falla la validación o la creación
 */
export async function createSubdomain(subdomain: string): Promise<boolean> {
  // 1. Validar que el subdominio contenga solo letras, números o guiones, y no tenga espacios
  const subdomainRegex = /^[a-zA-Z0-9-]+$/;
  
  if (!subdomain.trim()) {
    throw new Error('El subdominio no puede estar vacío');
  }
  
  if (!subdomainRegex.test(subdomain)) {
    throw new Error('El subdominio solo puede contener letras, números y guiones, sin espacios');
  }
  
  // No permitir que empiece o termine con guión
  if (subdomain.startsWith('-') || subdomain.endsWith('-')) {
    throw new Error('El subdominio no puede empezar ni terminar con un guión');
  }
  
  const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
  
  if (!VERCEL_TOKEN) {
    throw new Error('Token de Vercel no configurado. Agrega VERCEL_TOKEN al archivo .env.local');
  }
  
  console.log('🔑 Token de Vercel configurado correctamente');
  
  try {
    // 2. Crear el subdominio como subdomain.shopifree.app en la API de Vercel
    const domainName = `${subdomain}.shopifree.app`;
    console.log('📞 Llamando a Vercel API para crear:', domainName);
    
    const response = await fetch('https://api.vercel.com/v10/projects/shopifree-public-store/domains', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: domainName,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || errorData.message || `Error HTTP ${response.status}: ${response.statusText}`;
      console.error('❌ Error de Vercel API:', errorMessage);
      throw new Error(`Error al crear el subdominio en Vercel: ${errorMessage}`);
    }
    
    const result = await response.json();
    console.log('📋 Respuesta de Vercel:', result);
    
    // Verificar que la respuesta sea exitosa
    if (result.error) {
      throw new Error(`Error de Vercel: ${result.error.message || result.error}`);
    }
    
    console.log('🎉 Subdominio creado exitosamente en Vercel');
    return true;
    
  } catch (error) {
    // Si es un error de red o de parsing, lanzar un error más descriptivo
    if (error instanceof Error) {
      console.error('❌ Error en createSubdomain:', error.message);
      throw error;
    } else {
      throw new Error(`Error inesperado al crear el subdominio: ${error}`);
    }
  }
}

/**
 * Función para verificar que el token de Vercel esté funcionando
 * @returns true si el token es válido
 */
export async function verifyVercelToken(): Promise<boolean> {
  const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
  
  if (!VERCEL_TOKEN) {
    console.error('❌ VERCEL_TOKEN no configurado');
    return false;
  }
  
  try {
    const response = await fetch('https://api.vercel.com/v2/user', {
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
      },
    });
    
    if (response.ok) {
      const user = await response.json();
      console.log('✅ Token de Vercel válido para usuario:', user.username || user.email);
      return true;
    } else {
      console.error('❌ Token de Vercel inválido');
      return false;
    }
  } catch (error) {
    console.error('❌ Error verificando token:', error);
    return false;
  }
}

/**
 * Función para verificar si un subdominio ya existe en Vercel
 * @param subdomain - El subdominio a verificar (sin .shopifree.app)
 * @returns true si existe, false si no existe
 */
export async function checkSubdomainExists(subdomain: string): Promise<boolean> {
  const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
  
  if (!VERCEL_TOKEN) {
    console.error('❌ VERCEL_TOKEN no configurado');
    return false;
  }
  
  try {
    const domainName = `${subdomain}.shopifree.app`;
    console.log('🔍 Verificando si existe el dominio:', domainName);
    
    const response = await fetch('https://api.vercel.com/v10/projects/shopifree-public-store/domains', {
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
      },
    });
    
    if (!response.ok) {
      console.error('❌ Error obteniendo dominios del proyecto');
      return false;
    }
    
    const data = await response.json();
    const domains = data.domains || [];
    
    const exists = domains.some((domain: any) => domain.name === domainName);
    console.log(exists ? '✅ El dominio SÍ existe en Vercel' : '❌ El dominio NO existe en Vercel');
    
    return exists;
    
  } catch (error) {
    console.error('❌ Error verificando subdominio:', error);
    return false;
  }
}

/**
 * Función para obtener todos los dominios del proyecto
 * @returns lista de dominios o null si hay error
 */
export async function getProjectDomains(): Promise<any[] | null> {
  const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
  
  if (!VERCEL_TOKEN) {
    console.error('❌ VERCEL_TOKEN no configurado');
    return null;
  }
  
  try {
    console.log('📋 Obteniendo todos los dominios del proyecto...');
    
    const response = await fetch('https://api.vercel.com/v10/projects/shopifree-public-store/domains', {
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
      },
    });
    
    if (!response.ok) {
      console.error('❌ Error obteniendo dominios del proyecto');
      return null;
    }
    
    const data = await response.json();
    const domains = data.domains || [];
    
    console.log('📋 Dominios encontrados:', domains.map((d: any) => d.name));
    
    return domains;
    
  } catch (error) {
    console.error('❌ Error obteniendo dominios:', error);
    return null;
  }
} 