import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, of } from 'rxjs';
import { Product } from './product';
import { ProductsList } from './products-list';
import { ProductsService } from './products.service';

describe('ProductsList', () => {
  const products: Product[] = Array.from({ length: 8 }, (_, index) => ({
    id: index + 1,
    name: 'Товар ' + (index + 1),
    category: index < 2 ? 'Миші' : 'Клавіатури',
    price: 1000,
    stock: 3,
  }));
  let fixture: ComponentFixture<ProductsList>;
  let list: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    list = vi.fn(() => of(products));
    TestBed.configureTestingModule({
      imports: [ProductsList],
      providers: [provideRouter([]), { provide: ProductsService, useValue: { list } }],
    });
    fixture = TestBed.createComponent(ProductsList);
  });

  const page = () => fixture.nativeElement as HTMLElement;
  const names = () => Array.from(page().querySelectorAll('.product-link'), (link) => link.textContent?.trim());

  it('paginates the list and resets to page one after filtering', () => {
    fixture.detectChanges();
    expect(names()).toEqual(products.slice(0, 6).map((product) => product.name));

    page().querySelector<HTMLButtonElement>('.pagination button:last-child')!.click();
    fixture.detectChanges();
    expect(names()).toEqual(['Товар 7', 'Товар 8']);

    const filter = page().querySelector<HTMLSelectElement>('#filter-category')!;
    filter.value = 'Миші';
    filter.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(names()).toEqual(['Товар 1', 'Товар 2']);
    expect(page().querySelector('.pagination')).toBeNull();
  });

  it('moves focus to the results when either pagination button becomes disabled', () => {
    fixture.detectChanges();
    const results = page().querySelector('.catalog-items');
    const previous = page().querySelector<HTMLButtonElement>('.pagination button:first-child')!;
    const next = page().querySelector<HTMLButtonElement>('.pagination button:last-child')!;

    next.focus();
    next.click();
    fixture.detectChanges();
    expect(next.disabled).toBe(true);
    expect(document.activeElement).toBe(results);

    previous.focus();
    previous.click();
    fixture.detectChanges();
    expect(previous.disabled).toBe(true);
    expect(document.activeElement).toBe(results);
  });

  it('renders loading and an empty result', () => {
    const response = new Subject<Product[]>();
    list.mockReturnValueOnce(response);
    fixture.detectChanges();
    expect(page().querySelector('[role="status"]')?.textContent).toContain('Завантажуємо');

    response.next([]);
    response.complete();
    fixture.detectChanges();
    expect(page().querySelector('[role="status"]')?.textContent).toContain('Каталог поки порожній');
  });
});
