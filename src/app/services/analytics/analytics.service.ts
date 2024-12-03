import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from '../../../environments/environment';
import { paths } from '../../../environments/paths';
import { TotalMessagesInsight } from '../../models/analytics/analytics';
import ApexCharts from 'apexcharts'

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  constructor() { }

  getTotalMessagesInsight(){
    const url = `${environment.apiUrl}${paths.totalMessagesInsight}`
    return axios.get<TotalMessagesInsight[]>(url);
  }
}
