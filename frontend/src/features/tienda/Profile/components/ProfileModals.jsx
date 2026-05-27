/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React, { useState } from 'react';
import { 
  FaTimes, FaCheckCircle, FaExclamationTriangle, FaExchangeAlt 
} from "react-icons/fa";
import '../styles/ProfileModals.css';

export const ImageModal = ({ src, onClose }) => (
  <div className="gm-zoom-overlay" onClick={onClose}>
    <div className="gm-zoom-container" onClick={e => e.stopPropagation()}>
      <button className="gm-zoom-close" onClick={onClose}><FaTimes size={24} /></button>
      <img src={src} className="gm-zoom-img" alt="zoom" />
    </div>
  </div>
);

export const SuccessModal = ({ onClose }) => (
  <div className="gm-modal-overlay-p">
    <div className="gm-success-modal">
      <div style={{ width: "80px", height: "80px", backgroundColor: "rgba(16, 185, 129, 0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 25px", border: "1px solid #10b981" }}>
        <FaCheckCircle color="#10b981" size={40} />
      </div>
      <h3 style={{ fontSize: "1.6rem", fontWeight: 800, marginBottom: "15px", color: "#fff" }}>¡Solicitud enviada con éxito!</h3>
      <p style={{ color: "#94a3b8", lineHeight: "1.6", fontSize: "0.95rem", marginBottom: "30px" }}>
        Su solicitud de cambio ha sido registrada. Nuestro equipo de administración revisará la información proporcionada a la brevedad. 
        <br /><br />
        Podrá realizar el seguimiento de su caso y ver la respuesta definitiva directamente en la pestaña <strong>"Devoluciones"</strong> de su perfil.
      </p>
      <button 
        onClick={onClose} 
        style={{ width: "100%", padding: "14px", borderRadius: "12px", backgroundColor: "#FFC107", color: "#000", border: "none", fontWeight: 800, cursor: "pointer", fontSize: "1rem" }}
      >
        ENTENDIDO
      </button>
    </div>
  </div>
);

export const ConfirmModal = ({ modal, onClose }) => (
  <div className="gm-modal-overlay-p">
    <div className={`gm-confirm-modal ${modal.isDanger ? 'danger' : ''}`}>
      <p className="gm-modal-msg-center-p">{modal.message}</p>
      <div className="gm-modal-actions-center-p">
        <button onClick={onClose} className="gm-btn-cancel-p">CANCELAR</button>
        <button 
          onClick={modal.onConfirm} 
          className={`gm-btn-confirm-p ${modal.isDanger ? 'danger' : ''}`}
        >
          {modal.confirmText}
        </button>
      </div>
    </div>
  </div>
);

export const PolicyModal = ({ onClose, onContinue }) => {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="gm-modal-overlay-p">
      <div className="gm-policy-modal">
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff", margin: 0 }}>Políticas de Cambios y Devoluciones</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: '12px', padding: '14px 18px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ color: "#cbd5e1", lineHeight: "1.4", fontSize: "0.8rem", marginBottom: "12px", fontWeight: 600 }}>
              En <span style={{ color: '#FFC107' }}>Gorras Medellín Caps</span> queremos que tu experiencia sea excelente. Para garantizar un proceso de cambio exitoso, ten en cuenta:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'start' }}>
                  <FaCheckCircle style={{ color: '#FFC107', marginTop: '2px', flexShrink: 0 }} size={12} />
                  <p style={{ color: "#94a3b8", fontSize: "0.75rem", lineHeight: "1.4", margin: 0 }}>
                    Tienes un plazo máximo de <strong>5 días</strong> tras recibir el pedido para solicitar el cambio.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'start' }}>
                  <FaCheckCircle style={{ color: '#FFC107', marginTop: '2px', flexShrink: 0 }} size={12} />
                  <p style={{ color: "#94a3b8", fontSize: "0.75rem", lineHeight: "1.4", margin: 0 }}>
                    La gorra debe estar <strong>totalmente nueva</strong>, sin rastro de uso y con sus etiquetas originales.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'start' }}>
                  <FaCheckCircle style={{ color: '#FFC107', marginTop: '2px', flexShrink: 0 }} size={12} />
                  <p style={{ color: "#94a3b8", fontSize: "0.75rem", lineHeight: "1.4", margin: 0 }}>
                    No realizamos devoluciones de dinero (reembolsos).
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'start' }}>
                  <FaCheckCircle style={{ color: '#FFC107', marginTop: '2px', flexShrink: 0 }} size={12} />
                  <p style={{ color: "#94a3b8", fontSize: "0.75rem", lineHeight: "1.4", margin: 0 }}>
                    El costo de los envíos para cambios corre por cuenta del cliente.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.1)', padding: '12px 18px', borderRadius: '12px' }}>
            <h4 style={{ color: '#ef4444', margin: '0 0 6px 0', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaExclamationTriangle size={11} /> PRODUCTOS CON DEFECTO DE FÁBRICA
            </h4>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'start' }}>
              <FaCheckCircle style={{ color: '#ef4444', marginTop: '2px', flexShrink: 0 }} size={12} />
              <p style={{ color: '#cbd5e1', fontSize: '0.75rem', margin: 0, lineHeight: 1.4 }}>
                Si el producto llegó defectuoso, repórtalo en las primeras <strong>48 horas</strong> post-entrega. En este caso, nosotros asumiremos el costo del envío.
              </p>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', display: 'flex', flexDirection: 'column' }}>
          <label className="gm-checkbox-row" style={{ marginBottom: '15px' }}>
            <input 
              type="checkbox" 
              className="gm-checkbox-custom" 
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              style={{ width: '16px', height: '16px' }}
            />
            <span className="gm-checkbox-label" style={{ fontSize: '0.75rem' }}>Acepto las políticas de cambios de productos de Gorras Medellín Caps.</span>
          </label>

          <div style={{ display: "flex", gap: "10px", width: '100%' }}>
            <button onClick={onClose} className="gm-btn-cancel-p" style={{ flex: 1, fontSize: '0.8rem', height: '36px' }}>CANCELAR</button>
            <button 
              onClick={onContinue} 
              className="gm-btn-confirm-p" 
              style={{ flex: 1, fontSize: '0.8rem', height: '36px' }}
              disabled={!accepted}
            >
              CONTINUAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ExpiredReturnModal = ({ onClose, periodDays, expiredDate, orderDate }) => (
  <div className="gm-modal-overlay-p">
    <div className="gm-policy-modal" style={{ textAlign: 'center', padding: '40px 30px' }}>
      <div style={{ width: "70px", height: "70px", backgroundColor: "rgba(245, 158, 11, 0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", border: "1px solid #f59e0b" }}>
        <FaExclamationTriangle color="#f59e0b" size={32} />
      </div>
      
      <h3 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "12px", color: "#fff" }}>El período de cambio terminó</h3>
      <p style={{ color: "#94a3b8", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "25px" }}>
        ¡Lo sentimos! La ventana de cambios de <strong>{periodDays} días</strong> ha pasado. 
        <span style={{ display: 'block', color: '#f59e0b', marginTop: '10px', fontWeight: '600' }}>Ya no puedes solicitar un nuevo cambio o devolución.</span>
      </p>

      <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '15px', marginBottom: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>El período de cambio terminó el</div>
        <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '800', marginBottom: '4px' }}>{expiredDate}</div>
        <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Pedido el {orderDate}</div>
      </div>

      <button 
        onClick={onClose} 
        style={{ width: "100%", padding: "14px", borderRadius: "12px", backgroundColor: "#FFC107", color: "#000", border: "none", fontWeight: 800, cursor: "pointer", fontSize: "1rem", boxShadow: '0 4px 15px rgba(255, 193, 7, 0.3)' }}
      >
        ENTENDIDO
      </button>
      
      <div style={{ marginTop: '20px' }}>
        <a href="/politicas-cambios" style={{ color: '#FFC107', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '600' }}>Ver Política de Cambios y Reembolsos ›</a>
      </div>
    </div>
  </div>
);

export const RejectionReasonModal = ({ reason, onClose }) => (
  <div className="gm-modal-overlay-p">
    <div className="gm-rejection-modal">
      <div className="gm-rejection-modal-header">
        <h3 className="gm-rejection-modal-title">Motivo del Rechazo</h3>
        <button className="gm-rejection-modal-close" onClick={onClose}>
          <FaTimes size={18} />
        </button>
      </div>
      <div className="gm-rejection-modal-content">
        <p className="gm-rejection-text">{reason}</p>
      </div>
    </div>
  </div>
);

