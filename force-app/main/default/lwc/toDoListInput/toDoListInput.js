import { LightningElement,track  } from 'lwc';
import { createRecord} from 'lightning/uiRecordApi';
import TASK_CUSTOM_OBJECT from '@salesforce/schema/Task_Custom__c';
import NAME_FIELD from '@salesforce/schema/Task_Custom__c.Name';
import DESCRIPTION_FIELD from '@salesforce/schema/Task_Custom__c.Description__c';
import UPDATED_COMPLETED_FIELD from '@salesforce/schema/Task_Custom__c.Completed__c';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import Name from '@salesforce/schema/Account.Name';

export default class ToDoListInput extends LightningElement {
    name = '';
    description = '';
    error;

    onNameChange(event){
        this.name = event.target.value;
    }
    onDescChange(event){
        this.description = event.target.value;
    }
    
    createTaskCustom() {
        const inputEvent = new CustomEvent("inputtask", {
            detail: {
                name: this.name,
                description: this.description
        }});
        this.dispatchEvent(inputEvent);
        this.name= '';
        this.description='';

        // const recordInput = {
        //     apiName: TASK_CUSTOM_OBJECT.objectApiName,
        //     fields: { 
        //         [NAME_FIELD.fieldApiName]: this.name, 
        //         [DESCRIPTION_FIELD.fieldApiName]: this.description,
        //         [UPDATED_COMPLETED_FIELD.fieldApiName]: false
        //     }
        // };
        
        // createRecord(recordInput)
        //     .then(taskCustom => {
        //         // const inputEvent = new CustomEvent("inputtask"); 
        //         const inputEvent = new CustomEvent("inputtask", {
        //             detail: {
        //                 id: taskCustom.id,
        //                 name: taskCustom.fields.Name.value,
        //                 description: taskCustom.fields.Description__c.value,
        //                 completed:false,
        //                 completeStatus: "incompleted"
        //         }});

        //         this.dispatchEvent(inputEvent);
        //         this.dispatchEvent(
        //             new ShowToastEvent({
        //                 title: 'Success',
        //                 message: 'Custom Task Created',
        //                 variant: 'success',
        //             }),
        //         );
        //         this.name= '';
        //         this.description='';
        //     })
        //     .catch(error => {
        //         this.dispatchEvent(
        //             new ShowToastEvent({
        //                 title: 'Error creating record',
        //                 message: error,
        //                 variant: 'error'
        //             })
        //         );
        //     });
    }
}

