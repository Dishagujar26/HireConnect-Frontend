import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmModalComponent } from './shared/confirm-modal/confirm-modal';
import { ToastModalComponent } from './shared/toast-modal/toast-modal';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ConfirmModalComponent, ToastModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}