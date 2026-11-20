import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Product, categories } from './product';
import { ProductsService } from './products.service';

@Component({
  standalone: true,
  imports: [DecimalPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './products-list.html',
})
export class ProductsList {
  private readonly service = inject(ProductsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly products = signal<Product[]>([]);
  private readonly pageSize = 6;

  protected readonly categories = categories;
  protected readonly category = signal('');
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly page = signal(1);
  protected readonly filtered = computed(() => {
    const category = this.category();
    return category ? this.products().filter((product) => product.category === category) : this.products();
  });
  protected readonly pages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));
  protected readonly offset = computed(() => (this.page() - 1) * this.pageSize);
  protected readonly visible = computed(() => this.filtered().slice(this.offset(), this.offset() + this.pageSize));

  ngOnInit() {
    this.load();
  }

  protected load() {
    this.loading.set(true);
    this.error.set('');
    this.service.list().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (products) => {
        this.products.set(products);
        this.page.set(1);
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.error.set(error.message);
        this.loading.set(false);
      },
    });
  }

  protected filterByCategory(category: string) {
    this.category.set(category);
    this.page.set(1);
  }

  protected goToPage(page: number, results: HTMLUListElement) {
    const nextPage = Math.min(this.pages(), Math.max(1, page));
    if (nextPage === this.page()) return;

    this.page.set(nextPage);
    results.focus();
  }
}
