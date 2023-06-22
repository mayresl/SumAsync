import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Operation } from 'src/shared/models/operation.model';

import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export interface Config {
  heroesUrl: string;
  textfile: string;
  date: any;
}

@Injectable()
export class SumService {
  constructor(private http: HttpClient) {}
  operations: Operation[] = [];

  sum(obj: Object) {
    this.http.post('/api/CalcAsync', obj).subscribe(response => {
      console.log('response is: ', response);
    })
  }

  getResults () {
    return this.http.get('/api/GetResult');
  }
}