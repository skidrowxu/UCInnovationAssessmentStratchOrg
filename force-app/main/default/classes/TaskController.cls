public with sharing class TaskController {
    @AuraEnabled(cacheable=true)
    public static List<Task_Custom__c> fetchData () {
         return [SELECT Id, Name, Description__c FROM Task_Custom__c WHERE CreatedById = : UserInfo.getUserId()
                ORDER BY Name];
    }
    // @AuraEnabled(cacheable=true)
    // public static void insertTask (String name) {
    //     Task_Custom__c t = new Task_Custom__c(
    //         Name = name
    //     );
    //     insert t;
    // }
}
