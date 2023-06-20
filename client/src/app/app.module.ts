import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { CalculatorComponent } from './calculator/calculator.component';

import { HttpClientModule } from '@angular/common/http'; 

@NgModule({
  declarations: [
    CalculatorComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [CalculatorComponent]
})
export class AppModule { }
