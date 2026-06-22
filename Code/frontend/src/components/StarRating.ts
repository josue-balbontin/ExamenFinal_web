export interface StarRatingProps {
  value: number;
  interactive?: boolean;
  size?: 'sm' | 'md';
  onChange?: (rating: number) => void;
}

export class StarRatingComponent {
  private props: StarRatingProps;
  private root: HTMLElement;
  private hovered = 0;

  constructor(props: StarRatingProps) {
    this.props = props;
    this.root = this.render();
  }

  private render(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = `star-rating star-rating--${this.props.size ?? 'md'}${this.props.interactive ? ' star-rating--interactive' : ''}`;
    wrapper.setAttribute(
      'aria-label',
      `Calificación: ${this.props.value} de 5`
    );
    if (this.props.interactive) wrapper.setAttribute('role', 'group');

    for (let i = 1; i <= 5; i++) {
      const star = document.createElement(
        this.props.interactive ? 'button' : 'span'
      );
      star.className = `star-rating__star${i <= this.props.value ? ' star-rating__star--filled' : ''}`;
      star.textContent = '★';
      star.setAttribute(
        'aria-hidden',
        this.props.interactive ? 'false' : 'true'
      );

      if (this.props.interactive && star instanceof HTMLButtonElement) {
        star.type = 'button';
        star.setAttribute('aria-label', `${i} estrella${i > 1 ? 's' : ''}`);
        star.addEventListener('mouseenter', () => this.highlight(i));
        star.addEventListener('mouseleave', () =>
          this.highlight(this.props.value)
        );
        star.addEventListener('click', () => {
          this.props.onChange?.(i);
        });
      }
      wrapper.appendChild(star);
    }
    return wrapper;
  }

  private highlight(upTo: number): void {
    this.hovered = upTo;
    this.root.querySelectorAll('.star-rating__star').forEach((s, idx) => {
      s.classList.toggle('star-rating__star--filled', idx < upTo);
    });
  }

  update(value: number): void {
    this.props = { ...this.props, value };
    this.highlight(value);
  }

  getElement(): HTMLElement {
    return this.root;
  }
}
