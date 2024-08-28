import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatProgressBarModule} from '@angular/material/progress-bar'
import { MatButtonModule } from '@angular/material/button'
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CookieService } from 'ngx-cookie-service';

@NgModule({ declarations: [
        AppComponent
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        BrowserAnimationsModule,
        MatCardModule,
        MatProgressSpinnerModule,
        MatProgressBarModule,
        MatButtonModule], providers: [CookieService, provideHttpClient(withInterceptorsFromDi())] })
export class AppModule { }
