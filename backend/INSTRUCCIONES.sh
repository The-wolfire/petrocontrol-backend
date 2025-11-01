#!/bin/bash

echo "🚀 PetroControl - Instalación y Configuración"
echo "=============================================="
echo ""

# Limpiar instalación corrupta
echo "🧹 Paso 1: Limpiando instalación anterior..."
rm -rf node_modules package-lock.json
echo "✅ Limpieza completada"
echo ""

# Instalar dependencias
echo "📦 Paso 2: Instalando dependencias..."
npm install
echo "✅ Dependencias instaladas"
echo ""

# Crear base de datos
echo "🗄️  Paso 3: Creando base de datos SQLite..."
npm run init-db
echo "✅ Base de datos creada"
echo ""

# Poblar con datos de ejemplo
echo "🌱 Paso 4: Poblando base de datos con datos de ejemplo..."
npm run seed
echo "✅ Datos de ejemplo agregados"
echo ""

# Iniciar servidor
echo "🚀 Paso 5: Iniciando servidor..."
echo ""
echo "📝 Credenciales de acceso:"
echo "   Usuario: admin"
echo "   Contraseña: admin123"
echo ""
echo "🌐 URLs disponibles:"
echo "   API: http://localhost:3000"
echo "   Frontend: Abre frontend/index.html en tu navegador"
echo ""
npm run dev
