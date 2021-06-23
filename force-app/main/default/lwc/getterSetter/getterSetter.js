import { LightningElement, track } from 'lwc';
 
export default class GetterSetter extends LightningElement {
 
    defaultMsg = "We are learning ";
    outputMessage;
    //aura_proddebug.js:5163 Error: [LWC error]: The `appendChild` method is available only on elements that use the `lwc:dom="manual"` directive
    //message;
 
       
    get message(){
        return this.defaultMsg + "Lightning Web Component";
         
    }
 
    set message(val){
       this.outputMessage = val;
    }
    
    // if comment out above codes, message is changing based on event.target.value
    // if don't comment out above codes, this.message is always same, i.e. We are learning Lightning Web Component
    handleMessage(event){
        this.message = event.target.value;
    }
 
     
}