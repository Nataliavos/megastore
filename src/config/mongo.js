import mongoose from 'mongoose';
import { env } from './env.js';

// ── Schema de auditoría ─────────────────────────────────────────────────────
// El campo `snapshot` embebe una copia del producto eliminado en lugar de
// referenciar a products, porque es un registro histórico inmutable:
// el producto ya no existe en SQL, así que no hay nada que referenciar.
// Embedding es la decisión correcta para logs de auditoría.
const auditLogSchema = new mongoose.Schema(
  {
    entity:    { type: String, required: true }, // "product"
    action:    { type: String, required: true }, // "DELETE"
    entityId:  { type: String, required: true }, // product_sku eliminado
    snapshot:  { type: Object, required: true }, // copia del registro al momento del delete
    deletedAt: { type: Date,   default: Date.now },
  },
  { collection: 'audit_logs' }
);

// Índice para búsquedas rápidas de auditoría por entidad y fecha descendente
auditLogSchema.index({ entity: 1, deletedAt: -1 });

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export const connectMongo = async () => {
  await mongoose.connect(env.mongoUri);
  console.log('🟢 MongoDB conectado:', mongoose.connection.name);
};