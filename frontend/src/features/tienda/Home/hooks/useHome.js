/* === HOOK DE LÓGICA === 
   Este archivo maneja el estado de React, las reglas de negocio, y las validaciones del módulo. 
   Separa la 'inteligencia' de la interfaz visual para mantener el código limpio. 
   Recibe eventos de la UI y se comunica con los Servicios API. */

import { useState, useEffect, useMemo, useCallback } from "react";
import { getHomeProducts } from "../services/homeApi";
import { getProductoById } from "../../Productos/services/productosApi";
import { useCart } from "../../../shared/contexts";
import { NitroCache } from "../../../shared/utils/NitroCache";

/* =========================
   CONSTANTES Y HELPERS
   ========================= */
const BULK_MIN_QTY = 6;
const BULK_DISCOUNT = 0.1;

const clampRating = (r) => {
  const n = Number(r);
  if (Number.isNaN(n)) return null;
  return Math.max(0, Math.min(5, n));
};

const getRatingFromProduct = (p) =>
  clampRating(p?.rating) ??
  clampRating(p?.calificacion) ??
  clampRating(p?.stars) ??
  clampRating(p?.score) ??
  null;

const normalizeSizes = (product) => {
  // 1. Intentar usar tallasStock (la fuente de verdad actual)
  if (Array.isArray(product?.tallasStock) && product.tallasStock.length > 0) {
    return product.tallasStock.map(t => t.talla).filter(Boolean);
  }

  // 2. Fallback a tallas (legacy)
  const t = product?.tallas;
  if (!t) return [];
  if (Array.isArray(t))
    return t.filter(Boolean).map((x) => String(x).trim()).filter(Boolean);
  if (typeof t === "string")
    return t.split(",").map((s) => s.trim()).filter(Boolean);
  if (typeof t === "object") return Object.keys(t).filter((k) => Boolean(t[k]));
  return [];
};

const safeImg = (product) => {
  const first =
    product?.imagenes?.[0]?.trim?.() ||
    product?.imagen?.trim?.() ||
    "https://via.placeholder.com/800x800?text=Sin+Imagen";
  return first;
};

/* =========================
   INVENTARIO HELPERS
   ========================= */
const buildInitialInventoryFromProducts = (products) => {
  const inv = {};
  for (const p of products) {
    const sizes = normalizeSizes(p);
    const pid = String(p.id);
    if (!sizes.length) continue;
    const total = Math.max(0, Number(p.stock ?? 0));
    
    if (p.tallasStock && p.tallasStock.length > 0) {
      inv[pid] = {};
      for (const t of p.tallasStock) {
        inv[pid][t.talla] = Number(t.cantidad) || 0;
      }
      continue;
    }

    const per = Math.floor(total / sizes.length);
    let rem = total - per * sizes.length;
    inv[pid] = {};
    for (const s of sizes) {
      const add = rem > 0 ? 1 : 0;
      inv[pid][s] = Math.max(0, per + add);
      if (rem > 0) rem -= 1;
    }
  }
  return inv;
};

const getAvailableFor = (inv, productId, talla) => {
  const pid = String(productId);
  return Math.max(0, Number(inv?.[pid]?.[talla] ?? 0));
};

const decreaseInventory = (inv, productId, talla, qty) => {
  const pid = String(productId);
  const next = { ...inv, [pid]: { ...(inv[pid] || {}) } };
  const current = getAvailableFor(inv, productId, talla);
  next[pid][talla] = Math.max(0, current - Math.max(0, qty));
  return next;
};

/* =========================
   CUSTOM HOOK
   ========================= */
export const useHome = () => {
  const { addToCart } = useCart();
  const [initialProducts, setInitialProducts] = useState([]);
  const [carouselIndices, setCarouselIndices] = useState({
    ofertas: 0,
    destacados: 0,
    masComprados: 0,
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [inventory, setInventory] = useState({});
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showSizeError, setShowSizeError] = useState(false);
  const [loading, setLoading] = useState(true);

  // FETCH PRODUCTOS CON CACÍE
  const fetchProductos = useCallback(async (forceRefresh = false) => {
    // Si la caché es reciente y no se fuerza el refresh, usar datos cacheados
    if (!forceRefresh && NitroCache.isFresh('home_products', 5 * 60 * 1000)) {
      const cached = NitroCache.get('home_products');
      if (cached?.data) {
        setInitialProducts(cached.data);
        setInventory(buildInitialInventoryFromProducts(cached.data));
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    try {
      const res = await getHomeProducts();
      if (res?.data?.data?.products) {
        const productosDatabase = res.data.data.products.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          categoria: p.categoria || 'Gorra',
          precio: Number(p.precio || 0),
          precioOferta: Number(p.precioOferta || 0),
          precioMayorista6: Number(p.precioMayorista6 || 0),
          precioMayorista80: Number(p.precioMayorista80 || 0),
          enOferta: !!p.enOferta,
          descripcion: p.descripcion || "",
          tallas: p.tallas || [],
          colores: p.colores || ["Negro"],
          imagenes: p.imagenes || [],
          destacado: !!p.destacado,
          sales: p.salesCount || 0,
          isActive: p.isActive !== undefined ? p.isActive : true,
          stock: p.stock,
          tallasStock: p.tallasStock || []
        }));
        
        setInitialProducts(productosDatabase);
        setInventory(buildInitialInventoryFromProducts(productosDatabase));
        
        // 💾 Guardar en caché compartida
        NitroCache.set('home_products', productosDatabase);
        NitroCache.set('gm_catalog', productosDatabase);
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        console.error("Error trayendo productos del Backend:", error);
      }
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchProductos(false); // Carga inicial (usa caché si es fresca)

    // 📡 Escuchar actualizaciones del admin (sincronización instantánea)
    const channel = new BroadcastChannel('app_sync');
    channel.onmessage = (event) => {
      if (event.data === 'productos_updated' || event.data === 'home_products_updated') {
        NitroCache.clear('home_products');
        NitroCache.clear('gm_catalog');
        fetchProductos(true); // Fuerza refresh desde el servidor
      }
    };

    window.scrollTo(0, 0);
    return () => channel.close();
  }, [fetchProductos]);


  // SECCIONES
  const ofertas = useMemo(
    () => initialProducts.filter((p) => (p.hasDiscount || p.oferta) && p.isActive !== false).slice(0, 12),
    [initialProducts]
  );

  const destacados = useMemo(
    () => initialProducts.filter((p) => (p.destacado || p.isFeatured) && p.isActive !== false).slice(0, 12),
    [initialProducts]
  );

  const masComprados = useMemo(
    () => initialProducts.filter((p) => p.isActive !== false).slice(0, 12),
    [initialProducts]
  );

  const novedades = useMemo(
    () => [...initialProducts].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 12),
    [initialProducts]
  );

  const monastery = useMemo(
    () => initialProducts.filter((p) => p.categoria?.toLowerCase().includes("monastery") && p.isActive !== false).slice(0, 12),
    [initialProducts]
  );

  const nike = useMemo(
    () => initialProducts.filter((p) => p.categoria?.toLowerCase().includes("nike") && p.isActive !== false).slice(0, 12),
    [initialProducts]
  );

  // CARRUSEL
  const handleCarouselScroll = (sectionId, direction) => {
    setCarouselIndices((prev) => {
      const current = prev[sectionId] || 0;
      const targetSection = [
        { id: "ofertas", data: ofertas },
        { id: "destacados", data: destacados },
        { id: "novedades", data: novedades },
        { id: "monastery", data: monastery },
        { id: "nike", data: nike },
        { id: "masComprados", data: masComprados }
      ].find(s => s.id === sectionId);
      
      const items = targetSection?.data || [];
      const maxIndex = Math.max(0, Math.ceil(items.length / 4) - 1);
      const next = direction === "left" ? Math.max(0, current - 1) : Math.min(maxIndex, current + 1);
      return { ...prev, [sectionId]: next };
    });
  };

  const [loadingDetail, setLoadingDetail] = useState(false);

  // MODAL LOGIC con carga bajo demanda
  const openModal = async (product) => {
    // Si ya tenemos descripción larga, ya está cargado
    if (product.descripcion && product.descripcion.length > 50) {
      setSelectedProduct(product);
      setSelectedSize(null);
      setQuantity(0);
      setShowSizeError(false);
      return;
    }

    setLoadingDetail(true);
    try {
      const response = await getProductoById(product.id);
      if (response.data.success) {
        const fullProd = response.data.data;
        // Mapeamos para que useHome lo entienda (si es necesario)
        const mapped = {
          ...product,
          ...fullProd,
          descripcion: fullProd.descripcion || "",
          tallas: fullProd.tallas || [],
          tallasStock: fullProd.tallasStock || [],
          imagenes: fullProd.imagenes || product.imagenes || []
        };
        setSelectedProduct(mapped);
      } else {
        setSelectedProduct(product);
      }
    } catch (error) {
      console.error("Error al cargar detalle en Home:", error);
      setSelectedProduct(product);
    } finally {
      setLoadingDetail(false);
      setSelectedSize(null);
      setQuantity(0);
      setShowSizeError(false);
    }
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setSelectedSize(null);
    setQuantity(0);
    setShowSizeError(false);
  };

  const handleSizeSelect = (talla) => {
    if (selectedSize === talla) {
      setSelectedSize(null);
      setQuantity(0);
    } else {
      setSelectedSize(talla);
      setShowSizeError(false);
      setQuantity(0);
    }
  };

  const addQuickToCart = (product, size, qty) => {
    if (!size) return;
    const available = getAvailableFor(inventory, product.id, size);
    if (available < qty) return;
    const q = parseInt(qty) || 0;
    if (q <= 0) return;

    let finalPrice = (product.precioOferta > 0 && product.precioOferta < product.precio)
                    ? Math.round(product.precioOferta) 
                    : Math.round(product.precio || 0);

    if (q >= 80 && parseFloat(product.precioMayorista80) > 0) {
      finalPrice = Math.round(product.precioMayorista80);
    } else if (q >= 6 && parseFloat(product.precioMayorista6) > 0) {
      finalPrice = Math.round(product.precioMayorista6);
    }

    const cartItem = {
      // Identificadores
      id: product.id,
      id_producto: product.id,
      
      // Info Básica
      nombre: product.nombre,
      name: product.nombre,
      imagen: safeImg(product),
      image: safeImg(product),
      categoria: product.categoria,
      categoria_nombre: product.categoria,
      
      // Precios (Asegurar que existan todos los nombres posibles)
      precio: finalPrice, 
      precio_normal: Math.round(product.precio || 0),
      precioNormal: Math.round(product.precio || 0),
      precioOferta: product.precioOferta ? Math.round(product.precioOferta) : null,
      precio_descuento: product.precioOferta ? Math.round(product.precioOferta) : null,
      precioMayorista6: product.precioMayorista6,
      precio_mayorista6: product.precioMayorista6,
      precioMayorista80: product.precioMayorista80,
      precio_mayorista80: product.precioMayorista80,
      
      // Flags de Oferta
      enOfertaVenta: !!(product.enOfertaVenta || product.hasDiscount || product.oferta),
      oferta: !!(product.enOfertaVenta || product.hasDiscount || product.oferta),
      has_discount: !!(product.enOfertaVenta || product.hasDiscount || product.oferta),
      
      // Selección actual
      quantity: parseInt(qty) || 1,
      talla: size,
      
      // Stock para validación
      tallasStock: product.tallasStock || [],
      stock: parseInt(product.stock) || 0
    };

    addToCart(cartItem);
    setInventory(decreaseInventory(inventory, product.id, size, qty));
    
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
    closeModal();
  };

  const handleModalAddToCart = () => {
    const sizes = normalizeSizes(selectedProduct);
    if (sizes.length > 0 && !selectedSize) {
      setShowSizeError(true);
      setTimeout(() => setShowSizeError(false), 2000);
      return;
    }
    const size = selectedSize ? selectedSize : sizes[0];
    addQuickToCart(selectedProduct, size, quantity);
  };

  const incrementQuantity = () => {
    const sizes = normalizeSizes(selectedProduct);
    if (!selectedSize && sizes.length > 0) {
      setShowSizeError(true);
      setTimeout(() => setShowSizeError(false), 2000);
      return;
    }
    const available = selectedSize ? getAvailableFor(inventory, selectedProduct?.id, selectedSize) : 99;
    if (quantity < available) setQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 0) setQuantity(quantity - 1);
  };

  const handleQuantityInput = (val) => {
    if (val === '') {
      setQuantity('');
      return;
    }
    const num = parseInt(val);
    const available = selectedSize 
      ? getAvailableFor(inventory, selectedProduct?.id, selectedSize)
      : 99;
    
    if (!isNaN(num)) {
      if (num < 0) setQuantity(0);
      else if (num > available) setQuantity(available);
      else setQuantity(num);
    }
  };

  return {
    sections: [
      { id: "ofertas", title: "Ofertas especiales", link: "/ofertas", data: ofertas, tag: "OFERTA", badgeType: "discount" },
      { id: "destacados", title: "Gorras destacadas", link: "/productos?filter=destacados", data: destacados, tag: "DESTACADO", badgeType: "featured" },
      { id: "novedades", title: "Lo más Nuevo", link: "/productos", data: novedades, tag: "NUEVO", badgeType: "featured" },
      { id: "monastery", title: "Monastery 1.1", link: "/categorias/MONASTERY%201.1", data: monastery, tag: "MONASTERY", badgeType: "featured" },
      { id: "nike", title: "Nike 1.1", link: "/categorias/NIKE%201.1", data: nike, tag: "NIKE", badgeType: "featured" },
      { id: "masComprados", title: "Los más comprados", link: "/productos", data: masComprados, tag: "MÁS VENDIDO", badgeType: "popular" }
    ],
    carouselIndices,
    handleCarouselScroll,
    selectedProduct,
    openModal,
    closeModal,
    inventory,
    getAvailableFor,
    selectedSize,
    handleSizeSelect,
    quantity,
    incrementQuantity,
    decrementQuantity,
    handleQuantityInput,
    handleModalAddToCart,
    showSuccessToast,
    showSizeError,
    loading,
    getRatingFromProduct,
    normalizeSizes,
    safeImg,
    BULK_MIN_QTY
  };
};
