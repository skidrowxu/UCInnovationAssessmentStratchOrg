import { LightningElement, api  } from 'lwc';
import { updateRecord  } from 'lightning/uiRecordApi';
import UPDATED_NAME_FIELD from '@salesforce/schema/Task_Custom__c.Name';
import UPDATED_DESCRIPTION_FIELD from '@salesforce/schema/Task_Custom__c.Description__c';
import UPDATED_ID_FIELD from '@salesforce/schema/Task_Custom__c.Id';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ToDoListDisplay extends LightningElement {

    updatedName;
    updatedDescription;
    updatedId;
    @api task;
    @api wiredResult;

    get completeStatus(){
        return (this.task.Completed__c)? 'completed' : 'incompleted';
    }

    //how to retrive parent div attributes
    onNameUpdate(event) {
        debugger;
        this.updatedName = event.target.value;
        this.updatedId = event.target.dataset.recordId;
    }
    onDescUpdate(event) {
        this.updatedDescription = event.target.value;
        this.updatedId = event.target.dataset.recordId;
    }

    updateTaskCustom(){
        debugger;
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
                var updatetask = new CustomEvent("updatetask",{detail: {taskId: this.updatedId,
                                                                        updatedName: this.updatedName,
                                                                        updatedDescription: this.updatedDescription}});
                this.dispatchEvent(updatetask);
            })
            .then(() =>{
                this.updatedName = '';
                this.updatedDescription = '';
                this.updatedId = null;
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

    completeTaskCustom(event){
        //var recordId = event.target.getAttribute("data-record-id");
        var recordId = event.target.dataset.recordId;
        var completeStatusValue;
        this.dispatchEvent(new CustomEvent("gettaskid",{detail: {taskId: this.task.Id}}));        
    }

}