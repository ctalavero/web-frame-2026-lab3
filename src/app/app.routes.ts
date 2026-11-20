import { Routes } from '@angular/router';
import { Home } from './home';
import { ProductDetails } from './product-details';
import { ProductForm } from './product-form';
import { ProductsList } from './products-list';

export const routes: Routes = [
  { path: '', component: Home, title: 'Периферія · Головна' },
  { path: 'products', component: ProductsList, title: 'Каталог · Периферія' },
  { path: 'products/new', component: ProductForm, title: 'Новий товар · Периферія' },
  { path: 'products/:id/edit', component: ProductForm, title: 'Редагування · Периферія' },
  { path: 'products/:id', component: ProductDetails, title: 'Деталі товару · Периферія' },
  { path: '**', redirectTo: '' },
];
