import { Component } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { Operation } from 'src/shared/models/operation.model';

import { SumService } from './sum.service';

@Component({
  selector: 'app-calculator',
  templateUrl: './sum.component.html',
  providers: [ SumService ],
  styleUrls: ['./sum.component.css'],
})
export class SumComponent {
  constructor(private sumService: SumService) {}

  subscription: Subscription | undefined;
  operations: Operation[] = [];
  formInvalid = false;

  ngOnInit() {
    const source = interval(3000);
    this.subscription = source.subscribe(val => this.getResults());
  }

  ngOnDestroy() {
    if (this.subscription !== undefined) {
      this.subscription.unsubscribe();
    }
  }

  sum(n1: string, n2: string) {
    if (n1 == "" || n2 == "") {
      this.formInvalid = true;
    }
    else {
      this.formInvalid = false;
      var obj = {
        number1: n1,
        number2: n2
      }
      this.sumService.sum(obj);
    }    
  }

  getResults() {
    this.sumService.getResults().subscribe(response => {
      this.operations = response as Operation[];
    });
  }
}
