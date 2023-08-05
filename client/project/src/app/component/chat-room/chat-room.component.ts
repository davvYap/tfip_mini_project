import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ChatMessage } from 'src/app/models';
import { GetService } from 'src/app/service/get.service';
import { WebSocketApi } from 'src/app/web-socket';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css'],
})
export class ChatRoomComponent implements OnInit {
  title = 'web-socket-chatroom';

  webSocketApi!: WebSocketApi;
  message!: ChatMessage;
  content!: string;
  sender!: string;
  senderId!: string;

  constructor() {}

  ngOnInit(): void {
    this.webSocketApi = new WebSocketApi(new ChatRoomComponent());
  }

  connect() {
    this.webSocketApi._connect();
  }

  disconnect() {
    this.webSocketApi._disconnect();
  }

  sendMessage() {
    // this.message = {
    //   sender: localStorage.getItem('username'),
    // };
    console.log('Sent message : ', this.message);
    this.webSocketApi._send(this.message);
  }

  handleMessage(message: any) {
    this.message = message;
  }
}
