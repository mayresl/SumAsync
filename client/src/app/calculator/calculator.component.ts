import { Component } from '@angular/core';

import {HttpClient} from '@angular/common/http';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-calculator',
  templateUrl: './calculator.component.html',
  styleUrls: ['./calculator.component.css']
})
export class CalculatorComponent {
  constructor(private http: HttpClient) {}
  subscription: Subscription;
  operations = [
    {
      id: 1,
      status: "ready",
      number1: 8,
      number2: 3,
      result: 11
    },
    {
      id: 2,
      status: "pending",
      number1: 1,
      number2: 1,
      result: null
    },
    {
      id: 3,
      status: "pending",
      number1: 851,
      number2: 9865,
      result: null
    }
  ];

  ngOnInit() {
    const source = interval(3000);
    this.subscription = source.subscribe(val => this.getResults());
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  sum() {
    window.alert('Hello World!');
  }

  getResults () {
    console.log("Getting results...");
    this.http.get('/api/GetResult').subscribe(response => {
      console.log('response is: ', response);
    })
  }
}
