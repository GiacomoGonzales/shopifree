# 🚀 Shopifree

**SaaS platform for creating online stores** - Built with Next.js, Firebase, and TypeScript.

## 📋 Project Overview

Shopifree es una plataforma SaaS que permite a los usuarios crear y gestionar sus propias tiendas online de manera sencilla y eficiente.

### 🏗️ Architecture

Este proyecto utiliza una arquitectura **monorepo** organizada de la siguiente forma:

```
Shopifree/
├── apps/                    # Aplicaciones Next.js
│   ├── landing/            # Página pública principal (/)
│   ├── dashboard/          # Panel de usuario (/dashboard)
│   ├── public-store/       # Tienda pública (cliente1.shopifree.app)
│   └── admin/              # Panel de administración (/admin)
├── packages/               # Packages compartidos
│   ├── ui/                 # Componentes UI (Tailwind CSS)
│   └── types/              # Tipos TypeScript globales
└── firebase/               # Backend Firebase
    ├── functions/          # Cloud Functions
    ├── firestore.rules     # Reglas de seguridad Firestore
    └── storage.rules       # Reglas de seguridad Storage
```

### 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **Internationalization**: next-intl
- **Package Manager**: npm (Workspaces)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- Yarn
- Firebase CLI

### Installation

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd shopifree
   ```

2. **Instalar dependencias**
   ```bash
   yarn install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.local.example .env.local
   # Editar .env.local con tus credenciales de Firebase y APIs externas
   ```

4. **Inicializar Firebase**
   ```bash
   firebase login
   firebase init
   ```

### Development

**Ejecutar todas las aplicaciones:**
```bash
yarn dev
```

**Ejecutar aplicaciones individuales:**
```bash
yarn dev:landing      # Puerto 3000
yarn dev:dashboard    # Puerto 3001  
yarn dev:admin        # Puerto 3002
yarn dev:public-store # Puerto 3003
```

**Ejecutar Firebase Emulators:**
```bash
cd firebase/functions && yarn install
firebase emulators:start
```

## 📱 Applications

### 🌐 Landing (`apps/landing`)
- **Puerto**: 3000
- **Descripción**: Página pública principal de Shopifree
- **URL**: `http://localhost:3000`

### 📊 Dashboard (`apps/dashboard`) 
- **Puerto**: 3001
- **Descripción**: Panel de control para usuarios (gestión de tiendas)
- **URL**: `http://localhost:3001`

### 🛒 Public Store (`apps/public-store`)
- **Puerto**: 3003  
- **Descripción**: Tienda pública visible a clientes
- **URL**: `http://localhost:3003`

### ⚙️ Admin (`apps/admin`)
- **Puerto**: 3002
- **Descripción**: Panel de administración del sistema
- **URL**: `http://localhost:3002`

## 📦 Packages

### 🎨 UI Package (`packages/ui`)
Componentes visuales compartidos:
- Button, Input, Card
- Diseñados con Tailwind CSS
- Completamente tipados con TypeScript

### 🏷️ Types Package (`packages/types`)  
Tipos TypeScript globales:
- User, Store, Product, Order
- Interfaces para API responses
- Tipos para configuración y settings

## 🔥 Firebase

### Functions (`firebase/functions`)
- **Email**: Envío de correos de bienvenida y confirmación
- **Orders**: Procesamiento de pedidos y actualización de stock
- **Stores**: Gestión de tiendas y configuraciones

### Security Rules
- **Firestore**: Control de acceso basado en roles y ownership  
- **Storage**: Reglas para subida de imágenes de productos y avatares

## 🌍 Environment Variables

Crear `.env.local` basado en `.env.local.example`:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... más variables

# External APIs  
OPENAI_API_KEY=your_openai_key
SENDGRID_API_KEY=your_sendgrid_key
```

## 🚀 Build & Deploy

**Build todas las apps:**
```bash
yarn build
```

**Deploy Firebase:**
```bash
firebase deploy
```

## 🤝 Contributing

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 License

Este proyecto es privado y pertenece a Shopifree.

---

**¡Construye tu tienda online con Shopifree! 🛍️** 