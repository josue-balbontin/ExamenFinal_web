import type { AppState } from '../types/index.js';
import type { Store } from '../utils/store.js';
import type { Router } from '../utils/router.js';
import type { CheckoutState, PaymentMethod } from '../types/checkout.js';
import { NavbarComponent } from '../components/Navbar.js';
import { CartDrawerComponent } from '../components/CartDrawer.js';
import { showStatusModal } from '../components/StatusModal.js';
import { api } from '../utils/api.js';

export function createCheckoutPage(
  store: Store<AppState>,
  router: Router
): HTMLElement {
  if (!store.getState().auth.isAuthenticated) {
    router.navigate('/login');
    const div = document.createElement('div');
    div.textContent = 'Redirigiendo a inicio de sesión...';
    return div;
  }

  store.setState({ cartOpen: false });

  const state: CheckoutState = { step: 'method', method: null, card: null };

  const page = document.createElement('div');
  page.className = 'checkout-page';

  page.appendChild(new NavbarComponent(store, router).getElement());

  const content = document.createElement('div');
  content.className = 'checkout-page__content';

  const cart = store.getState().cart;
  if (cart.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'checkout-empty';
    emptyState.style.textAlign = 'center';
    emptyState.style.padding = '4rem 1rem';
    emptyState.innerHTML = `
      <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Tu carrito está vacío</h2>
      <p style="color: var(--color-text-muted); margin-bottom: 2rem;">Explora nuestro catálogo para encontrar lo que necesitas.</p>
      <button class="checkout-step__btn" style="max-width: 250px; margin: 0 auto;">Explorar el catálogo</button>
    `;
    emptyState
      .querySelector('button')!
      .addEventListener('click', () => router.navigate('/home'));
    content.appendChild(emptyState);
    page.appendChild(content);
    return page;
  }

  // Back button
  const backBtn = document.createElement('button');
  backBtn.className = 'checkout-page__back';
  backBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg> Volver al carrito`;
  backBtn.addEventListener('click', () => {
    store.setState({ cartOpen: true });
    router.navigate('/home');
  });
  content.appendChild(backBtn);

  // Layout: left panel + order summary
  const layout = document.createElement('div');
  layout.className = 'checkout-page__layout';

  // ── Left panel ──
  const panel = document.createElement('div');
  panel.className = 'checkout-page__panel';

  // Step container (reactive)
  const stepContainer = document.createElement('div');
  stepContainer.className = 'checkout-page__step-container';

  panel.appendChild(stepContainer); // Append step container FIRST

  let currentStepper: HTMLElement | null = null;

  function renderStep(): void {
    stepContainer.innerHTML = '';

    // Update stepper safely
    const newStepper = buildStepper(state.step);
    if (currentStepper && currentStepper.parentNode) {
      panel.replaceChild(newStepper, currentStepper);
    } else {
      panel.insertBefore(newStepper, stepContainer);
    }
    currentStepper = newStepper;

    if (state.step === 'method') {
      stepContainer.appendChild(buildMethodStep(state, renderStep));
    } else if (state.step === 'details') {
      stepContainer.appendChild(buildDetailsStep(state, renderStep));
    } else {
      stepContainer.appendChild(buildConfirmStep(state, store, router));
    }
  }

  renderStep();
  panel.appendChild(stepContainer);
  layout.appendChild(panel);

  // ── Order summary ──
  layout.appendChild(buildOrderSummary(store));

  content.appendChild(layout);
  page.appendChild(content);
  page.appendChild(new CartDrawerComponent(store, router).getElement());

  return page;
}

// ── Stepper ──
function buildStepper(current: CheckoutState['step']): HTMLElement {
  const steps: Array<{ key: CheckoutState['step']; label: string }> = [
    { key: 'method', label: 'Método' },
    { key: 'details', label: 'Datos' },
    { key: 'confirm', label: 'Confirmar' },
  ];
  const order = ['method', 'details', 'confirm'];
  const currentIdx = order.indexOf(current);

  const stepper = document.createElement('div');
  stepper.className = 'checkout-stepper';

  steps.forEach(({ key, label }, i) => {
    const isDone = i < currentIdx;
    const isActive = key === current;

    const item = document.createElement('div');
    item.className = `checkout-stepper__item${isActive ? ' checkout-stepper__item--active' : ''}${isDone ? ' checkout-stepper__item--done' : ''}`;

    const circle = document.createElement('div');
    circle.className = 'checkout-stepper__circle';
    circle.setAttribute('aria-hidden', 'true');
    circle.innerHTML = isDone
      ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>`
      : String(i + 1);

    const text = document.createElement('span');
    text.className = 'checkout-stepper__label';
    text.textContent = label;

    item.appendChild(circle);
    item.appendChild(text);
    stepper.appendChild(item);

    if (i < steps.length - 1) {
      const line = document.createElement('div');
      line.className = `checkout-stepper__line${isDone ? ' checkout-stepper__line--done' : ''}`;
      stepper.appendChild(line);
    }
  });

  return stepper;
}

// ── Step 1: Payment method ──
function buildMethodStep(state: CheckoutState, next: () => void): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'checkout-step';

  const title = document.createElement('h2');
  title.className = 'checkout-step__title';
  title.textContent = 'Método de pago';

  const subtitle = document.createElement('p');
  subtitle.className = 'checkout-step__subtitle';
  subtitle.textContent = 'Selecciona cómo quieres pagar tu pedido.';

  const options = document.createElement('div');
  options.className = 'checkout-method__options';

  const methods: Array<{
    key: PaymentMethod;
    label: string;
    desc: string;
    icon: string;
  }> = [
    {
      key: 'card',
      label: 'Tarjeta',
      desc: 'Débito o crédito',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
    },
    {
      key: 'qr',
      label: 'Código QR',
      desc: 'Paga escaneando',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/><line x1="20" y1="14" x2="20" y2="14"/><line x1="17" y1="20" x2="20" y2="20"/><line x1="20" y1="17" x2="20" y2="20"/></svg>`,
    },
  ];

  let selected: PaymentMethod | null = state.method;

  methods.forEach(({ key, label, desc, icon }) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `checkout-method__card${selected === key ? ' checkout-method__card--selected' : ''}`;
    card.setAttribute('aria-pressed', String(selected === key));
    card.innerHTML = `
      <div class="checkout-method__card-icon">${icon}</div>
      <div class="checkout-method__card-text">
        <span class="checkout-method__card-label">${label}</span>
        <span class="checkout-method__card-desc">${desc}</span>
      </div>
      <div class="checkout-method__card-check" aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
    `;
    card.addEventListener('click', () => {
      selected = key;
      options.querySelectorAll('.checkout-method__card').forEach((el) => {
        el.classList.remove('checkout-method__card--selected');
        el.setAttribute('aria-pressed', 'false');
      });
      card.classList.add('checkout-method__card--selected');
      card.setAttribute('aria-pressed', 'true');
    });
    options.appendChild(card);
  });

  const continueBtn = document.createElement('button');
  continueBtn.className = 'checkout-step__btn';
  continueBtn.textContent = 'Continuar';
  continueBtn.addEventListener('click', () => {
    if (!selected) {
      showFieldError(wrap, 'Selecciona un método de pago.');
      return;
    }
    clearFieldError(wrap);
    state.method = selected;
    state.step = 'details';
    next();
  });

  const errorEl = document.createElement('p');
  errorEl.className = 'checkout-step__inline-error';
  errorEl.setAttribute('role', 'alert');

  wrap.appendChild(title);
  wrap.appendChild(subtitle);
  wrap.appendChild(options);
  wrap.appendChild(errorEl);
  wrap.appendChild(continueBtn);
  return wrap;
}

// ── Step 2: Details ──
function buildDetailsStep(state: CheckoutState, next: () => void): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'checkout-step';

  if (state.method === 'qr') {
    return buildQRStep(wrap, state, next);
  }
  return buildCardStep(wrap, state, next);
}

function buildQRStep(
  wrap: HTMLElement,
  state: CheckoutState,
  next: () => void
): HTMLElement {
  const title = document.createElement('h2');
  title.className = 'checkout-step__title';
  title.textContent = 'Pago por QR';

  const subtitle = document.createElement('p');
  subtitle.className = 'checkout-step__subtitle';
  subtitle.textContent =
    'Escanea el código con tu app bancaria o billetera digital.';

  const qrBox = document.createElement('div');
  qrBox.className = 'checkout-qr__box';
  qrBox.setAttribute('aria-label', 'Código QR de pago');
  // SVG QR placeholder
  qrBox.innerHTML = `
    <svg class="checkout-qr__svg" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="10" y="10" width="30" height="30" rx="3" fill="none" stroke="currentColor" stroke-width="4"/>
      <rect x="17" y="17" width="16" height="16" rx="1" fill="currentColor"/>
      <rect x="80" y="10" width="30" height="30" rx="3" fill="none" stroke="currentColor" stroke-width="4"/>
      <rect x="87" y="17" width="16" height="16" rx="1" fill="currentColor"/>
      <rect x="10" y="80" width="30" height="30" rx="3" fill="none" stroke="currentColor" stroke-width="4"/>
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
  `;

  const hint = document.createElement('p');
  hint.className = 'checkout-qr__hint';
  hint.textContent = 'El código expira en 10 minutos.';

  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'checkout-step__btn';
  confirmBtn.textContent = 'Ya realicé el pago';
  confirmBtn.addEventListener('click', () => {
    state.step = 'confirm';
    next();
  });

  const backBtn = buildBackBtn(() => {
    state.step = 'method';
    next();
  });

  wrap.appendChild(title);
  wrap.appendChild(subtitle);
  wrap.appendChild(qrBox);
  wrap.appendChild(hint);
  wrap.appendChild(confirmBtn);
  wrap.appendChild(backBtn);
  return wrap;
}

function buildCardStep(
  wrap: HTMLElement,
  state: CheckoutState,
  next: () => void
): HTMLElement {
  const title = document.createElement('h2');
  title.className = 'checkout-step__title';
  title.textContent = 'Datos de tarjeta';

  const subtitle = document.createElement('p');
  subtitle.className = 'checkout-step__subtitle';
  subtitle.textContent = 'Tus datos no se almacenan en ningún servidor.';

  const securityBadge = document.createElement('div');
  securityBadge.className = 'checkout-card__security';
  securityBadge.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
    Conexión segura — datos no almacenados
  `;

  const form = document.createElement('div');
  form.className = 'checkout-card__form';

  const numberGroup = buildCardField({
    id: 'cc-number',
    label: 'Número de tarjeta',
    placeholder: '0000 0000 0000 0000',
    maxLength: 19,
    inputmode: 'numeric',
    formatter: formatCardNumber,
  });

  const holderGroup = buildCardField({
    id: 'cc-holder',
    label: 'Nombre en la tarjeta',
    placeholder: 'Como aparece en la tarjeta',
    autocomplete: 'cc-name',
  });

  const row = document.createElement('div');
  row.className = 'checkout-card__row';

  const monthGroup = buildCardField({
    id: 'cc-month',
    label: 'Mes',
    placeholder: 'MM',
    maxLength: 2,
    inputmode: 'numeric',
  });
  const yearGroup = buildCardField({
    id: 'cc-year',
    label: 'Año',
    placeholder: 'AA',
    maxLength: 2,
    inputmode: 'numeric',
  });
  const cvvGroup = buildCardField({
    id: 'cc-cvv',
    label: 'CVV',
    placeholder: '•••',
    maxLength: 4,
    inputmode: 'numeric',
    type: 'password',
  });

  row.appendChild(monthGroup);
  row.appendChild(yearGroup);
  row.appendChild(cvvGroup);

  form.appendChild(numberGroup);
  form.appendChild(holderGroup);
  form.appendChild(row);

  const inlineError = document.createElement('p');
  inlineError.className = 'checkout-step__inline-error';
  inlineError.setAttribute('role', 'alert');

  const continueBtn = document.createElement('button');
  continueBtn.className = 'checkout-step__btn';
  continueBtn.textContent = 'Continuar';
  continueBtn.addEventListener('click', () => {
    const number = form
      .querySelector<HTMLInputElement>('#cc-number')!
      .value.replace(/\s/g, '');
    const holder = form
      .querySelector<HTMLInputElement>('#cc-holder')!
      .value.trim();
    const month = form
      .querySelector<HTMLInputElement>('#cc-month')!
      .value.trim();
    const year = form.querySelector<HTMLInputElement>('#cc-year')!.value.trim();
    const cvv = form.querySelector<HTMLInputElement>('#cc-cvv')!.value.trim();

    const errors = validateCard({ number, holder, month, year, cvv });
    if (errors.length > 0) {
      inlineError.textContent = errors[0];
      return;
    }
    inlineError.textContent = '';

    state.card = {
      cardNumber: maskCard(number),
      cardHolder: holder,
      expiryMonth: month,
      expiryYear: year,
      cvv: '',
    };
    state.step = 'confirm';
    next();
  });

  const backBtn = buildBackBtn(() => {
    state.step = 'method';
    next();
  });

  wrap.appendChild(title);
  wrap.appendChild(subtitle);
  wrap.appendChild(securityBadge);
  wrap.appendChild(form);
  wrap.appendChild(inlineError);
  wrap.appendChild(continueBtn);
  wrap.appendChild(backBtn);
  return wrap;
}

// ── Step 3: Confirm ──
function buildConfirmStep(
  state: CheckoutState,
  store: Store<AppState>,
  router: Router
): HTMLElement {
  const confirmWrap = document.createElement('div');
  confirmWrap.className = 'checkout-step';

  const cart = store.getState().cart;
  const subtotal = cart.reduce((s, i) => s + i.precioUnitario * i.cantidad, 0);
  const shipping = subtotal > 0 ? 5.99 : 0;
  const total = subtotal + shipping;

  const title = document.createElement('h2');
  title.className = 'checkout-step__title';
  title.textContent = 'Confirmar pedido';

  const subtitle = document.createElement('p');
  subtitle.className = 'checkout-step__subtitle';
  subtitle.textContent = 'Revisa los detalles antes de confirmar.';

  const summaryBox = document.createElement('div');
  summaryBox.className = 'checkout-confirm__box';

  const methodRow = buildConfirmRow(
    'Método de pago',
    state.method === 'card' ? 'Tarjeta' : 'Código QR'
  );
  summaryBox.appendChild(methodRow);

  if (state.method === 'card' && state.card) {
    summaryBox.appendChild(buildConfirmRow('Tarjeta', state.card.cardNumber));
    summaryBox.appendChild(buildConfirmRow('Titular', state.card.cardHolder));
    summaryBox.appendChild(
      buildConfirmRow(
        'Vence',
        `${state.card.expiryMonth}/${state.card.expiryYear}`
      )
    );
  }

  summaryBox.appendChild(
    buildConfirmRow(
      'Productos',
      String(cart.reduce((s, i) => s + i.cantidad, 0))
    )
  );
  summaryBox.appendChild(
    buildConfirmRow('Total', `$${total.toFixed(2)}`, true)
  );

  const termsNote = document.createElement('p');
  termsNote.className = 'checkout-confirm__terms';
  termsNote.textContent =
    'Al confirmar aceptas los términos de uso. Los datos de pago no son almacenados.';

  const inlineError = document.createElement('p');
  inlineError.className = 'checkout-step__inline-error';
  inlineError.setAttribute('role', 'alert');

  const payBtn = document.createElement('button');
  payBtn.className = 'checkout-step__btn';
  payBtn.textContent = `Pagar $${total.toFixed(2)}`;
  payBtn.addEventListener('click', async () => {
    payBtn.disabled = true;
    payBtn.textContent = 'Procesando…';
    inlineError.textContent = '';

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const body: any = {
        direccionEnvio: 'Dirección de envío proporcionada', // Usualmente se pediría en un paso extra
        metodoPago: state.method === 'card' ? 'tarjeta' : 'qr',
        items: cart.map((i) => ({
          idProducto: i.idProducto,
          cantidad: i.cantidad,
        })),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await api.POST(
        '/PedidoControlador' as any,
        { body } as any
      );

      if (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        throw new Error((error as any)?.mensaje || 'Error al procesar el pago');
      }

      // Clear cart and ephemeral card data
      store.setState({ cart: [] });
      state.card = null;

      showStatusModal({
        type: 'success',
        title: '¡Pago exitoso!',
        message:
          'Tu pedido fue confirmado. Recibirás un correo de confirmación.',
        onClose: () => router.navigate('/home'),
      });
    } catch (err: unknown) {
      inlineError.textContent =
        (err as Error).message || 'Ocurrió un error al procesar el pago.';
      payBtn.disabled = false;
      payBtn.textContent = `Pagar $${total.toFixed(2)}`;
    }
  });

  confirmWrap.appendChild(title);
  confirmWrap.appendChild(subtitle);
  confirmWrap.appendChild(summaryBox);
  confirmWrap.appendChild(termsNote);
  confirmWrap.appendChild(inlineError);
  confirmWrap.appendChild(payBtn);
  return confirmWrap;
}

// ── Order summary sidebar ──
function buildOrderSummary(store: Store<AppState>): HTMLElement {
  const cart = store.getState().cart;
  const subtotal = cart.reduce((s, i) => s + i.precioUnitario * i.cantidad, 0);
  const shipping = subtotal > 0 ? 5.99 : 0;
  const total = subtotal + shipping;

  const box = document.createElement('div');
  box.className = 'checkout-summary';

  const title = document.createElement('h3');
  title.className = 'checkout-summary__title';
  title.textContent = 'Resumen del pedido';

  const itemsList = document.createElement('ul');
  itemsList.className = 'checkout-summary__items';

  cart.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'checkout-summary__item';
    li.innerHTML = `
      <span class="checkout-summary__item-name">${item.nombreProducto} <span class="checkout-summary__item-qty">×${item.cantidad}</span></span>
      <span class="checkout-summary__item-price">$${(item.precioUnitario * item.cantidad).toFixed(2)}</span>
    `;
    itemsList.appendChild(li);
  });

  const divider = document.createElement('div');
  divider.className = 'checkout-summary__divider';

  const subtotalRow = buildSummaryRow('Subtotal', `$${subtotal.toFixed(2)}`);
  const shippingRow = buildSummaryRow(
    'Envío',
    shipping > 0 ? `$${shipping.toFixed(2)}` : 'Gratis'
  );
  const totalRow = buildSummaryRow('Total', `$${total.toFixed(2)}`, true);

  box.appendChild(title);
  box.appendChild(itemsList);
  box.appendChild(divider);
  box.appendChild(subtotalRow);
  box.appendChild(shippingRow);
  box.appendChild(totalRow);

  return box;
}

// ── Small helpers ──

function buildCardField(opts: {
  id: string;
  label: string;
  placeholder: string;
  maxLength?: number;
  inputmode?: string;
  type?: string;
  autocomplete?: string;
  formatter?: (v: string) => string;
}): HTMLElement {
  const group = document.createElement('div');
  group.className = 'checkout-card__field';

  const label = document.createElement('label');
  label.className = 'checkout-card__label';
  label.htmlFor = opts.id;
  label.textContent = opts.label;

  const input = document.createElement('input');
  input.className = 'checkout-card__input';
  input.id = opts.id;
  input.placeholder = opts.placeholder;
  input.type = opts.type ?? 'text';
  input.setAttribute('autocomplete', opts.autocomplete ?? 'off');
  if (opts.maxLength) input.maxLength = opts.maxLength;
  if (opts.inputmode) input.setAttribute('inputmode', opts.inputmode);

  if (opts.formatter) {
    input.addEventListener('input', () => {
      const pos = input.selectionStart ?? 0;
      input.value = opts.formatter!(input.value);
      input.setSelectionRange(pos, pos);
    });
  }

  group.appendChild(label);
  group.appendChild(input);
  return group;
}

function buildBackBtn(onClick: () => void): HTMLElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'checkout-step__back-btn';
  btn.textContent = '← Volver';
  btn.addEventListener('click', onClick);
  return btn;
}

function buildConfirmRow(
  label: string,
  value: string,
  bold = false
): HTMLElement {
  const row = document.createElement('div');
  row.className = `checkout-confirm__row${bold ? ' checkout-confirm__row--total' : ''}`;
  row.innerHTML = `<span>${label}</span><span>${value}</span>`;
  return row;
}

function buildSummaryRow(
  label: string,
  value: string,
  bold = false
): HTMLElement {
  const row = document.createElement('div');
  row.className = `checkout-summary__row${bold ? ' checkout-summary__row--total' : ''}`;
  row.innerHTML = `<span>${label}</span><span>${value}</span>`;
  return row;
}

function showFieldError(container: HTMLElement, msg: string): void {
  const el = container.querySelector<HTMLElement>(
    '.checkout-step__inline-error'
  );
  if (el) el.textContent = msg;
}

function clearFieldError(container: HTMLElement): void {
  const el = container.querySelector<HTMLElement>(
    '.checkout-step__inline-error'
  );
  if (el) el.textContent = '';
}

function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function maskCard(number: string): string {
  const clean = number.replace(/\D/g, '');
  return `•••• •••• •••• ${clean.slice(-4)}`;
}

function validateCard(d: {
  number: string;
  holder: string;
  month: string;
  year: string;
  cvv: string;
}): string[] {
  const errors: string[] = [];
  if (d.number.length < 13) errors.push('Número de tarjeta inválido.');
  if (!d.holder) errors.push('Ingresa el nombre del titular.');
  const m = Number(d.month);
  if (!d.month || m < 1 || m > 12) errors.push('Mes de vencimiento inválido.');
  if (!d.year || d.year.length < 2) errors.push('Año de vencimiento inválido.');
  if (!d.cvv || d.cvv.length < 3) errors.push('CVV inválido.');
  return errors;
}
