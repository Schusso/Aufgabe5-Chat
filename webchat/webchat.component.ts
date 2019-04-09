import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import * as WebSocket from 'ws';

@Component({
  selector: 'app-webchat',
  templateUrl: './webchat.component.html',
  styleUrls: ['./webchat.component.scss']
})
export class WebchatComponent implements OnInit {


  constructor(private http: HttpClient) {
    const clientSocket = new WebSocket('ws://sd-fanboy.herokuapp.com');
    clientSocket.onopen = function (event) {
      clientSocket.send('Höre zu!');
    };
  }
  ngOnInit() {
  }

}
