import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EMPTY, catchError, switchMap } from 'rxjs';
import { Product } from './product';
import { ProductsService } from './products.service';

@Component({
  standalone: true,
  imports: [DecimalPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-details.html',
})
export class ProductDetails {
  private readonly service = inject(ProductsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly product = signal<Product | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly deleting = signal(false);
  protected readonly deleteError = signal('');

  ngOnInit() {
    this.route.paramMap.pipe(
      switchMap((params) => {
        const id = Number(params.get('id'));
        this.product.set(null);
        this.deleteError.set('');
        this.loading.set(true);
        this.error.set('');

        if (!Number.isSafeInteger(id) || id < 1) {
          this.loading.set(false);
          this.error.set('Товар не знайдено.');
          return EMPTY;
        }

        return this.service.get(id).pipe(
          catchError((error: Error) => {
            this.loading.set(false);
            this.error.set(error.message);
            return EMPTY;
          }),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((product) => {
      this.product.set(product);
      this.loading.set(false);
    });
  }

  protected deleteProduct(product: Product) {
    if (this.deleting()) return;

    this.deleting.set(true);
    this.deleteError.set('');
    this.service.delete(product.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => void this.router.navigate(['/products']),
      error: (error: Error) => {
        this.deleteError.set(error.message);
        this.deleting.set(false);
      },
    });
  }

  protected beforeCancel(event: Event) {
    if (this.deleting()) event.preventDefault();
  }
}
