import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, globalStore } from '../storeInstance';
import { formatPrice } from '../utils/currency';
import { Navbar } from '../components/Navbar';
import { CartDrawer } from '../components/CartDrawer';
import { showStatusModal } from '../components/StatusModal';
import { api } from '../utils/api';

type PaymentMethod = 'card' | 'qr';

export function CheckoutPage() {
  const navigate = useNavigate();
  const state = useStore();

  const [step, setStep] = useState<'method' | 'details' | 'confirm'>('method');
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [card, setCard] = useState<any>(null);

  const [cardData, setCardData] = useState({
    number: '',
    holder: '',
    month: '',
    year: '',
    cvv: '',
  });

  const [inlineError, setInlineError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!state.auth.isAuthenticated) {
      navigate('/login');
    } else {
      globalStore.setState({ cartOpen: false });
    }
  }, [navigate, state.auth.isAuthenticated]);

  if (!state.auth.isAuthenticated) {
    return <div>Redirigiendo a inicio de sesión...</div>;
  }

  const cart = state.cart || [];

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <Navbar />
        <div className="checkout-page__content">
          <div className="checkout-empty" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Tu carrito está vacío
            </h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
              Explora nuestro catálogo para encontrar lo que necesitas.
            </p>
            <button
              className="checkout-step__btn"
              style={{ maxWidth: '250px', margin: '0 auto' }}
              onClick={() => navigate('/home')}
            >
              Explorar el catálogo
            </button>
          </div>
        </div>
        <CartDrawer />
      </div>
    );
  }

  const subtotal = cart.reduce((s: number, i: any) => s + i.precioUnitario * i.cantidad, 0);
  const shipping = subtotal > 0 ? 5.99 : 0;
  const total = subtotal + shipping;

  const handleNextMethod = () => {
    if (!method) {
      setInlineError('Selecciona un método de pago.');
      return;
    }
    setInlineError('');
    setStep('details');
  };

  const handleCardInputChange = (field: string, value: string) => {
    let formatted = value;
    if (field === 'number') {
      formatted = value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    }
    setCardData(prev => ({ ...prev, [field]: formatted }));
  };

  const handleNextDetailsCard = () => {
    const rawNumber = cardData.number.replace(/\s/g, '');
    const errors: string[] = [];
    if (rawNumber.length < 13) errors.push('Número de tarjeta inválido.');
    if (!cardData.holder.trim()) errors.push('Ingresa el nombre del titular.');
    const m = Number(cardData.month);
    if (!cardData.month || m < 1 || m > 12) errors.push('Mes de vencimiento inválido.');
    if (!cardData.year || cardData.year.trim().length < 2) errors.push('Año de vencimiento inválido.');
    if (!cardData.cvv || cardData.cvv.trim().length < 3) errors.push('CVV inválido.');

    if (errors.length > 0) {
      setInlineError(errors[0]);
      return;
    }
    
    setInlineError('');
    setCard({
      cardNumber: `•••• •••• •••• ${rawNumber.slice(-4)}`,
      cardHolder: cardData.holder.trim(),
      expiryMonth: cardData.month.trim(),
      expiryYear: cardData.year.trim(),
    });
    setStep('confirm');
  };

  const handlePay = async () => {
    setIsProcessing(true);
    setInlineError('');

    try {
      const body = {
        direccionEnvio: 'Dirección de envío proporcionada',
        metodoPago: method === 'card' ? 'tarjeta' : 'qr',
        items: cart.map((i: any) => ({
          idProducto: i.idProducto,
          cantidad: i.cantidad,
        })),
      };

      const { error } = await api.POST('/api/PedidoControlador' as any, { body } as any);

      if (error) {
        throw new Error((error as any)?.mensaje || 'Error al procesar el pago');
      }

      globalStore.setState({ cart: [] });
      setCard(null);

      showStatusModal({
        type: 'success',
        title: '¡Pago exitoso!',
        message: 'Tu pedido fue confirmado. Recibirás un correo de confirmación.',
        onClose: () => navigate('/home'),
      });
    } catch (err: any) {
      setInlineError(err.message || 'Ocurrió un error al procesar el pago.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="checkout-page">
      <Navbar />
      <div className="checkout-page__content">
        <button
          className="checkout-page__back"
          onClick={() => {
            globalStore.setState({ cartOpen: true });
            navigate('/home');
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6"/>
          </svg> Volver al carrito
        </button>

        <div className="checkout-page__layout">
          <div className="checkout-page__panel">
            <div className="checkout-stepper">
              {['method', 'details', 'confirm'].map((st, i) => {
                const order = ['method', 'details', 'confirm'];
                const currentIdx = order.indexOf(step);
                const isDone = i < currentIdx;
                const isActive = st === step;
                const label = ['Método', 'Datos', 'Confirmar'][i];

                return (
                  <React.Fragment key={st}>
                    <div className={`checkout-stepper__item${isActive ? ' checkout-stepper__item--active' : ''}${isDone ? ' checkout-stepper__item--done' : ''}`}>
                      <div className="checkout-stepper__circle" aria-hidden="true">
                        {isDone ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        ) : (
                          String(i + 1)
                        )}
                      </div>
                      <span className="checkout-stepper__label">{label}</span>
                    </div>
                    {i < 2 && (
                      <div className={`checkout-stepper__line${isDone ? ' checkout-stepper__line--done' : ''}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <div className="checkout-page__step-container">
              {step === 'method' && (
                <div className="checkout-step">
                  <h2 className="checkout-step__title">Método de pago</h2>
                  <p className="checkout-step__subtitle">Selecciona cómo quieres pagar tu pedido.</p>
                  <div className="checkout-method__options">
                    <button
                      type="button"
                      className={`checkout-method__card${method === 'card' ? ' checkout-method__card--selected' : ''}`}
                      aria-pressed={method === 'card'}
                      onClick={() => { setMethod('card'); setInlineError(''); }}
                    >
                      <div className="checkout-method__card-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                      </div>
                      <div className="checkout-method__card-text">
                        <span className="checkout-method__card-label">Tarjeta</span>
                        <span className="checkout-method__card-desc">Débito o crédito</span>
                      </div>
                      <div className="checkout-method__card-check" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    </button>

                    <button
                      type="button"
                      className={`checkout-method__card${method === 'qr' ? ' checkout-method__card--selected' : ''}`}
                      aria-pressed={method === 'qr'}
                      onClick={() => { setMethod('qr'); setInlineError(''); }}
                    >
                      <div className="checkout-method__card-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><line x1="20" y1="14" x2="20" y2="14"/><line x1="17" y1="20" x2="20" y2="20"/><line x1="20" y1="17" x2="20" y2="20"/></svg>
                      </div>
                      <div className="checkout-method__card-text">
                        <span className="checkout-method__card-label">Código QR</span>
                        <span className="checkout-method__card-desc">Paga escaneando</span>
                      </div>
                      <div className="checkout-method__card-check" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    </button>
                  </div>
                  {inlineError && <p className="checkout-step__inline-error" role="alert">{inlineError}</p>}
                  <button className="checkout-step__btn" onClick={handleNextMethod}>Continuar</button>
                </div>
              )}

              {step === 'details' && method === 'qr' && (
                <div className="checkout-step">
                  <h2 className="checkout-step__title">Pago por QR</h2>
                  <p className="checkout-step__subtitle">Escanea el código con tu app bancaria o billetera digital.</p>
                  <div className="checkout-qr__box" aria-label="Código QR de pago">
                    <svg className="checkout-qr__svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <rect x="10" y="10" width="30" height="30" rx="3" fill="none" stroke="currentColor" strokeWidth="4"/>
                      <rect x="17" y="17" width="16" height="16" rx="1" fill="currentColor"/>
                      <rect x="80" y="10" width="30" height="30" rx="3" fill="none" stroke="currentColor" strokeWidth="4"/>
                      <rect x="87" y="17" width="16" height="16" rx="1" fill="currentColor"/>
                      <rect x="10" y="80" width="30" height="30" rx="3" fill="none" stroke="currentColor" strokeWidth="4"/>
                      <rect x="17" y="87" width="16" height="16" rx="1" fill="currentColor"/>
                      <rect x="50" y="10" width="6" height="6" fill="currentColor"/>
                      <rect x="60" y="10" width="6" height="6" fill="currentColor"/>
                      <rect x="50" y="20" width="6" height="6" fill="currentColor"/>
                      <rect x="64" y="22" width="6" height="6" fill="currentColor"/>
                      <rect x="50" y="50" width="6" height="6" fill="currentColor"/>
                      <rect x="60" y="50" width="6" height="6" fill="currentColor"/>
                      <rect x="70" y="50" width="6" height="6" fill="currentColor"/>
                      <rect x="80" y="50" width="6" height="6" fill="currentColor"/>
                      <rect x="50" y="60" width="6" height="6" fill="currentColor"/>
                      <rect x="64" y="60" width="6" height="6" fill="currentColor"/>
                      <rect x="50" y="70" width="6" height="6" fill="currentColor"/>
                      <rect x="60" y="70" width="6" height="6" fill="currentColor"/>
                      <rect x="74" y="70" width="6" height="6" fill="currentColor"/>
                      <rect x="80" y="60" width="6" height="6" fill="currentColor"/>
                      <rect x="90" y="50" width="6" height="6" fill="currentColor"/>
                      <rect x="100" y="60" width="6" height="6" fill="currentColor"/>
                      <rect x="90" y="70" width="6" height="6" fill="currentColor"/>
                      <rect x="100" y="80" width="6" height="6" fill="currentColor"/>
                      <rect x="80" y="80" width="6" height="6" fill="currentColor"/>
                      <rect x="50" y="80" width="6" height="6" fill="currentColor"/>
                      <rect x="60" y="90" width="6" height="6" fill="currentColor"/>
                      <rect x="50" y="100" width="6" height="6" fill="currentColor"/>
                      <rect x="70" y="100" width="6" height="6" fill="currentColor"/>
                    </svg>
                  </div>
                  <p className="checkout-qr__hint">El código expira en 10 minutos.</p>
                  <button className="checkout-step__btn" onClick={() => setStep('confirm')}>Ya realicé el pago</button>
                  <button type="button" className="checkout-step__back-btn" onClick={() => { setStep('method'); setInlineError(''); }}>← Volver</button>
                </div>
              )}

              {step === 'details' && method === 'card' && (
                <div className="checkout-step">
                  <h2 className="checkout-step__title">Datos de tarjeta</h2>
                  <p className="checkout-step__subtitle">Tus datos no se almacenan en ningún servidor.</p>
                  <div className="checkout-card__security">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Conexión segura — datos no almacenados
                  </div>
                  <div className="checkout-card__form">
                    <div className="checkout-card__field">
                      <label className="checkout-card__label" htmlFor="cc-number">Número de tarjeta</label>
                      <input className="checkout-card__input" id="cc-number" placeholder="0000 0000 0000 0000" type="text" maxLength={19} inputMode="numeric" value={cardData.number} onChange={e => handleCardInputChange('number', e.target.value)} />
                    </div>
                    <div className="checkout-card__field">
                      <label className="checkout-card__label" htmlFor="cc-holder">Nombre en la tarjeta</label>
                      <input className="checkout-card__input" id="cc-holder" placeholder="Como aparece en la tarjeta" type="text" autoComplete="cc-name" value={cardData.holder} onChange={e => handleCardInputChange('holder', e.target.value)} />
                    </div>
                    <div className="checkout-card__row">
                      <div className="checkout-card__field">
                        <label className="checkout-card__label" htmlFor="cc-month">Mes</label>
                        <input className="checkout-card__input" id="cc-month" placeholder="MM" type="text" maxLength={2} inputMode="numeric" value={cardData.month} onChange={e => handleCardInputChange('month', e.target.value)} />
                      </div>
                      <div className="checkout-card__field">
                        <label className="checkout-card__label" htmlFor="cc-year">Año</label>
                        <input className="checkout-card__input" id="cc-year" placeholder="AA" type="text" maxLength={2} inputMode="numeric" value={cardData.year} onChange={e => handleCardInputChange('year', e.target.value)} />
                      </div>
                      <div className="checkout-card__field">
                        <label className="checkout-card__label" htmlFor="cc-cvv">CVV</label>
                        <input className="checkout-card__input" id="cc-cvv" placeholder="•••" type="password" maxLength={4} inputMode="numeric" value={cardData.cvv} onChange={e => handleCardInputChange('cvv', e.target.value)} />
                      </div>
                    </div>
                  </div>
                  {inlineError && <p className="checkout-step__inline-error" role="alert">{inlineError}</p>}
                  <button className="checkout-step__btn" onClick={handleNextDetailsCard}>Continuar</button>
                  <button type="button" className="checkout-step__back-btn" onClick={() => { setStep('method'); setInlineError(''); }}>← Volver</button>
                </div>
              )}

              {step === 'confirm' && (
                <div className="checkout-step">
                  <h2 className="checkout-step__title">Confirmar pedido</h2>
                  <p className="checkout-step__subtitle">Revisa los detalles antes de confirmar.</p>
                  <div className="checkout-confirm__box">
                    <div className="checkout-confirm__row">
                      <span>Método de pago</span>
                      <span>{method === 'card' ? 'Tarjeta' : 'Código QR'}</span>
                    </div>
                    {method === 'card' && card && (
                      <>
                        <div className="checkout-confirm__row">
                          <span>Tarjeta</span>
                          <span>{card.cardNumber}</span>
                        </div>
                        <div className="checkout-confirm__row">
                          <span>Titular</span>
                          <span>{card.cardHolder}</span>
                        </div>
                        <div className="checkout-confirm__row">
                          <span>Vence</span>
                          <span>{card.expiryMonth}/{card.expiryYear}</span>
                        </div>
                      </>
                    )}
                    <div className="checkout-confirm__row">
                      <span>Productos</span>
                      <span>{cart.reduce((s: number, i: any) => s + i.cantidad, 0)}</span>
                    </div>
                    <div className="checkout-confirm__row checkout-confirm__row--total">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                  <p className="checkout-confirm__terms">
                    Al confirmar aceptas los términos de uso. Los datos de pago no son almacenados.
                  </p>
                  {inlineError && <p className="checkout-step__inline-error" role="alert">{inlineError}</p>}
                  <button className="checkout-step__btn" onClick={handlePay} disabled={isProcessing}>
                    {isProcessing ? 'Procesando…' : `Pagar ${formatPrice(total)}`}
                  </button>
                  <button type="button" className="checkout-step__back-btn" onClick={() => setStep('details')}>← Volver</button>
                </div>
              )}
            </div>
          </div>

          <div className="checkout-summary">
            <h3 className="checkout-summary__title">Resumen del pedido</h3>
            <ul className="checkout-summary__items">
              {cart.map((item: any, idx: number) => (
                <li className="checkout-summary__item" key={idx}>
                  <span className="checkout-summary__item-name">
                    {item.nombreProducto} <span className="checkout-summary__item-qty">×{item.cantidad}</span>
                  </span>
                  <span className="checkout-summary__item-price">
                    {formatPrice(item.precioUnitario * item.cantidad)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="checkout-summary__divider" />
            <div className="checkout-summary__row">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="checkout-summary__row">
              <span>Envío</span>
              <span>{shipping > 0 ? formatPrice(shipping) : 'Gratis'}</span>
            </div>
            <div className="checkout-summary__row checkout-summary__row--total">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

        </div>
      </div>
      <CartDrawer />
    </div>
  );
}
