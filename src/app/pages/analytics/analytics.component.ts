import { Component, ViewChild } from '@angular/core';
import { AnalyticsService } from '../../services/analytics/analytics.service';
import { TotalMessagesInsight } from '../../models/analytics/analytics';
import { DatePipe } from '@angular/common';
import { LoadingService } from '../../services/loading/loading.service';
import { AuthService } from '../../services/auth/auth.service';
import { DrawerControlService } from '../../services/drawer/drawer-control.service';
import { MatIconModule } from '@angular/material/icon';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { ionAnalytics, ionMenu } from '@ng-icons/ionicons';
import ApexCharts from 'apexcharts'
import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexTitleSubtitle,
  ApexXAxis,
  ApexFill,
  NgApexchartsModule
} from "ng-apexcharts";
import { NavbarComponent } from "../../components/navbar/navbar.component";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart | any;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  title: ApexTitleSubtitle;
};

export type TotalMessagesData = {
  date: string[];
  value: number[];
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [
    NgApexchartsModule,
    MatIconModule,
    NgIconComponent,
    NavbarComponent
],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css',
  providers: [DatePipe],
  viewProviders: [provideIcons({ ionMenu, ionAnalytics})]
})
export class AnalyticsComponent {
  @ViewChild("chart") chart?: ChartComponent;
  public chartOptions: Partial<ChartOptions> = {};
  totalMessagesList: TotalMessagesInsight[] = [];
  totalMessagesData: TotalMessagesData = {
    date: [],
    value: []
  };

  constructor(
    public analyticsService: AnalyticsService, 
    private datePipe: DatePipe,
    public loadingService: LoadingService,
    public authService: AuthService,
    public drawerControlService: DrawerControlService
  ) {}

  ngOnInit(): void {
    this.loadingService.show();
    this.fetchTotalMessages();
  }

  fetchTotalMessages(){
    this.analyticsService.getTotalMessagesInsight().then(response => {
      this.totalMessagesList = response.data;
      this.transformTotalMessagesChart();
      this.initChartOptions();
      setTimeout(() => {this.loadingService.hide()}, 500)
    })
  }

  transformTotalMessagesChart(){
    this.totalMessagesData.date = this.totalMessagesList.map(item => 
      this.formatDate(new Date(item.year, item.month -1, item.day))
    );
    this.totalMessagesData.value = this.totalMessagesList.map(item => item.totalMessages);
  }

  formatDate(date: Date){
    return this.datePipe.transform(date, 'dd/MM')?.toString() || '';
  }

  initChartOptions() {
    this.chartOptions = {
      series: [
        {
          name: "Mensagens",
          data: this.totalMessagesData.value
        }
      ],
      chart: {
        height: 200,
        type: "bar"
      },
      plotOptions: {
        bar: {
          dataLabels: {
            position: "top" // top, center, bottom
          }
        }
      },
      dataLabels: {
        enabled: true,
        offsetY: -20,
        style: {
          fontSize: "11px",
          colors: ["#304758"]
        }
      },

      xaxis: {
        categories: this.totalMessagesData.date,
        offsetY: 0,
        position: "bottom",
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        crosshairs: {
          fill: {
            type: "gradient",
            gradient: {
              colorFrom: "#D8E3F0",
              colorTo: "#BED1E6",
              stops: [0, 100],
              opacityFrom: 0.4,
              opacityTo: 0.5
            }
          }
        },
        tooltip: {
          enabled: true,
          offsetY: -35
        }
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "light",
          type: "horizontal",
          shadeIntensity: 0.25,
          gradientToColors: undefined,
          inverseColors: true,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [50, 0, 100, 100]
        }
      },
      yaxis: {
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        labels: {
          show: false
        }
      },
      title: {
        text: "Total de mensagens enviadas para Maya",
        floating: true,
        offsetY: 0,
        align: "center",
        style: {
          fontSize: "12px",
          fontFamily: "Poppins, sans-serif",
          color: "#444"
        },

      }
    }
  }
  logout(){
    this.authService.logout();
    sessionStorage.removeItem('lastConversationId');
  }
}
