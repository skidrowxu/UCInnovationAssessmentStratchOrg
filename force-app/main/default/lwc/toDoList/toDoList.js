import { LightningElement,wire, track  } from 'lwc';
import fetchData from '@salesforce/apex/TaskController.fetchData';
import { createRecord, updateRecord  } from 'lightning/uiRecordApi';
import TASK_CUSTOM_OBJECT from '@salesforce/schema/Task_Custom__c';
import NAME_FIELD from '@salesforce/schema/Task_Custom__c.Name';
import DESCRIPTION_FIELD from '@salesforce/schema/Task_Custom__c.Description__c';
import UPDATED_NAME_FIELD from '@salesforce/schema/Task_Custom__c.Name';
import UPDATED_DESCRIPTION_FIELD from '@salesforce/schema/Task_Custom__c.Description__c';
import UPDATED_ID_FIELD from '@salesforce/schema/Task_Custom__c.Id';
import UPDATED_COMPLETED_FIELD from '@salesforce/schema/Task_Custom__c.Completed__c';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ToDoList extends LightningElement {

    taskCustomId;
    @track tasks =[];
    @track tasksMap = {};
    @track newTask;
    @track completedTaskIds = [];
    @track incompletedTaskIds = [];
    // @track initialTasks;
    isLoading;
    error;
    name = '';
    description = '';
    updatedName;
    updatedDescription;
    updatedId;
    @track wiredResult = [];

    get completeStatus(){
        return task.Completed__c? 'completed' : 'incompleted';
    }

    onNameChange(event){
        this.name = event.target.value;
    }
    onDescChange(event){
        this.description = event.target.value;
    }
    //how to retrive parent div attributes
    onNameUpdate(event) {
        debugger;
        this.updatedName = event.target.value;
        //this.updatedId = event.target.getAttribute("data-record-id");
        this.updatedId = event.target.dataset.recordId;
    }
    onDescUpdate(event) {
        this.updatedDescription = event.target.value;
        //this.updatedId = event.target.getAttribute("data-record-id");
        this.updatedId = event.target.dataset.recordId;
    }

    @wire(fetchData)
    //I don't know why I cannot access initialTasks
    wiredTaskss(result) {
        this.wiredResult = result;
        if (result.data && !this.tasks.length) {
            this.tasks = result.data.map( task => {
                if (task.Completed__c == true) {
                    var newTask = {
                        ...task,
                        ...{completeStatus: "completed"}       
                    };
                    // task.completeStatus = "completed";
                } else{
                    var newTask = {
                        ...task,
                        ...{completeStatus: "incompleted"}       
                    };
                    // task.completeStatus = "incompleted";
                }
                return newTask;
            });
            this.tasksMap = this.tasks.reduce(function(map, task) {
                map[task.Id] = task;
                return map;
            }, {});
            // this.completedTaskIds = this.tasks.filter(e => e.Completed__c == true).map(e => e.Id);
            // this.incompletedTaskIds = this.tasks.filter(e => e.Completed__c == false).map(e => e.Id);
        }
        if (result.error) {
          this.error = result.error;
          this.tasks = undefined;
        }
        this.isLoading = false;
      
        // this.notifyLoading(this.isLoading);
      }

    // connectedCallback() {
    //     debugger;
    //     this.tasks=this.initialTasks;
    // }


    
    createTaskCustom() {
        // var inputs = this.template.querySelectorAll(".reset");
        // // why forEach has to use this----------+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
        // inputs.forEach(function(element){
        //     if(element.label=="New Task")
        //         this.name=element.value;

        //     else if(element.label=="Task Description")
        //         this.description=element.value;
        // },this);
        const recordInput = {
            apiName: TASK_CUSTOM_OBJECT.objectApiName,
            fields: { 
                [NAME_FIELD.fieldApiName]: this.name, 
                [DESCRIPTION_FIELD.fieldApiName]: this.description,
                [UPDATED_COMPLETED_FIELD.fieldApiName]: false
            }
        };
        
        createRecord(recordInput)
            .then(taskCustom => {
                this.taskCustomId = taskCustom.id;
                // this.newTask = {
                //                 [NAME_FIELD.fieldApiName]: recordInput.fields.Name,
                //                 [DESCRIPTION_FIELD.fieldApiName]: recordInput.fields.Description__c,
                //                 [UPDATED_COMPLETED_FIELD.fieldApiName]: false}
                debugger;
                this.newTask = recordInput.fields;
                this.newTask["Id"] = taskCustom.id;
                this.newTask.completeStatus = "incompleted";
                this.tasks = [...this.tasks, this.newTask];
                this.tasksMap = {...this.tasks, ...{[taskCustom.id]:this.newTask}};
                debugger;
                this.incompletedTaskIds.push(taskCustom.id);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Custom Task Created',
                        variant: 'success',
                    }),
                );
                this.name= '';
                this.description='';
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating record',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
   
            //this.template.querySelectorAll(".reset").reset();
            // this.template.querySelectorAll(".reset").foreach( e => e.value = null);
            // var selectorValue = this.template.querySelector("[data-id= 'selector1']").value;
            //this.template.querySelector("[data-id= 'selector1']").value = null;
            
            //this.template.querySelectorAll will get a nodelist
            // var nodeList = this.template.querySelectorAll(".reset");
            // // we need to convert nodelist to array, then we can use array methods, such as foreach
            // var convertedArray = Array.from(nodeList);
            // convertedArray.forEach(e => e.value = null);
           
    }


    updateTaskCustom(){
        debugger;
        if(this.updatedId != null){
            const allValid = [...this.template.querySelectorAll('[data-record-id="' +this.updatedId+ '"]') ]
                .reduce((validSoFar, inputField) => {
                    inputField.reportValidity();
                    return validSoFar && inputField.checkValidity();
                }, true);

            if (allValid) {
                   //Create the recordInput object
                const fields = {};
                fields[UPDATED_ID_FIELD.fieldApiName] = this.updatedId;
                if(this.updatedName != null) fields[UPDATED_NAME_FIELD.fieldApiName] = this.updatedName;
                if(this.updatedDescription != null) fields[UPDATED_DESCRIPTION_FIELD.fieldApiName] = this.updatedDescription;

                const recordInput = { fields };

                updateRecord(recordInput)
                    .then(() => {
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Success',
                                message: 'Custom Task Updated',
                                variant: 'success'
                            })
                        );
                        // Display fresh data in the form
                        return refreshApex(this.wiredResult);
                    })
                    .catch(error => {
                        this.dispatchEvent(
                            new ShowToastEvent({
                                title: 'Error updating record',
                                message: error.body.message,
                                variant: 'error'
                            })
                        );
                    });
                }
            else {
                // The form is not valid
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Something is wrong',
                        message: 'Check your input and try again.',
                        variant: 'error'
                    })
                );
            }
        }
        this.updatedName = null;
        this.updatedDescription = null;
        this.updatedId = null;
    }

    completeTaskCustom(event){
        //var recordId = event.target.getAttribute("data-record-id");
        var recordId = event.target.dataset.recordId;
        var completeStatus;
        if (this.tasksMap[recordId].Completed__c == false) {
            completeStatus = true;
            this.tasksMap[recordId].Completed__c = true;
            this.tasksMap[recordId].completeStatus = 'completed';
        }else{
            completeStatus = false;
            this.tasksMap[recordId].Completed__c = false;
            this.tasksMap[recordId].completeStatus = 'incompleted';
        }
        const fields = {};
        fields[UPDATED_ID_FIELD.fieldApiName] = recordId;
        fields[UPDATED_COMPLETED_FIELD.fieldApiName] = completeStatus;

        const recordInput = { fields };

        updateRecord(recordInput)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Custom Task ' + (completeStatus == false? 'not done yet' : 'compeleted' ),
                        variant: 'success'
                    })
                );
                // Display fresh data in the form
                return refreshApex(this.wiredResult);
            })
        
        

        // //how to get data-record-id, how to check all the attributes for an element
        // var completedClass = [...[...event.target.parentNode.parentNode.childNodes][0].childNodes][0].className;
        // // var completeStatusString = event.target.getAttribute("data-complete-status");
        // var completeStatus;
        // if (completedClass.search(/(^|\W)incompleted($|\W)/)>=0) {
        //     completeStatus = true;
        //     event.target.dataCompleteStatus = true;

        //     this.completedTaskIds.push(recordId);
        //     this.incompletedTaskIds = this.incompletedTaskIds.filter(e => e != recordId);
        // }else{
        //     completeStatus = false;
        //     event.target.dataCompleteStatus = false;
        //     if (this.completedTaskIds != null) {
        //         this.completedTaskIds = this.completedTaskIds.filter(e => e.Id != recordId);
        //         this.incompletedTaskIds.push(recordId);
        //     }
        // }
        

        
        
        
        // var i;
        // for (i = 0; i < this.completedTaskIds.length; i++) {
        //     [...this.template.querySelectorAll('[data-record-id="' +this.completedTaskIds[i]+ '"]') ].forEach(e => e.className='completed');
        // }
        // var n;
        // for (n = 0; n < this.incompletedTaskIds.length; n++) {
        //     [...this.template.querySelectorAll('[data-record-id="' +this.incompletedTaskIds[i]+ '"]') ].forEach(e => e.className='incompleted');
        // }

        // //this.template.querySelectorAll will get a nodelist
        // var nodeList = this.template.querySelectorAll('[data-complete-status=true]');
        // // we need to convert nodelist to array, then we can use array methods, such as foreach
        // var convertedArray = Array.from(nodeList);
        // convertedArray.forEach(e => e.className='class1');
        // [...this.template.querySelectorAll('[data-complete-status=false]') ].forEach(e => e.className='class1')

    }
}





