import { LightningElement,wire, track  } from 'lwc';
import fetchData from '@salesforce/apex/TaskController.fetchData';
import fetchDataImperatively from '@salesforce/apex/TaskController.fetchDataImperatively';
import { updateRecord  } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';
import UPDATED_ID_FIELD from '@salesforce/schema/Task_Custom__c.Id';
import UPDATED_COMPLETED_FIELD from '@salesforce/schema/Task_Custom__c.Completed__c';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import { createRecord} from 'lightning/uiRecordApi';
import TASK_CUSTOM_OBJECT from '@salesforce/schema/Task_Custom__c';
import NAME_FIELD from '@salesforce/schema/Task_Custom__c.Name';
import DESCRIPTION_FIELD from '@salesforce/schema/Task_Custom__c.Description__c';


export default class ToDoListApp extends LightningElement {
    taskCustomId;
    @track tasks =[];
    @track wiredResult = [];
    error;
    
    @wire(fetchData)
    //I don't know why I cannot access initialTasks
    wiredTaskss(result) {
        this.wiredResult = result;
        if (result.data && !this.tasks.length) {

            this.tasks = result.data.map( task => {
                if (task.Completed__c == true) {
                    var taskCopy = {
                        ...task,
                        ...{completeStatus: "completed"}       
                    };
                } else{
                    var taskCopy = {
                        ...task,
                        ...{completeStatus: "incompleted"}       
                    };
                }
                return taskCopy;
            });
        }
        if (result.error) {
          this.error = result.error;
          this.tasks = undefined;
        }

    }
    handleInputTask(event){
        const recordInput = {
            apiName: TASK_CUSTOM_OBJECT.objectApiName,
            fields: { 
                [NAME_FIELD.fieldApiName]: event.detail.name, 
                [DESCRIPTION_FIELD.fieldApiName]: event.detail.description,
                [UPDATED_COMPLETED_FIELD.fieldApiName]: false
            }
        };
        
        createRecord(recordInput)
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Custom Task Created',
                        variant: 'success',
                    }),
                );
                return fetchDataImperatively ();
                // return refreshApex(this.wiredResult);
            })
            // .then(()=>{
            //     return refreshApex(this.wiredResult);
            // })
            .then(result => {
                this.tasks = result;
            })
            .catch(error => {
                // this.error = error;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating record',
                        message: error,
                        variant: 'error'
                    })
                );
            });


        // fetchDataImperatively (). then(result => {
        //         this.tasks = result;
        //     })
        //     .catch(error => {
        //         this.error = error;
        //     });

        // return this.tasks = [...this.tasks
        //             ,{Id:event.detail.id,
        //             Name:event.detail.name,
        //             Description__c:event.detail.description,
        //             Completed__c:event.detail.completed,
        //             completedStatus:event.detail.completeStatus
        //             }];
    }
    handleUpdate(event){
        let taskIndex = this.tasks.findIndex(e => e.Id == event.detail.taskId);
        this.tasks[taskIndex].Name = event.detail.updatedName;
        this.tasks[taskIndex].Description__c = event.detail.updatedDescription;
    }
    handleTaskReturn(event){
        let taskIndex = this.tasks.findIndex(e => e.Id == event.detail.taskId);
        let completeStatusValue;
        if (this.tasks[taskIndex].Completed__c == false) {
            completeStatusValue = true;
            this.tasks[taskIndex].Completed__c = true;
            this.tasks[taskIndex].completeStatus = 'completed';
        }else{
            completeStatusValue = false;
            this.tasks[taskIndex].Completed__c = false;
            this.tasks[taskIndex].completeStatus = 'incompleted';
        }
        const fields = {};
        fields[UPDATED_ID_FIELD.fieldApiName] = event.detail.taskId;
        fields[UPDATED_COMPLETED_FIELD.fieldApiName] = completeStatusValue;

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
    }

}



