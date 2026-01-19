import { Component } from '@angular/core';
import { Header } from "../../shared/header/header";
import { Brands } from '../brands/brands';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cover',
  imports: [Header,Brands,RouterModule],
  templateUrl: './cover.html',
  styleUrl: './cover.css',
})
export class Cover {
}
