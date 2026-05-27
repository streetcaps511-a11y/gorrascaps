/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React from 'react';
import { FaEye, FaStar } from 'react-icons/fa';

const ProductCard = ({ product, openModal, safeImg, getRatingFromProduct }) => {
  if (!product) return null;

  const isAgotado = Number(product.stock) <= 0;
  const isOffer = !!product.enOferta;
  const price = Number(product.precio || 0);
  const offerPrice = Number(product.precioOferta || 0);

  return (
    <div className={`gm-card ${isAgotado ? 'agotado' : ''}`} onClick={() => !isAgotado && openModal(product)}>
      <div className="gm-card-imgbox">
        <img src={safeImg(product)} alt={product.nombre} loading="lazy" />
        <div className="gm-card-overlay">
          <div className="gm-card-view-btn">
            <FaEye /> <span>Ver Detalles</span>
          </div>
        </div>
        
        {/* Badges */}
        {isAgotado ? (
          <div className="gm-img-badge-corner agotado">Agotado</div>
        ) : isOffer && (
          <div className="gm-img-badge-corner oferta">Oferta</div>
        )}
      </div>

      <div className="gm-card-info">
        <div className="gm-card-header">
           <span className="gm-card-cat">{product.categoria || 'Gorra'}</span>
           <div className="gm-card-rating">
             <FaStar size={10} color="#F5C81B" />
             <span>{getRatingFromProduct ? getRatingFromProduct(product) : '5.0'}</span>
           </div>
        </div>
        
        <h3 className="gm-card-title">{product.nombre}</h3>
        
        <div className="gm-card-footer">
          <div className="gm-card-price-box">
            {isOffer && offerPrice > 0 ? (
              <>
                <span className="gm-card-price oferta">${offerPrice.toLocaleString('es-CO')}</span>
                <span className="gm-card-old-price">${price.toLocaleString('es-CO')}</span>
              </>
            ) : (
              <span className="gm-card-price">${price.toLocaleString('es-CO')}</span>
            )}
          </div>
          
          <button className="gm-card-add" title="Ver producto">
             <div className="gm-card-add-inner">
               <FaEye size={14} />
             </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
