import type { AppState } from '../types/index.js';
import type { Store } from '../utils/store.js';
import type { Router } from '../utils/router.js';
import { NavbarComponent } from '../components/Navbar.js';
import { StarRatingComponent } from '../components/StarRating.js';
import { CartDrawerComponent } from '../components/CartDrawer.js';
import { showStatusModal } from '../components/StatusModal.js';
import { addToCart } from '../utils/cartServices.js';
import {
  fetchProductDetail,
  getRatingDistribution,
  submitReview,
} from '../utils/product-detail.js';

export async function createProductDetailPage(
  store: Store<AppState>,
  router: Router,
  productId: string
): Promise<HTMLElement> {
  if (!store.getState().auth.isAuthenticated) {
    router.navigate('/login');
    return document.createElement('div');
  }

  const detail = await fetchProductDetail(productId);
  const dist = detail.distribution || getRatingDistribution(detail.reviews);
  const maxDist = Math.max(...Object.values(dist), 1);
  const currentUser = store.getState().auth.user;
  const userHasReviewed = detail.reviews.some(
    (r) => r.userId && r.userId === currentUser?.id
  );

  const page = document.createElement('div');
  page.className = 'detail-page';

  const navbar = new NavbarComponent(store, router);
  page.appendChild(navbar.getElement());

  const content = document.createElement('div');
  content.className = 'detail-page__content';

  const backBtn = document.createElement('button');
  backBtn.className = 'detail-page__back';
  backBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg> Volver`;
  backBtn.addEventListener('click', () => router.navigate('/home'));
  content.appendChild(backBtn);

  const topSection = document.createElement('div');
  topSection.className = 'detail-page__top';

  const imgWrapper = document.createElement('div');
  imgWrapper.className = 'detail-page__img-wrapper';
  if (detail.imageUrl) {
    const img = document.createElement('img');
    img.src = detail.imageUrl;
    img.alt = detail.name;
    img.className = 'detail-page__img';
    img.loading = 'lazy';
    imgWrapper.appendChild(img);
  } else {
    imgWrapper.innerHTML = `
      <svg class="detail-page__img-placeholder" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 220" aria-label="Sin imagen">
        <rect width="300" height="220" fill="#c8c8c8"/>
        <rect x="50" y="30" width="200" height="130" rx="20" fill="#b0b0b0"/>
        <circle cx="110" cy="80" r="25" fill="#c8c8c8"/>
        <path d="M50 160 L110 100 L160 135 L200 105 L250 160Z" fill="#b8b8b8"/>
      </svg>
    `;
  }

  const infoPanel = document.createElement('div');
  infoPanel.className = 'detail-page__info';

  const category = document.createElement('p');
  category.className = 'detail-page__category';
  category.textContent = detail.category;

  const name = document.createElement('h1');
  name.className = 'detail-page__name';
  name.textContent = detail.name;

  const seller = document.createElement('p');
  seller.className = 'detail-page__seller';
  seller.textContent = `De ${detail.seller}`;

  const ratingRow = document.createElement('div');
  ratingRow.className = 'detail-page__rating-row';
  const starsDisplay = new StarRatingComponent({
    value: detail.rating,
    size: 'sm',
  });
  const ratingText = document.createElement('span');
  ratingText.className = 'detail-page__rating-text';
  ratingText.textContent = `${detail.rating} · ${detail.reviewCount.toLocaleString()} reviews`;
  ratingRow.appendChild(starsDisplay.getElement());
  ratingRow.appendChild(ratingText);

  const priceRow = document.createElement('div');
  priceRow.className = 'detail-page__price-row';
  const priceEl = document.createElement('span');
  priceEl.className = 'detail-page__price';
  priceEl.textContent = `$${detail.price.toFixed(2)}`;
  priceRow.appendChild(priceEl);
  if (detail.originalPrice) {
    const origEl = document.createElement('span');
    origEl.className = 'detail-page__original-price';
    origEl.textContent = `$${detail.originalPrice.toFixed(2)}`;
    priceRow.appendChild(origEl);
  }

  const stock = document.createElement('p');
  stock.className = 'detail-page__stock';
  stock.textContent = `${detail.stock} in stock`;

  const desc = document.createElement('p');
  desc.className = 'detail-page__description';
  desc.textContent = detail.description;

  const addBtn = document.createElement('button');
  addBtn.className = 'detail-page__add-btn';
  addBtn.innerHTML = `<span aria-hidden="true">+</span> AÑADIR AL CARRITO`;
  addBtn.addEventListener('click', () => {
    addToCart(store, parseInt(detail.id, 10), 1);
  });

  infoPanel.appendChild(category);
  infoPanel.appendChild(name);
  infoPanel.appendChild(seller);
  infoPanel.appendChild(ratingRow);
  infoPanel.appendChild(priceRow);
  infoPanel.appendChild(stock);
  infoPanel.appendChild(desc);
  infoPanel.appendChild(addBtn);

  topSection.appendChild(imgWrapper);
  topSection.appendChild(infoPanel);
  content.appendChild(topSection);

  const bottomSection = document.createElement('div');
  bottomSection.className = 'detail-page__bottom';

  const reviewsPanel = document.createElement('div');
  reviewsPanel.className = 'detail-page__reviews-panel';

  const reviewsTitle = document.createElement('h2');
  reviewsTitle.className = 'detail-page__reviews-title';
  reviewsTitle.textContent = `REVIEWS (${detail.reviewCount.toLocaleString()})`;
  reviewsPanel.appendChild(reviewsTitle);

  const summaryCard = document.createElement('div');
  summaryCard.className = 'detail-page__summary-card';

  const avgWrapper = document.createElement('div');
  avgWrapper.className = 'detail-page__avg-wrapper';
  const avgNumber = document.createElement('span');
  avgNumber.className = 'detail-page__avg-number';
  avgNumber.textContent = detail.rating.toFixed(1);
  const avgStars = new StarRatingComponent({
    value: Math.round(detail.rating),
    size: 'sm',
  });
  const avgTotal = document.createElement('span');
  avgTotal.className = 'detail-page__avg-total';
  avgTotal.textContent = `${detail.reviewCount.toLocaleString()} total`;
  avgWrapper.appendChild(avgNumber);
  avgWrapper.appendChild(avgStars.getElement());
  avgWrapper.appendChild(avgTotal);

  const barsWrapper = document.createElement('div');
  barsWrapper.className = 'detail-page__bars';
  for (let i = 5; i >= 1; i--) {
    const count = dist[i] ?? 0;
    const row = document.createElement('div');
    row.className = 'detail-page__bar-row';
    const label = document.createElement('span');
    label.className = 'detail-page__bar-label';
    label.textContent = String(i);
    const track = document.createElement('div');
    track.className = 'detail-page__bar-track';
    const fill = document.createElement('div');
    fill.className = 'detail-page__bar-fill';
    fill.style.width = `${(count / maxDist) * 100}%`;
    track.appendChild(fill);
    const countEl = document.createElement('span');
    countEl.className = 'detail-page__bar-count';
    countEl.textContent = String(count);
    row.appendChild(label);
    row.appendChild(track);
    row.appendChild(countEl);
    barsWrapper.appendChild(row);
  }

  summaryCard.appendChild(avgWrapper);
  summaryCard.appendChild(barsWrapper);
  reviewsPanel.appendChild(summaryCard);

  detail.reviews.forEach((review) => {
    const reviewEl = document.createElement('div');
    reviewEl.className = 'detail-page__review';
    const avatar = document.createElement('div');
    avatar.className = 'detail-page__review-avatar';
    avatar.textContent = review.userName[0].toUpperCase();
    avatar.setAttribute('aria-hidden', 'true');
    const reviewBody = document.createElement('div');
    reviewBody.className = 'detail-page__review-body';
    const reviewHeader = document.createElement('div');
    reviewHeader.className = 'detail-page__review-header';
    const reviewUser = document.createElement('span');
    reviewUser.className = 'detail-page__review-user';
    reviewUser.textContent = review.userName;
    const reviewStars = new StarRatingComponent({
      value: review.rating,
      size: 'sm',
    });
    const reviewDate = document.createElement('span');
    reviewDate.className = 'detail-page__review-date';
    reviewDate.textContent = review.date;
    reviewHeader.appendChild(reviewUser);
    reviewHeader.appendChild(reviewStars.getElement());
    reviewHeader.appendChild(reviewDate);
    const reviewText = document.createElement('p');
    reviewText.className = 'detail-page__review-text';
    reviewText.textContent = review.text;
    reviewBody.appendChild(reviewHeader);
    reviewBody.appendChild(reviewText);
    reviewEl.appendChild(avatar);
    reviewEl.appendChild(reviewBody);
    reviewsPanel.appendChild(reviewEl);
  });

  bottomSection.appendChild(reviewsPanel);

  if (!userHasReviewed) {
    const writePanel = document.createElement('div');
    writePanel.className = 'detail-page__write-panel';

    const writeTitle = document.createElement('h3');
    writeTitle.className = 'detail-page__write-title';
    writeTitle.textContent = 'ESCRIBE UNA REVIEW DEL PRODUCTO';

    const ratingLabel = document.createElement('p');
    ratingLabel.className = 'detail-page__write-label';
    ratingLabel.textContent = 'RATING';

    let selectedRating = 0;
    const ratingWrapper = document.createElement('div');
    ratingWrapper.className = 'detail-page__write-rating';
    const interactiveStars = new StarRatingComponent({
      value: 0,
      interactive: true,
      size: 'md',
      onChange: (r) => {
        selectedRating = r;
        interactiveStars.update(r);
        ratingHint.textContent = '';
      },
    });
    const ratingHint = document.createElement('span');
    ratingHint.className = 'detail-page__write-rating-hint';
    ratingHint.textContent = 'Calificanos';
    ratingWrapper.appendChild(interactiveStars.getElement());
    ratingWrapper.appendChild(ratingHint);

    const reviewLabel = document.createElement('p');
    reviewLabel.className = 'detail-page__write-label';
    reviewLabel.textContent = 'TU REVIEW';

    const textarea = document.createElement('textarea');
    textarea.className = 'detail-page__write-textarea';
    textarea.placeholder = 'Escribe tu experiencia con este producto';
    textarea.setAttribute('aria-label', 'Escribe tu review');
    textarea.rows = 5;
    const charCount = document.createElement('span');
    charCount.className = 'detail-page__write-charcount';
    charCount.textContent = '0 chars';
    textarea.addEventListener('input', () => {
      charCount.textContent = `${textarea.value.length} chars`;
    });

    const submitBtn = document.createElement('button');
    submitBtn.className = 'detail-page__write-submit';
    submitBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> SUBMIT REVIEW`;
    submitBtn.addEventListener('click', async () => {
      if (!selectedRating) {
        ratingHint.textContent = 'Elige una calificación';
        return;
      }
      if (!textarea.value.trim()) {
        return;
      }

      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Enviando...';
      submitBtn.disabled = true;

      try {
        const { avgRating, reviewCount, reviews, distribution } =
          await submitReview(productId, selectedRating, textarea.value.trim());

        // Actualizar los datos del detail
        detail.rating = avgRating;
        detail.reviewCount = reviewCount;
        detail.reviews = reviews;
        detail.distribution = distribution;

        showStatusModal({
          type: 'success',
          title: 'Reseña creada exitosamente',
          message: 'Tu reseña ha sido publicada y ya es visible para todos.',
          autoCloseMs: 3000,
        });

        // Actualizar la sección de ratings en el top
        ratingText.textContent = `${detail.rating.toFixed(1)} · ${detail.reviewCount.toLocaleString()} reviews`;
        starsDisplay.update(Math.round(detail.rating));

        // Actualizar la tarjeta resumen de reviews
        avgNumber.textContent = detail.rating.toFixed(1);
        avgStars.update(Math.round(detail.rating));
        avgTotal.textContent = `${detail.reviewCount.toLocaleString()} total`;

        // Actualizar las barras de distribución
        const newMaxDist = Math.max(...Object.values(distribution), 1);
        barsWrapper.innerHTML = '';
        for (let i = 5; i >= 1; i--) {
          const count = distribution[i] ?? 0;
          const row = document.createElement('div');
          row.className = 'detail-page__bar-row';
          const label = document.createElement('span');
          label.className = 'detail-page__bar-label';
          label.textContent = String(i);
          const track = document.createElement('div');
          track.className = 'detail-page__bar-track';
          const fill = document.createElement('div');
          fill.className = 'detail-page__bar-fill';
          fill.style.width = `${(count / newMaxDist) * 100}%`;
          track.appendChild(fill);
          const countEl = document.createElement('span');
          countEl.className = 'detail-page__bar-count';
          countEl.textContent = String(count);
          row.appendChild(label);
          row.appendChild(track);
          row.appendChild(countEl);
          barsWrapper.appendChild(row);
        }

        // Actualizar título de reviews
        reviewsTitle.textContent = `REVIEWS (${detail.reviewCount.toLocaleString()})`;

        // Agregar la nueva reseña al inicio de la lista
        const newReviewEl = document.createElement('div');
        newReviewEl.className = 'detail-page__review';
        const newAvatar = document.createElement('div');
        newAvatar.className = 'detail-page__review-avatar';
        newAvatar.textContent = currentUser?.name?.[0].toUpperCase() || 'U';
        newAvatar.setAttribute('aria-hidden', 'true');
        const newReviewBody = document.createElement('div');
        newReviewBody.className = 'detail-page__review-body';
        const newReviewHeader = document.createElement('div');
        newReviewHeader.className = 'detail-page__review-header';
        const newReviewUser = document.createElement('span');
        newReviewUser.className = 'detail-page__review-user';
        newReviewUser.textContent = currentUser?.name || 'Tú';
        const newReviewStars = new StarRatingComponent({
          value: selectedRating,
          size: 'sm',
        });
        const today = new Date().toLocaleDateString();
        const newReviewDate = document.createElement('span');
        newReviewDate.className = 'detail-page__review-date';
        newReviewDate.textContent = today;
        newReviewHeader.appendChild(newReviewUser);
        newReviewHeader.appendChild(newReviewStars.getElement());
        newReviewHeader.appendChild(newReviewDate);
        const newReviewText = document.createElement('p');
        newReviewText.className = 'detail-page__review-text';
        newReviewText.textContent = textarea.value.trim();
        newReviewBody.appendChild(newReviewHeader);
        newReviewBody.appendChild(newReviewText);
        newReviewEl.appendChild(newAvatar);
        newReviewEl.appendChild(newReviewBody);

        // Insertar la nueva reseña después del summary card
        reviewsPanel.appendChild(newReviewEl);

        // Ocultar el formulario de escritura
        writePanel.style.display = 'none';
      } catch (err: unknown) {
        alert((err as Error).message || 'Error al enviar la reseña');
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });

    writePanel.appendChild(writeTitle);
    writePanel.appendChild(ratingLabel);
    writePanel.appendChild(ratingWrapper);
    writePanel.appendChild(reviewLabel);
    writePanel.appendChild(textarea);
    writePanel.appendChild(charCount);
    writePanel.appendChild(submitBtn);

    bottomSection.appendChild(writePanel);
  }

  content.appendChild(bottomSection);
  page.appendChild(content);

  const cartDrawer = new CartDrawerComponent(store, router);
  page.appendChild(cartDrawer.getElement());

  return page;
}
