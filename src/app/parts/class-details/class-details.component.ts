import { Component } from '@angular/core';
import { TableModule, Table } from 'primeng/table';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { DatePipe } from '@angular/common';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-class-details',
  standalone: true,
  imports: [
    TableModule,
    DatePipe,
    InputNumberModule,
    FormsModule
  ],
  templateUrl: './class-details.component.html',
  styleUrl: './class-details.component.scss'
})
export class ClassDetails {
  constructor(public config: DynamicDialogConfig) {}

  mainTask: any;

  goal: number = 0;

  classCurrentAverage(){
    var total = 0;
    var underlying = 0;
    for(var i = 0; i < this.config.data.tasks.length; i++){
      if(this.config.data.tasks[i].earned !== null){
        total += this.config.data.tasks[i].earned * this.config.data.tasks[i].weight;
        underlying += this.config.data.tasks[i].weight;
      }
    }

    if(underlying === 0) return "No Data";
    return (total / underlying).toLocaleString('en-US') + '%';
  }

  selectTask(event: any){
    for(var i = 0; i < this.config.data.tasks.length; i++){
      if(!this.config.data.tasks[i].estimate)
      this.config.data.tasks[i].estimate = 100;
    }
  }

  get estimate(){
    const tasks = this.config.data.tasks;
    let totalWeight = 0;
    let weightedSum = 0;

    // Calculate the weighted sum of earned/estimate grades and total weight
    for (const task of tasks) {
      if(task !== this.mainTask){
        if (task.earned) {
          weightedSum += task.earned * task.weight;
          totalWeight += task.weight;
        } else if (task.estimate) {
          weightedSum += task.estimate * task.weight;
          totalWeight += task.weight;
        }
      } else {
        totalWeight += task.weight;
      }
    }

    // Calculate the total weight excluding mainTask
    const totalWeightExcludingMainTask = totalWeight - this.mainTask.weight;

    // Calculate the required weighted sum to achieve the goal
    const requiredWeightedSum = this.goal * totalWeight;

    // Solve for the mainTask estimate
    const requiredMainTaskWeightedSum = requiredWeightedSum - weightedSum;
    const requiredMainTaskEstimate = requiredMainTaskWeightedSum / this.mainTask.weight;

    // If the result is negative or not a number (NaN), return null as it's not feasible
    if (isNaN(requiredMainTaskEstimate) || requiredMainTaskEstimate < 0) {
      return "Not Feasible";
    }

    return requiredMainTaskEstimate.toLocaleString('en-US') + '%';
  }

  unselectTask(event: any){
  }
}
