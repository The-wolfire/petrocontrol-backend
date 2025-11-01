# PetroControl Backend

Sistema de gestión de flota de camiones petroleros.

## Instalación Rápida

### Opción 1: Script Automático (Linux/Mac)

\`\`\`bash
chmod +x INSTRUCCIONES.sh
./INSTRUCCIONES.sh
\`\`\`

### Opción 2: Comandos Manuales

\`\`\`bash
# 1. Limpiar instalación anterior
rm -rf node_modules package-lock.json

# 2. Instalar dependencias
npm install

# 3. Crear base de datos
npm run init-db

# 4. Poblar con datos de ejemplo
npm run seed

# 5. Iniciar servidor
npm run dev
\`\`\`

### Opción 3: Comando Todo-en-Uno

\`\`\`bash
npm run setup
\`\`\`

## Credenciales de Acceso

- **Usuario:** admin
- **Contraseña:** admin123

## URLs

- **API Backend:** http://localhost:3000
- **Frontend:** Abre `../frontend/index.html` en tu navegador

## Solución de Problemas

### Error: "Cannot find module"
\`\`\`bash
npm run reinstall
\`\`\`

### Error: "ENOTEMPTY: directory not empty"
\`\`\`bash
rm -rf node_modules package-lock.json
npm install
\`\`\`

### Error: "SQLite package not found"
\`\`\`bash
npm install better-sqlite3 --save
\`\`\`

## Comandos Disponibles

- `npm run dev` - Iniciar servidor en modo desarrollo
- `npm run build` - Compilar TypeScript
- `npm run start` - Iniciar servidor compilado
- `npm run init-db` - Crear base de datos
- `npm run seed` - Poblar con datos de ejemplo
- `npm run verify-db` - Verificar conexión a BD
- `npm run clean` - Limpiar archivos generados
- `npm run reinstall` - Reinstalar todo desde cero

