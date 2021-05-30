import { LightningElement,wire, track  } from 'lwc';
import fetchData from '@salesforce/apex/TaskController.fetchData';
import { createRecord } from 'lightning/uiRecordApi';
import TASK_CUSTOM_OBJECT from '@salesforce/schema/Task_Custom__c';
import NAME_FIELD from '@salesforce/schema/Task_Custom__c.Name';
import DESCRIPTION_FIELD from '@salesforce/schema/Task_Custom__c.Description__c';

export default class ToDoList extends LightningElement {

    taskCustomId;
    @track tasks =[];
    @track newTask;
    // @track initialTasks;
    isLoading;
    error;
    name;
    description;
    onNameChange(event) {
        this.name = event.target.value;
    }
    onDescChange(event) {
        this.description = event.target.value;
    }
    // @wire(fetchData)
    // //I don't know why I cannot access initialTasks
    // initialTasks;

    // connectedCallback() {
    //     debugger;
    //     tasks=this.initialTasks.data;
    // }

    @wire(fetchData)
    //I don't know why I cannot access initialTasks
    wiredTaskss(result) {
        if (result.data && !this.tasks.length) {
            this.tasks = result.data;
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
        const recordInput = {
            apiName: TASK_CUSTOM_OBJECT.objectApiName,
            fields: { 
                [NAME_FIELD.fieldApiName]: this.name, 
                [DESCRIPTION_FIELD.fieldApiName]: this.description 
            }
        };
        createRecord(recordInput)
            .then(taskCustom => {
                this.taskCustomId = taskCustom.id;
                // this.newTask = recordInput;
                this.newTask = {Id: taskCustom.id, 
                                [NAME_FIELD.fieldApiName]: recordInput.fields.Name,
                                [DESCRIPTION_FIELD.fieldApiName]: recordInput.fields.Description__c};
                debugger;
                this.tasks = [...this.tasks, this.newTask];
                debugger;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Custom Task Created',
                        variant: 'success',
                    }),
                );
            })
            .catch(error => {
                // Handle error. Details in error.message.
            });
        
    }


    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName) {
            case 'delete':
                this.deleteRow(row);
                break;
            case 'show_details':
                this.showRowDetails(row);
                break;
            default:
        }
    }

    deleteRow(row) {
        const { id } = row;
        const index = this.findRowIndexById(id);
        if (index !== -1) {
            this.data = this.data
                .slice(0, index)
                .concat(this.data.slice(index + 1));
        }
    }

    findRowIndexById(id) {
        let ret = -1;
        this.data.some((row, index) => {
            if (row.id === id) {
                ret = index;
                return true;
            }
            return false;
        });
        return ret;
    }

    showRowDetails(row) {
        this.record = row;
    }
}



