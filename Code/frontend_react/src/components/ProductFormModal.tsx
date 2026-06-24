import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { showStatusModal } from './StatusModal';
import type { StoreProduct } from '../types/store-product';

export interface ProductFormModalProps {
  onClose: () => void;
  product?: StoreProduct;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({ onClose, product }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [serverError, setServerError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const firstInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: product?.name ?? '',
    description: product?.description ?? '',
    price: product?.price !== undefined ? String(product.price) : '',
    stock: product?.stock !== undefined ? String(product.stock) : '',
    category: product?.idCategoria ? String(product.idCategoria) : '',
    imageUrl: product?.imageUrl ?? '',
    flashDiscount: product?.flashSalePercentage ? String(product.flashSalePercentage) : '',
    flashStart: product?.flashSaleStartDate ? new Date(new Date(product.flashSaleStartDate).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '',
    flashEnd: product?.flashSaleEndDate ? new Date(new Date(product.flashSaleEndDate).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    setTimeout(() => {
      firstInputRef.current?.focus();
    }, 50);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data, error } = await api.GET('/Categoria');
        if (error || !data) throw new Error('Error al cargar');
        setCategories(data as any[]);
      } catch (e) {
        // error
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 200);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateField = (name: string, value: string, label: string) => {
    if (!value.trim()) {
      setErrors(prev => ({ ...prev, [name]: `${label} es requerido.` }));
    } else {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    
    let valid = true;
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) { newErrors.name = 'Nombre del producto es requerido.'; valid = false; }
    if (!formData.price.trim()) { newErrors.price = 'Precio es requerido.'; valid = false; }
    if (!formData.stock.trim()) { newErrors.stock = 'Stock disponible es requerido.'; valid = false; }
    if (!formData.category.trim()) { newErrors.category = 'Categoría es requerido.'; valid = false; }
    
    setErrors(newErrors);
    
    if (!valid) return;
    
    setIsSubmitting(true);
    
    const payload = {
      nombre: formData.name.trim(),
      descripcion: formData.description.trim(),
      precioBase: Number(formData.price) || 0,
      stock: Number(formData.stock) || 0,
      idCategoria: Number(formData.category) || 0,
      urlImagen: formData.imageUrl.trim()
    };
    
    try {
      let finalProductId = product ? Number(product.id) : 0;
      
      if (product) {
        const { error } = await api.PUT('/Producto/{id}', {
          params: { path: { id: finalProductId } } as any,
          body: payload,
        });
        if (error) throw new Error((error as any).mensaje || 'Error al actualizar el producto');
      } else {
        const { data, error } = await api.POST('/Producto', { body: payload });
        if (error) throw new Error((error as any).mensaje || 'Error al crear el producto');
        if (data && typeof data === 'object' && 'idProducto' in data) {
          finalProductId = Number((data as any).idProducto);
        }
      }
      
      if (formData.flashDiscount && formData.flashStart && formData.flashEnd && finalProductId > 0) {
        const flashPayload = {
          porcentajeDescuento: Number(formData.flashDiscount),
          fechaInicio: new Date(formData.flashStart).toISOString(),
          fechaFin: new Date(formData.flashEnd).toISOString(),
        };
        const { error: flashError } = await api.POST('/Producto/{id}/oferta-flash', {
          params: { path: { id: finalProductId } } as any,
          body: flashPayload,
        });
        
        if (flashError) {
          const errObj = flashError as any;
          if (errObj.errors && errObj.errors.FechaFin) {
            throw new Error(errObj.errors.FechaFin.join(' '));
          }
          throw new Error(errObj.mensaje || 'Error al configurar la Oferta Flash');
        }
      }
      
      handleClose();
      showStatusModal({
        type: 'success',
        title: product ? 'Producto actualizado' : 'Producto creado exitosamente',
        autoCloseMs: 3000,
        onClose: () => window.location.reload()
      });
      
    } catch (err: any) {
      setServerError(err.message || 'Ocurrió un error inesperado');
      setIsSubmitting(false);
    }
  };

  const isEdit = !!product;

  return (
    <div className={`edit-profile-wrapper${isClosing ? ' edit-profile-wrapper--closing' : ''}`}>
      <div className="edit-profile-backdrop" aria-hidden="true" onClick={handleClose}></div>
      <div className="edit-profile-modal" role="dialog" aria-modal="true" aria-labelledby="create-product-title">
        <div className="edit-profile-modal__header">
          <h2 className="edit-profile-modal__title" id="create-product-title">{isEdit ? 'Editar Producto' : 'Crear Nuevo Producto'}</h2>
          <button className="edit-profile-modal__close" aria-label="Cerrar" onClick={handleClose}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        
        <form className="edit-profile-modal__form" noValidate onSubmit={handleSubmit}>
          <div className="edit-profile-modal__grid">
            
            <div className="edit-profile-modal__field">
              <label className="edit-profile-modal__label" htmlFor="cp-name">Nombre del producto *</label>
              <input ref={firstInputRef} className={`edit-profile-modal__input${errors.name ? ' edit-profile-modal__input--error' : ''}`} id="cp-name" name="name" type="text" placeholder="Ej. Camiseta de algodón" aria-required="true" value={formData.name} onChange={handleInputChange} onBlur={(e) => validateField('name', e.target.value, 'Nombre del producto')} />
              <span className="edit-profile-modal__field-error" id="cp-name-error" role="alert" aria-live="polite">{errors.name}</span>
            </div>
            
            <div className="edit-profile-modal__field edit-profile-modal__field--full">
              <label className="edit-profile-modal__label" htmlFor="cp-description">Descripción</label>
              <textarea className="edit-profile-modal__input edit-profile-modal__textarea" id="cp-description" name="description" placeholder="Detalles del producto..." rows={3} value={formData.description} onChange={handleInputChange}></textarea>
              <span className="edit-profile-modal__field-error" id="cp-description-error" role="alert" aria-live="polite"></span>
            </div>
            
            <div className="edit-profile-modal__field">
              <label className="edit-profile-modal__label" htmlFor="cp-price">Precio *</label>
              <input className={`edit-profile-modal__input${errors.price ? ' edit-profile-modal__input--error' : ''}`} id="cp-price" name="price" type="number" step="0.01" min="0" placeholder="0.00" aria-required="true" value={formData.price} onChange={handleInputChange} onBlur={(e) => validateField('price', e.target.value, 'Precio')} />
              <span className="edit-profile-modal__field-error" id="cp-price-error" role="alert" aria-live="polite">{errors.price}</span>
            </div>
            
            <div className="edit-profile-modal__field">
              <label className="edit-profile-modal__label" htmlFor="cp-stock">Stock disponible *</label>
              <input className={`edit-profile-modal__input${errors.stock ? ' edit-profile-modal__input--error' : ''}`} id="cp-stock" name="stock" type="number" step="1" min="0" placeholder="Ej. 10" aria-required="true" value={formData.stock} onChange={handleInputChange} onBlur={(e) => validateField('stock', e.target.value, 'Stock disponible')} />
              <span className="edit-profile-modal__field-error" id="cp-stock-error" role="alert" aria-live="polite">{errors.stock}</span>
            </div>
            
            <div className="edit-profile-modal__field">
              <label className="edit-profile-modal__label" htmlFor="cp-category">Categoría *</label>
              <select className={`edit-profile-modal__input edit-profile-modal__select${errors.category ? ' edit-profile-modal__input--error' : ''}`} id="cp-category" name="category" aria-required="true" value={formData.category} onChange={handleInputChange} onBlur={(e) => validateField('category', e.target.value, 'Categoría')}>
                <option value="" disabled>{loadingCategories ? 'Cargando categorías...' : 'Selecciona una categoría'}</option>
                {categories.map(c => (
                  <option key={c.idCategoria} value={c.idCategoria}>{c.nombre}</option>
                ))}
              </select>
              <span className="edit-profile-modal__field-error" id="cp-category-error" role="alert" aria-live="polite">{errors.category}</span>
            </div>
            
            <div className="edit-profile-modal__field edit-profile-modal__field--full">
              <label className="edit-profile-modal__label" htmlFor="cp-imageUrl">URL de la imagen</label>
              <input className="edit-profile-modal__input" id="cp-imageUrl" name="imageUrl" type="url" placeholder="https://..." value={formData.imageUrl} onChange={handleInputChange} />
              <span className="edit-profile-modal__field-error" id="cp-imageUrl-error" role="alert" aria-live="polite"></span>
            </div>
            
            <div className="edit-profile-modal__field edit-profile-modal__field--full">
              <label className="edit-profile-modal__label" htmlFor="cp-flash-discount">Descuento Flash (%) - Opcional</label>
              <input className="edit-profile-modal__input" id="cp-flash-discount" name="flashDiscount" type="number" step="1" min="0" placeholder="Ej. 20" value={formData.flashDiscount} onChange={handleInputChange} />
              <span className="edit-profile-modal__field-error" id="cp-flash-discount-error" role="alert" aria-live="polite"></span>
            </div>
            
            <div className="edit-profile-modal__field">
              <label className="edit-profile-modal__label" htmlFor="cp-flash-start">Inicio Oferta Flash</label>
              <input className="edit-profile-modal__input" id="cp-flash-start" name="flashStart" type="datetime-local" value={formData.flashStart} onChange={handleInputChange} />
              <span className="edit-profile-modal__field-error" id="cp-flash-start-error" role="alert" aria-live="polite"></span>
            </div>
            
            <div className="edit-profile-modal__field">
              <label className="edit-profile-modal__label" htmlFor="cp-flash-end">Fin Oferta Flash</label>
              <input className="edit-profile-modal__input" id="cp-flash-end" name="flashEnd" type="datetime-local" value={formData.flashEnd} onChange={handleInputChange} />
              <span className="edit-profile-modal__field-error" id="cp-flash-end-error" role="alert" aria-live="polite"></span>
            </div>
            
          </div>
          
          {serverError && (
            <p className="edit-profile-modal__server-error" id="cp-server-error" role="alert" aria-live="assertive" style={{ display: 'block' }}>{serverError}</p>
          )}
          
          <div className="edit-profile-modal__actions" style={{ marginTop: '1rem' }}>
            <button type="button" className="edit-profile-modal__cancel-btn" onClick={handleClose}>Cancelar</button>
            <button type="submit" className="edit-profile-modal__save-btn" id="cp-save-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando…' : (isEdit ? 'Guardar cambios' : 'Crear producto')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
