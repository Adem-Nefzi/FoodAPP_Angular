import { Component } from '@angular/core';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { HeroComponent } from '../components/hero/hero.component';
import { FeaturesComponent } from '../components/features/features.component';
import { FooterComponent } from '../components/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavbarComponent, HeroComponent, FeaturesComponent, FooterComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent {}
