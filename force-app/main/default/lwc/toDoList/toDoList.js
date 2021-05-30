import { LightningElement,wire  } from 'lwc';
import fetchData from '@salesforce/apex/TaskController.fetchData';
import { createRecord } from 'lightning/uiRecordApi';
import TASK_CUSTOM_OBJECT from '@salesforce/schema/Task_Custom__c';
import NAME_FIELD from '@salesforce/schema/Task_Custom__c.Name';
import DESCRIPTION_FIELD from '@salesforce/schema/Task_Custom__c.Description__c';

export default class ToDoList extends LightningElement {

    taskCustomId;
    name;
    description;
    onNameChange(event) {
        this.name = event.target.value;
    }
    onDescChange(event) {
        this.description = event.target.value;
    }
    @wire(fetchData) tasks;

    connectedCallback() {

    }


    
    createTaskCustom() {
        const recordInput = {
            apiName: TASK_CUSTOM_OBJECT.objectApiName,
            fields: { 
                [NAME_FIELD.fieldApiName]: this.name, 
            }
        };
        createRecord(recordInput)
            .then(taskCustom => {
                this.taskCustomId = taskCustom.id;
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



