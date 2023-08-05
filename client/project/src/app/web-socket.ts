import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import { ChatMessage } from './models';
import { ChatRoomComponent } from './component/chat-room/chat-room.component';

export class WebSocketApi {
  webSocketEndPoint: string = 'http://localhost:8080/ws';
  topic: string = '/topic/public';
  stompClient: any;
  chatRoomComponent: ChatRoomComponent;

  constructor(chatRoomComponent: ChatRoomComponent) {
    this.chatRoomComponent = chatRoomComponent;
  }

  _connect() {
    console.log('Intialize Web-socket connection...');
    let ws = new SockJS(this.webSocketEndPoint);
    this.stompClient = Stomp.over(ws);
    const _this = this;
    _this.stompClient.connect(
      {},
      function (frame: any) {
        _this.stompClient.subscribe(_this.topic, function (sdkEvent: any) {
          _this.onMessageReceived(sdkEvent);
        });
      },
      this.errorCallBack
    );
    // _this.stompClient.reconnect_delay = 2000;
  }

  _disconnect() {
    if (this.stompClient !== null) {
      this.stompClient.disconnect();
    }
    console.log('Web socket disconnected...');
  }

  // on error, schedule a reconnection attempt
  errorCallBack(error: any) {
    console.log('errorCallBack -> ', error);
    setTimeout(() => {
      this._connect;
    }, 5000);
  }

  // Send message to server via web-socket
  _send(message: ChatMessage) {
    console.log('calling logout api via web socket');
    this.stompClient.send('/chat.sendMessage', {}, message);
  }

  onMessageReceived(message: any) {
    console.log('Message received from server :: ', message);
    this.chatRoomComponent.handleMessage(JSON.stringify(message.body));
  }
}
