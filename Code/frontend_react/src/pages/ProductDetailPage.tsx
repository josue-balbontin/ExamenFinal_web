import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore, globalStore } from '../storeInstance';
import { formatPrice } from '../utils/currency';
import { Navbar } from '../components/Navbar';
import { StarRating } from '../components/StarRating';
import { CartDrawer } from '../components/CartDrawer';
import { showStatusModal } from '../components/StatusModal';
import { addToCart } from '../utils/cartServices';
import {
  fetchProductDetail,
  getRatingDistribution,
  submitReview,
} from '../utils/product-detail';

export function ProductDetailPage() {
  const navigate = useNavigate();
  const { productId } = useParams<{ productId: string }>();
  const state = useStore();
  const [detail, setDetail] = useState<any>(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ratingHint, setRatingHint] = useState('Calificanos');

  useEffect(() => {
    if (!state.auth.isAuthenticated) {
      navigate('/login');
      return;
    }
    if (productId) {
      fetchProductDetail(productId).then(setDetail).catch(console.error);
    }
  }, [navigate, state.auth.isAuthenticated, productId]);

  if (!state.auth.isAuthenticated) return <div />;
  if (!detail) return <div className="detail-page">Cargando...</div>;

  const currentUser = state.auth.user;
  const userHasReviewed = detail.reviews?.some(
    (r: any) => r.userId && r.userId === currentUser?.id
  );
  
  const dist = detail.distribution || getRatingDistribution(detail.reviews || []);
  const maxDist = Math.max(...(Object.values(dist) as number[]), 1);

  const handleAddToCart = () => {
    addToCart(globalStore, parseInt(detail.id, 10), 1);
  };

  const handleSubmitReview = async () => {
    if (!selectedRating) {
      setRatingHint('Elige una calificación');
      return;
    }
    if (!reviewText.trim()) return;

    setIsSubmitting(true);
    try {
      const { avgRating, reviewCount, reviews, distribution } = await submitReview(
        productId!,
        selectedRating,
        reviewText.trim()
      );

      setDetail((prev: any) => ({
        ...prev,
        rating: avgRating,
        reviewCount,
        reviews,
        distribution,
      }));

      showStatusModal({
        type: 'success',
        title: 'Reseña creada exitosamente',
        message: 'Tu reseña ha sido publicada y ya es visible para todos.',
        autoCloseMs: 3000,
      });

    } catch (err: any) {
      alert(err.message || 'Error al enviar la reseña');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="detail-page">
      <Navbar />
      <div className="detail-page__content">
        <button className="detail-page__back" onClick={() => navigate('/home')}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6"/>
          </svg> Volver
        </button>

        <div className="detail-page__top">
          <div className="detail-page__img-wrapper">
            {detail.imageUrl ? (
              <img src={detail.imageUrl} alt={detail.name} className="detail-page__img" loading="lazy" />
            ) : (
              <svg className="detail-page__img-placeholder" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 220" aria-label="Sin imagen">
                <rect width="300" height="220" fill="#c8c8c8"/>
                <rect x="50" y="30" width="200" height="130" rx="20" fill="#b0b0b0"/>
                <circle cx="110" cy="80" r="25" fill="#c8c8c8"/>
                <path d="M50 160 L110 100 L160 135 L200 105 L250 160Z" fill="#b8b8b8"/>
              </svg>
            )}
          </div>
          <div className="detail-page__info">
            <p className="detail-page__category">{detail.category}</p>
            <h1 className="detail-page__name">{detail.name}</h1>
            <p className="detail-page__seller">De {detail.seller}</p>
            
            <div className="detail-page__rating-row">
              <StarRating value={detail.rating} size="sm" />
              <span className="detail-page__rating-text">
                {detail.rating.toFixed(1)} · {detail.reviewCount.toLocaleString()} reviews
              </span>
            </div>

            <div className="detail-page__price-row">
              <span className="detail-page__price">{formatPrice(detail.price)}</span>
              {detail.originalPrice && detail.originalPrice !== detail.price && (
                <span className="detail-page__original-price">{formatPrice(detail.originalPrice)}</span>
              )}
            </div>

            <p className="detail-page__stock">{detail.stock} in stock</p>
            <p className="detail-page__description">{detail.description}</p>
            
            <button className="detail-page__add-btn" onClick={handleAddToCart}>
              <span aria-hidden="true">+</span> AÑADIR AL CARRITO
            </button>
          </div>
        </div>

        <div className="detail-page__bottom">
          <div className="detail-page__reviews-panel">
            <h2 className="detail-page__reviews-title">
              REVIEWS ({detail.reviewCount.toLocaleString()})
            </h2>

            <div className="detail-page__summary-card">
              <div className="detail-page__avg-wrapper">
                <span className="detail-page__avg-number">{detail.rating.toFixed(1)}</span>
                <StarRating value={Math.round(detail.rating)} size="sm" />
                <span className="detail-page__avg-total">
                  {detail.reviewCount.toLocaleString()} total
                </span>
              </div>
              <div className="detail-page__bars">
                {[5, 4, 3, 2, 1].map((i) => {
                  const count = dist[i as keyof typeof dist] ?? 0;
                  return (
                    <div className="detail-page__bar-row" key={i}>
                      <span className="detail-page__bar-label">{i}</span>
                      <div className="detail-page__bar-track">
                        <div className="detail-page__bar-fill" style={{ width: `${(count / maxDist) * 100}%` }} />
                      </div>
                      <span className="detail-page__bar-count">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {detail.reviews?.map((review: any, idx: number) => (
              <div className="detail-page__review" key={idx}>
                <div className="detail-page__review-avatar" aria-hidden="true">
                  {review.userName[0].toUpperCase()}
                </div>
                <div className="detail-page__review-body">
                  <div className="detail-page__review-header">
                    <span className="detail-page__review-user">{review.userName}</span>
                    <StarRating value={review.rating} size="sm" />
                    <span className="detail-page__review-date">{review.date}</span>
                  </div>
                  <p className="detail-page__review-text">{review.text}</p>
                </div>
              </div>
            ))}
          </div>

          {!userHasReviewed && (
            <div className="detail-page__write-panel">
              <h3 className="detail-page__write-title">ESCRIBE UNA REVIEW DEL PRODUCTO</h3>
              
              <p className="detail-page__write-label">RATING</p>
              <div className="detail-page__write-rating">
                <StarRating
                  value={selectedRating}
                  interactive={true}
                  size="md"
                  onChange={(r: number) => {
                    setSelectedRating(r);
                    setRatingHint('');
                  }}
                />
                <span className="detail-page__write-rating-hint">{ratingHint}</span>
              </div>

              <p className="detail-page__write-label">TU REVIEW</p>
              <textarea
                className="detail-page__write-textarea"
                placeholder="Escribe tu experiencia con este producto"
                aria-label="Escribe tu review"
                rows={5}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
              <span className="detail-page__write-charcount">
                {reviewText.length} chars
              </span>

              <button
                className="detail-page__write-submit"
                onClick={handleSubmitReview}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  'Enviando...'
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg> SUBMIT REVIEW
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
      <CartDrawer />
    </div>
  );
}
