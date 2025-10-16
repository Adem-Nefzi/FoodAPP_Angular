import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { authInterceptor } from '../app/core/interceptors/auth.interceptor';
registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    // Existing providers
    provideAnimations(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideNzI18n(en_US),
    // ✅ Added for routing support
    provideRouter(routes),
  ],
};
