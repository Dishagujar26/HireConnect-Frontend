import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmModalService } from '../../core/services/confirm-modal.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.css'
})
export class ConfirmModalComponent {
  constructor(public modalService: ConfirmModalService) {}
}