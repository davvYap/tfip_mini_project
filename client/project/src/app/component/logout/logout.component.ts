import { Component, OnInit, AfterViewInit } from '@angular/core';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css'],
})
export class LogoutComponent implements OnInit, AfterViewInit {
  constructor(private messageService: MessageService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.showMessage();
  }

  showMessage() {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Logout Successfully',
    });
  }
}
