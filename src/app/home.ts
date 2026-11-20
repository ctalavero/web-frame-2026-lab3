import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="home">
      <h1>Комп’ютерні<br class="home-break" /> аксесуари</h1>
      <p>Підберіть клавіатуру, мишу чи USB-хаб. У каталозі є ціни й залишки, а картку товару можна оновити за потреби.</p>
      <a class="button primary" routerLink="/products">Відкрити каталог <span aria-hidden="true">→</span></a>
    </section>
  `,
})
export class Home {}
