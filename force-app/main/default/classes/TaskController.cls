public class TaskController {
    @AuraEnabled(cacheable=true)
    public static List<Task_Custom__c> fetchData () {
        return [SELECT Id, Name, Description__c,Completed__c FROM Task_Custom__c WHERE CreatedById = : UserInfo.getUserId()
                ORDER BY CreatedDate ];
        //return new List<Task_Custom__c>();
    }
    @AuraEnabled(cacheable=true)
    public static List<Task_Custom__c> fetchDataImperatively () {
        // Datetime targetDate = System.now().addSeconds(10);
        List<Task_Custom__c> tasks = new List<Task_Custom__c>();

            tasks =  [SELECT Id, Name, Description__c,Completed__c FROM Task_Custom__c WHERE CreatedById = : UserInfo.getUserId()
            ORDER BY CreatedDate ];

        return tasks;
        // return [SELECT Id, Name, Description__c,Completed__c FROM Task_Custom__c WHERE CreatedById = : UserInfo.getUserId()
        //     ORDER BY CreatedDate ];
    }
    // @AuraEnabled(cacheable=true)
    // public static void insertTask (String name) {
    //     Task_Custom__c t = new Task_Custom__c(
    //         Name = name
    //     );
    //     insert t;
    // }
}