import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { httpErrorInterceptor } from './http-error.interceptor';
import { ProductDraft } from './product';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  const url = '/api/products';
  const draft: ProductDraft = { name: 'Keyboard', category: 'Клавіатури', price: 1200, stock: 4 };
  const product = { id: 7, ...draft };
  let service: ProductsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([httpErrorInterceptor])), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads all products via GET', () => {
    service.list().subscribe((result) => expect(result).toEqual([product]));
    http.expectOne({ method: 'GET', url }).flush([product]);
  });

  it('loads one product by ID', () => {
    service.get(7).subscribe((result) => expect(result).toEqual(product));
    http.expectOne({ method: 'GET', url: url + '/7' }).flush(product);
  });

  it('posts a new product', () => {
    service.create(draft).subscribe((result) => expect(result.id).toBe(7));
    const request = http.expectOne({ method: 'POST', url });
    expect(request.request.body).toEqual(draft);
    request.flush(product);
  });

  it('updates the targeted product', () => {
    const update = { ...draft, stock: 0 };
    service.update(7, update).subscribe((result) => expect(result.stock).toBe(0));
    const request = http.expectOne({ method: 'PUT', url: url + '/7' });
    expect(request.request.body).toEqual(update);
    request.flush({ id: 7, ...update });
  });

  it('deletes the targeted product', () => {
    const callback = vi.fn();
    service.delete(7).subscribe(callback);
    http.expectOne({ method: 'DELETE', url: url + '/7' }).flush(null);
    expect(callback).toHaveBeenCalledOnce();
  });

  it('shows a localized error when a product is missing', () => {
    const callback = vi.fn();
    service.get(7).subscribe({ error: callback });
    http.expectOne(url + '/7').flush({}, { status: 404, statusText: 'Not Found' });
    expect(callback).toHaveBeenCalledWith(new Error('Товар не знайдено.'));
  });
});
