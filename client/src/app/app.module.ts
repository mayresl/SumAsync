import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { SumComponent } from './sum/sum.component';

import { HttpClientModule } from '@angular/common/http'; 

@NgModule({
  declarations: [
    SumComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [SumComponent]
})
export class AppModule { }
