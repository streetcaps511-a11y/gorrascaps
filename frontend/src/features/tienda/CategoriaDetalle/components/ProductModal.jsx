/* === COMPONENTE REUTILIZABLE === 
   Pieza modular de interfaz (como Tarjetas, Modales o Botones). 
   Recibe información a través de 'props' y notifica eventos hacia arriba (a la Página principal). */

import React from 'react';
import { FaTimes, FaMinus, FaPlus, FaShoppingCart, FaBan, FaShareAlt, FaCheck, FaWhatsapp, FaFacebook, FaTwitter, FaLink, FaChevronLeft, FaChevronRight, FaRegCopy } from 'react-icons/fa';
import '../styles/ProductModal.css';

// Helper: mapea nombre de color a hex para background
const colorNameToHex = (name) => {
  const map = {
    'azul marino': '#000080',
    negro: '#000000', black: '#000000',
    blanco: '#ffffff', white: '#ffffff',
    rojo: '#ff0000', red: '#ff0000',
    azul: '#0000ff', blue: '#0000ff',
    verde: '#008000', green: '#008000',
    amarillo: '#ffff00', yellow: '#ffff00',
    morado: '#800080', purple: '#800080',
    gris: '#808080', gray: '#808080', grey: '#808080',
    naranja: '#ffa500', orange: '#ffa500',
    rosa: '#ffc0cb', pink: '#ffc0cb',
    cafe: '#6f4e37', café: '#6f4e37', brown: '#6f4e37', marrón: '#6f4e37',
    beige: '#f5f5dc',
    crema: '#fffdd0',
    celeste: '#87ceeb',
    lila: '#e6e6fa',
    hueso: '#f5f5dc',
    dorado: '#d4ac0d', gold: '#d4ac0d',
    plata: '#c0c0c0', silver: '#c0c0c0',
    negro_alt: '#777777', 
  };
  return map[name.toLowerCase()] || name.toLowerCase();
};

const ProductModal = ({
  product,
  closeModal,
  inventory,
  selectedSize,
  handleSizeSelect,
  quantity,
  incrementQuantity,
  decrementQuantity,
  handleModalAddToCart,
  showSizeError,
  handleQuantityInput,
  safeImg,
  normalizeSizes = (p) => {
    const t = p?.tallas;
    if (!t) return [];
    if (Array.isArray(t)) return t.filter(Boolean).map(x => String(x).trim()).filter(Boolean);
    if (typeof t === 'string') return t.split(',').map(s => s.trim()).filter(Boolean);
    return [];
  }
}) => {
  const [copied, setCopied] = React.useState(false);
  const [showShareMenu, setShowShareMenu] = React.useState(false);
  const [showFullDesc, setShowFullDesc] = React.useState(false);
  const [copiedSKU, setCopiedSKU] = React.useState(false);
  const [modalImgIndex, setModalImgIndex] = React.useState(0);

  const handleShare = (e) => {
    if (e) e.stopPropagation();
    setShowShareMenu(!showShareMenu);
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}/productos?producto=${product.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShowShareMenu(false);
    }, 2000);
  };

  const shareSocial = (platform) => {
    const text = `¡Mira esta gorra en Gorras Medellín!: ${product.nombre}`;
    const url = `${window.location.origin}/productos?producto=${product.id}`;
    let shareUrl = '';
    if (platform === 'whatsapp') shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + '\n' + url)}`;
    if (platform === 'facebook') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    if (platform === 'twitter') shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank');
    setShowShareMenu(false);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setModalImgIndex((prev) => (prev + 1) % images.length);
  };
  const prevImage = (e) => {
    e.stopPropagation();
    setModalImgIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  React.useEffect(() => {
    if (product) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [product]);

  if (!product) return null;
  const displayRef = product.id_producto_ref || String(product.id).padStart(6, '0');
  const images = Array.isArray(product.imagenes) && product.imagenes.filter(Boolean).length
    ? product.imagenes.filter(Boolean).map(x => String(x).trim()).filter(Boolean)
    : [safeImg(product)];

  const sizes = normalizeSizes(product);

  const getAvailableFor = (inv, productId, size) => {
    if (inv) {
      const pid = String(productId);
      return Math.max(0, Number(inv?.[pid]?.[size] ?? 0));
    }
    if (!product.tallasStock) return 0;
    try {
      const stockObj = typeof product.tallasStock === 'string'
        ? JSON.parse(product.tallasStock)
        : product.tallasStock;
      
      if (Array.isArray(stockObj)) {
        const found = stockObj.find(item => String(item.talla || '').toLowerCase() === String(size).toLowerCase());
        return found ? Number(found.cantidad || 0) : 0;
      }
      return Number(stockObj[size] ?? 0);
    } catch {
      return 0;
    }
  };

  const remaining = selectedSize ? getAvailableFor(inventory, product.id, selectedSize) : 0;

  const isAgotado = Number(product.stock) === 0;
  const isOffer = (product.hasDiscount || product.has_discount || product.oferta) && product.precioOferta;

  const getWholesalePrice = (qty, prod) => {
    const q = parseInt(qty) || 0;
    if (q >= 80 && parseFloat(prod.precioMayorista80) > 0) return prod.precioMayorista80;
    if (q >= 6 && parseFloat(prod.precioMayorista6) > 0) return prod.precioMayorista6;
    return isOffer ? prod.precioOferta : (prod.precioVenta || prod.precio);
  };

  const currentPrice = getWholesalePrice(quantity, product);

  return (
    <div className="gm-modal-overlay" onClick={(e) => e.stopPropagation()}>
      <div className="gm-modal" onClick={(e) => e.stopPropagation()}>
        {/* Botón compartir */}
        <div 
          className={`gm-share-btn ${showShareMenu ? 'active' : ''}`} 
          onClick={handleShare}
          title="Compartir producto"
          style={{ cursor: 'pointer' }}
        >
          <FaShareAlt style={{ color: "#94a3b8" }} />
          {showShareMenu && (
            <div className="gm-share-popover" onClick={e => e.stopPropagation()}>
              <div className="gm-share-header">Compartir en</div>
              <div className="gm-share-options">
                <button className="gm-share-option whatsapp" onClick={() => shareSocial('whatsapp')} data-tooltip="WhatsApp">
                  <FaWhatsapp />
                </button>
                <button className="gm-share-option facebook" onClick={() => shareSocial('facebook')} data-tooltip="Facebook">
                  <FaFacebook />
                </button>
                <button className="gm-share-option twitter" onClick={() => shareSocial('twitter')} data-tooltip="Twitter">
                  <FaTwitter />
                </button>
                <button className="gm-share-option copy" onClick={copyToClipboard} data-tooltip="Copiar enlace">
                  {copied ? <FaCheck /> : <FaLink />}
                </button>
              </div>
              <div className="gm-share-footer">
                {copied ? '¡Copiado!' : 'Copiar enlace'}
              </div>
            </div>
          )}
        </div>
        
        {/* Botón cerrar */}
        <button className="gm-modal-close" onClick={closeModal} type="button">
          <FaTimes size={18} />
        </button>

        {/* LEFT: IMAGE */}
        <div className="gm-modal-left">
          <div className="gm-modal-imgbox">
            {isAgotado && <div className="gm-img-badge-corner agotado">AGOTADO</div>}
            {isOffer && <div className="gm-img-badge-corner oferta">OFERTA</div>}
            <img src={images[modalImgIndex]} alt={product.nombre} className="gm-modal-img" />
            {images.length > 1 && (
              <>
                <button className="gm-modal-arrow prev" onClick={prevImage} type="button">
                  <FaChevronLeft />
                </button>
                <button className="gm-modal-arrow next" onClick={nextImage} type="button">
                  <FaChevronRight />
                </button>
              </>
            )}
            {images.length > 1 && (
              <div className="gm-modal-dots">
                {images.map((_, i) => (
                  <button
                    key={i}
                    className={`gm-modal-dot ${i === modalImgIndex ? 'active' : ''}`}
                    onMouseEnter={() => setModalImgIndex(i)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: INFO */}
        <div className="gm-modal-right">
          <div className="gm-modal-right-content">
            {/* 1. Title + Color Chips */}
            <div className="gm-modal-title-colors" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h2 className="gm-modal-title" style={{ margin: 0, fontSize: '1.3rem', color: isOffer ? '#fff' : '#F5C81B' }}>
                {product.nombre}
              </h2>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                {product.colores && product.colores.filter(Boolean).length > 0 && (
                  <div className="gm-modal-colors-inline" style={{ marginTop: 0 }}>
                    {product.colores.filter(Boolean).map((c, idx) => {
                      const hex = colorNameToHex(c);
                      const swatchBg = (c.toLowerCase() === 'negro' || hex === '#000000') ? '#000' : hex;
                      return (
                        <span key={idx} className="gm-color-chip">
                          <span
                            className="gm-color-chip-swatch"
                            style={{
                              backgroundColor: swatchBg,
                              borderColor: swatchBg === '#000' ? '#FFF' : 'rgba(255,255,255,0.15)'
                            }}
                          />
                          {c}
                        </span>
                      );
                    })}
                  </div>
                )}

                <span className="gm-modal-category-badge" style={{ marginLeft: product.colores && product.colores.filter(Boolean).length ? '6px' : '0' }}>
                  {product.categoria || product.Categoria || product.category}
                </span>

                <div
                  className="gm-product-sku-inline"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(displayRef);
                    setCopiedSKU(true);
                    setTimeout(() => setCopiedSKU(false), 2000);
                  }}
                  style={{ marginLeft: '8px' }}
                >
                  <span>Ref: #{displayRef}</span>
                  <FaRegCopy style={{ fontSize: '11px' }} />
                  {copiedSKU && <span style={{ fontSize: '10px' }}>¡Copiado!</span>}
                </div>
              </div>
            </div>

            {/* 2. Price Row */}
            <div className="gm-price-row">
              <div className="gm-modal-price-container">
                <div className="gm-modal-price-main">
                  ${Math.round(currentPrice || 0).toLocaleString('es-CO')}
                </div>
                {isOffer && (
                  <div className="gm-original-price-row">
                    <span className="gm-original-price">
                       Antes: ${Math.round(product.precioVenta || product.precio).toLocaleString('es-CO')}
                    </span>
                    <span className="gm-discount-badge">
                      {Math.round((( (product.precioVenta || product.precio) - product.precioOferta) / (product.precioVenta || product.precio)) * 100)}% DCTO
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Meta Row: Category | Ref (Moved back here) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
              <span style={{ fontSize: '12px', color: '#F5C81B', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {product.categoria || product.Categoria || product.category}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
              <div 
                className="gm-product-sku-simple" 
                onClick={(e) => {
                  e.stopPropagation();
                  const idToCopy = product.id_producto_ref || product.id;
                  navigator.clipboard.writeText(idToCopy);
                  setCopiedSKU(true);
                  setTimeout(() => setCopiedSKU(false), 2000);
                }} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px', 
                  fontSize: '12px', 
                  color: copiedSKU ? '#10b981' : '#94a3b8', 
                  cursor: 'pointer',
                  fontWeight: '700'
                }}
              >
                <span>Ref: #{product.id_producto_ref || product.id}</span>
                <FaRegCopy style={{ fontSize: '11px' }} />
                {copiedSKU && <span style={{ fontSize: '10px' }}>¡Copiado!</span>}
              </div>
            </div>

            {/* 3. Bulk Info Row */}
            <div className="gm-modal-bulk-row">
              <div className="gm-modal-tags-inline">
                {parseInt(quantity) >= 80 && parseFloat(product.precioMayorista80) > 0 ? (
                  <span className="gm-tag" style={{ backgroundColor: '#10b981', color: '#fff' }}>Mayorista 80+</span>
                ) : parseInt(quantity) >= 6 && parseFloat(product.precioMayorista6) > 0 ? (
                  <span className="gm-tag" style={{ backgroundColor: '#2a4a6f', color: '#fff' }}>Mayorista 6+</span>
                ) : null}
              </div>
              <div className="gm-bulk-info-box">
                <span className="gm-bulk-info-text" style={{ fontSize: '0.74rem', fontWeight: 500, color: '#93c5fd', whiteSpace: 'nowrap' }}>
                  A partir de 6 unidades tienes descuento por mayor
                </span>
              </div>
            </div>

            {/* 4. Description */}
            <div className="gm-modal-desc-box-clean">
              <div className="gm-desc-wrapper" style={{ position: 'relative' }}>
                <p className={`gm-modal-description ${showFullDesc ? 'is-expanded' : 'is-collapsed'}`} style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.78rem', lineHeight: '1.4' }}>
                  {product.descripcion || "Sin descripción disponible."}
                </p>
                {product.descripcion && product.descripcion.length > 140 && (
                  <button 
                    className="gm-ver-mas-btn-overlay" 
                    onClick={() => setShowFullDesc(!showFullDesc)}
                    type="button"
                
                  >
                    {showFullDesc ? 'ver menos' : 'ver más'}
                  </button>
                )}
              </div>
            </div>

            {/* 5. Sizes */}
            {sizes.length > 0 && (
              <div className="gm-sizes">
                <div className="gm-sizes-head">
                  <span className="gm-sizes-label" style={{ fontSize: '12px' }}>Talla:</span>
                </div>
                <div className="gm-sizes-wrap">
                  {sizes.map((t) => {
                    const ava = getAvailableFor(inventory, product.id, t);
                    const isOutOfStock = Number(product.stock) === 0;
                    const disabled = ava <= 0 || isOutOfStock;
                    const isSelected = selectedSize === t;
                    return (
                      <div key={t} className="gm-size-chip-container">
                        {!disabled && <div className="gm-size-tooltip">disponible: {ava}</div>}
                        {disabled && <div className="gm-size-tooltip">{isOutOfStock ? "agotado" : "talla agotada"}</div>}
                        <button
                          type="button"
                          className={`gm-size-chip ${disabled ? "is-disabled" : ""} ${isSelected ? "is-selected" : ""}`}
                          onClick={() => !disabled && handleSizeSelect(t)}
                          style={{ fontSize: '12px' }}
                        >
                          {t}
                        </button>
                      </div>
                    );
                  })}
                </div>
                {showSizeError && (
                  <div className="gm-size-error-msg">⚠️ Debes seleccionar una talla primero</div>
                )}
              </div>
            )}

            {/* 6. Quantity + Stock */}
            <div className="gm-quantity-selector">
              <div className="gm-quantity-label">Cantidad:</div>
              <div className="gm-quantity-row">
                <div className="gm-quantity-controls">
                  <button className="gm-qty-btn" onClick={decrementQuantity} disabled={Number(product.stock) === 0 || parseInt(quantity) <= 0} type="button">
                    <FaMinus size={10} />
                  </button>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="gm-qty-input-manual"
                    value={quantity}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      handleQuantityInput(val);
                    }}
                    disabled={Number(product.stock) === 0}
                    onFocus={(e) => setTimeout(() => e.target.select(), 10)}
                  />
                  <button className="gm-qty-btn" onClick={incrementQuantity} disabled={Number(product.stock) === 0 || (selectedSize && parseInt(quantity) >= remaining)} type="button">
                    <FaPlus size={10} />
                  </button>
                </div>
                {selectedSize && parseInt(quantity) >= remaining && remaining > 0 && (
                  <span className="gm-stock-badge" style={{ fontSize: '10px' }}>
                    {remaining} RESTANTES
                  </span>
                )}
              </div>
            </div>

            {/* 7. Add to Cart */}
            <button
              className={`gm-btn-add-cart ${Number(product.stock) === 0 ? "gm-btn-disabled-agotado" : ""} ${showSizeError ? "gm-btn-error" : ""}`}
              onClick={handleModalAddToCart}
              disabled={Number(product.stock) === 0}
            >
              {Number(product.stock) === 0 ? (
                <><FaBan size={18} className="gm-btn-icon" /> <span>agotado</span></>
              ) : (
                <><FaShoppingCart size={18} className="gm-btn-icon" /> <span>añadir al carrito</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
