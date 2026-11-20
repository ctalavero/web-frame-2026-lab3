import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { categories } from './product';
import { ProductsService } from './products.service';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-form.html',
})
export class ProductForm {
  private readonly service = inject(ProductsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly routeId = this.route.snapshot.paramMap.get('id');

  protected readonly id = this.routeId === null ? null : Number(this.routeId);
  protected readonly backLink = this.id === null ? ['/products'] : ['/products', this.id];
  protected readonly categories = categories;
  protected readonly loading = signal(this.id !== null);
  protected readonly loadError = signal('');
  protected readonly saving = signal(false);
  protected readonly saveError = signal('');
  protected readonly form = this.fb.group({
    name: this.fb.nonNullable.control('', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(80)]),
    category: this.fb.nonNullable.control('', Validators.required),
    price: this.fb.control<number | null>(null, [Validators.required, Validators.min(1),
      Validators.pattern(/^\d+(\.\d{1,2})?$/)]),
    stock: this.fb.control<number | null>(null, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]),
  });
  protected readonly controls = this.form.controls;

  ngOnInit() {
    if (this.id === null) return;
    if (!Number.isSafeInteger(this.id) || this.id < 1) {
      this.loadError.set('Товар не знайдено.');
      this.loading.set(false);
      return;
    }

    this.service.get(this.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ name, category, price, stock }) => {
        this.form.setValue({ name, category, price, stock });
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.loadError.set(error.message);
        this.loading.set(false);
      },
    });
  }

  protected save() {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving()) return;
    const { name, category, price, stock } = this.form.getRawValue();
    if (price === null || stock === null) return;

    this.saving.set(true);
    this.saveError.set('');
    const data = { name: name.trim(), category, price, stock };
    const request = this.id === null ? this.service.create(data) : this.service.update(this.id, data);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (product) => void this.router.navigate(['/products', product.id]),
      error: (error: Error) => {
        this.saveError.set(error.message);
        this.saving.set(false);
      },
    });
  }
}
