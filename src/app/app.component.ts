import { Component, OnInit, Renderer2, OnDestroy, HostListener } from '@angular/core';
import { DatePipe, CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import {
  FormControl,
  FormGroup,
  FormsModule,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule, Table } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { ColorPickerModule } from 'primeng/colorpicker';
import { TooltipModule } from 'primeng/tooltip';
import { MultiSelectModule } from 'primeng/multiselect';
import { RippleModule } from 'primeng/ripple';
import { DividerModule } from 'primeng/divider';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { SplitterModule } from 'primeng/splitter';
import { DragScrollComponent, DragScrollItemDirective } from 'ngx-drag-scroll';
import { ChangeDetectorRef } from '@angular/core';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ClassDetails } from './parts/class-details/class-details.component';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ApiService } from './parts/api/api.service';
import { HttpClientModule } from '@angular/common/http';

function disableAllControls(formGroup: FormGroup): void {
  Object.keys(formGroup.controls).forEach((key) => {
    formGroup.get(key)?.disable();
  });
}

function enableAllControls(formGroup: FormGroup): void {
  Object.keys(formGroup.controls).forEach((key) => {
    formGroup.get(key)?.enable();
  });
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    FormsModule,
    InputTextModule,
    DatePipe,
    CheckboxModule,
    DropdownModule,
    TagModule,
    CommonModule,
    DialogModule,
    ColorPickerModule,
    TooltipModule,
    MultiSelectModule,
    RippleModule,
    ReactiveFormsModule,
    DividerModule,
    CalendarModule,
    InputNumberModule,
    SplitterModule,
    DragScrollComponent,
    DragScrollItemDirective,
    ClassDetails,
    ConfirmDialogModule,
    HttpClientModule,
  ],

  providers: [DialogService, ConfirmationService, ApiService],

  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'TermManager';
  tasks: any[] = [];
  classes: any[] = [];

  addingClass: boolean = false;
  classColor: string = '#ffb999';
  className: string = '';
  addClassTip = 'Add Class';

  update(className: string) {
    this.cdr.detectChanges();
    console.log(this.classCurrentAverage(className));
  }

  getTasks(className: string) {
    console.log(this.tasks.filter((t) => t.class === className));
    return this.tasks.filter((t) => t.class === className);
  }

  constructor(
    public dialogService: DialogService,
    private cdr: ChangeDetectorRef,
    public confirmationService: ConfirmationService,
    public apiService: ApiService,
    private renderer: Renderer2
  ) {}

  ref: DynamicDialogRef | undefined;

  classDetails(className: string) {
    this.ref = this.dialogService.open(ClassDetails, {
      data: {
        tasks: this.getTasks(className),
      },
      header: className,
    });
  }

  classCurrentAverage(className: string) {
    var total = 0;
    var underlying = 0;
    for (var i = 0; i < this.tasks.length; i++) {
      if (this.tasks[i].class == className && this.tasks[i].earned !== null) {
        total += this.tasks[i].earned * this.tasks[i].weight;
        underlying += this.tasks[i].weight;
      }
    }

    if (underlying === 0) return className + ': No Data';

    return (
      className + ': ' + (total / underlying).toLocaleString('en-US') + '%'
    );
  }

  addClass() {
    if (this.className === '') return;
    if (!this.uniqueClassName()) return;

    const newClasses = [...this.classes, { label: this.className, value: this.className, color: this.classColor}];
    this.classes = newClasses;

    this.classColor = '#ffb999';
    this.className = '';
    this.addingClass = false;
    this.addClassTip = 'Add Class';
  }

  uniqueClassName() {
    if (!this.className) {
      this.addClassTip = 'Class Name Cannot Be Empty';
      return false;
    }

    if (this.classes.every((c) => c.value !== this.className)) {
      this.addClassTip = 'Add Class';
      return true;
    } else {
      this.addClassTip = 'Class Already Exists';
      return false;
    }
  }

  clear(table: Table) {
    table.clear();
  }

  getClassColor(className: string): string {
    const selectedClass = this.classes.find((c) => c.value === className);
    return selectedClass ? selectedClass.color : 'transparent';
  }

  addingAssignment: boolean = false;

  reoccurEveryOptions = [
    { label: 'Day(s)', value: 1 },
    { label: 'Week(s)', value: 7 },
    { label: 'Month(s)', value: 30 },
    { label: 'Year(s)', value: 365 },
  ];

  assignmentForm: FormGroup = new FormGroup({
    selectedClass: new FormControl('', [Validators.required]),
    activity: new FormControl('', [Validators.required]),
    releaseDate: new FormControl<Date | null>(new Date()), // Default value is today
    dueDate: new FormControl<Date | null>(new Date()),
    weight: new FormControl(null, [Validators.required]),
    notes: new FormControl(''),
    reoccurEvery: new FormControl(null),
    reoccurEveryValue: new FormControl(null),
    reoccurUntil: new FormControl<Date | null>(new Date()),
  });

  initialValues: any;
  tasksToBeAdded: any[] = [];

  refactorTasks() {
    this.tasksToBeAdded = [];
    if (
      this.assignmentForm.value.reoccurEveryValue &&
      this.assignmentForm.value.reoccurEvery
    ) {
      var curDateR = new Date(this.assignmentForm.value.releaseDate);
      var curDateD = new Date(this.assignmentForm.value.dueDate);
      while (curDateD <= this.assignmentForm.value.reoccurUntil) {
        this.tasksToBeAdded.push({
          class: this.assignmentForm.value.selectedClass,
          activity: this.assignmentForm.value.activity,
          releaseDate: new Date(curDateR),
          dueDate: new Date(curDateD),
          weight: this.assignmentForm.value.weight,
          earned: null,
          completed: false,
          notes: this.assignmentForm.value.notes,
        });
        curDateR.setDate(
          curDateR.getDate() +
            this.assignmentForm.value.reoccurEveryValue *
              this.assignmentForm.value.reoccurEvery
        );
        curDateD.setDate(
          curDateD.getDate() +
            this.assignmentForm.value.reoccurEveryValue *
              this.assignmentForm.value.reoccurEvery
        );
      }
    } else {
      this.tasksToBeAdded.push({
        class: this.assignmentForm.value.selectedClass,
        activity: this.assignmentForm.value.activity,
        releaseDate: this.assignmentForm.value.releaseDate,
        dueDate: this.assignmentForm.value.dueDate,
        weight: this.assignmentForm.value.weight,
        earned: null,
        completed: false,
        notes: this.assignmentForm.value.notes,
      });
    }
  }

  isStepOne: boolean = true;

  ngOnInit(): void {
    this.initialValues = this.assignmentForm.value;

    // Consider checking the new type of visibility, e.g. 'hidden'
    document.addEventListener('visibilitychange', () => {
      navigator.sendBeacon('http://localhost:3000/update', JSON.stringify({
        user: this.loginForm.value.username,
        tasks: this.tasks,
        classes: this.classes,
      }));
    });
  }

  ngOnDestroy(): void {
  }
  nextStep() {
    disableAllControls(this.assignmentForm);
    this.refactorTasks();
    this.isStepOne = false;
  }

  goBack() {
    enableAllControls(this.assignmentForm);
    this.tasksToBeAdded = [];
    this.isStepOne = true;
  }

  clearReleaseDate() {
    this.assignmentForm.controls['releaseDate'].setValue(null);
  }

  clearDueDate() {
    this.assignmentForm.controls['dueDate'].setValue(null);
  }

  Merge() {
    console.log(this.tasksToBeAdded);
    this.tasksToBeAdded.forEach((task) => {
      // Push task with unique id
      task.id = Math.random();
      this.tasks.push(task);
    });
    this.tasksToBeAdded = [];

    enableAllControls(this.assignmentForm);
    this.assignmentForm.reset(this.initialValues);

    this.isStepOne = true;

    this.addingAssignment = false;
  }

  removal: boolean = false;

  toBeRemoved: any = [];

  confirmRemoval(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete these record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',

      accept: () => {
        this.removal = false;
        this.toBeRemoved.forEach((task: any) => {
          this.tasks = this.tasks.filter((t) => t.id !== task.id);
        });
        this.toBeRemoved = [];
      },
      reject: () => {
        this.removal = false;
      },
    });
  }

  loggingIn: boolean = true;
  loginErrorMessage: string = '';

  waitingLogIn: boolean = false;

  loginForm: FormGroup = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  login() {
    if(!this.waitingLogIn){
      this.waitingLogIn = true;
      this.apiService
        .postLogin({
          user: this.loginForm.value.username,
          pass: this.loginForm.value.password,
        })
        .subscribe(
          (response) => {
            console.log(response);
            this.loggingIn = false;
            //this.loginForm.reset(); // optional
  
            this.tasks = response.tasks;
            this.classes = response.classes;
            this.waitingLogIn = false;
          },
          (error) => {
            console.log(error);
            //this.loginForm.reset();
            this.loginErrorMessage = error.error.error;
            this.waitingLogIn = false;
          }
        );
    }
  }

  waitingCreateAcc: boolean = false;

  createAcc(){
    if(!this.waitingCreateAcc){
      this.waitingCreateAcc = true;
      this.apiService
        .postCreateAcc({
          user: this.loginForm.value.username,
          pass: this.loginForm.value.password,
        })
        .subscribe(
          (response) => {
            console.log(response);
            this.loggingIn = false;
            //this.loginForm.reset(); // optional
            if(response.tasks.length !== 0)
            this.tasks = response.tasks;

            if(response.classes.length !== 0)
            this.classes = response.classes;

            this.waitingCreateAcc = false;
          },
          (error) => {
            console.log(error);
            //this.loginForm.reset();
            this.loginErrorMessage = error.error.error;
            this.waitingCreateAcc = false;
          } 
        );
    }
  }

  updateBackend(): void {
    this.apiService.postUpdate({
      user: this.loginForm.value.username,
      tasks: this.tasks,
      classes: this.classes,
    });
  }
}
