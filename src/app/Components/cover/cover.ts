import { Component } from '@angular/core';
import { Header } from "../../shared/header/header";
import { Brands } from '../brands/brands';

@Component({
  selector: 'app-cover',
  imports: [Header,Brands],
  templateUrl: './cover.html',
  styleUrl: './cover.css',
})
export class Cover {

}
