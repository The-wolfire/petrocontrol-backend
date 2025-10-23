import { Router } from "express"
import {
  getRegistros,
  getRegistroById,
  createRegistro,
  updateRegistro,
  deleteRegistro,
  getInventarioActual,
} from "../controllers/registroController"
import { authenticateToken } from "../middleware/auth"

const router = Router()

// Proteger todas las rutas con autenticación
router.use(authenticateToken)

// Ruta de inventario DEBE ir ANTES de las rutas con :id
router.get("/inventario", getInventarioActual)

// Rutas CRUD de registros
router.get("/", getRegistros)
router.get("/:id", getRegistroById)
router.post("/", createRegistro)
router.put("/:id", updateRegistro)
router.delete("/:id", deleteRegistro)

export default router
