public class SFDC_UtilityCtlr {
    public static Map<String, sObjectType> GLOBAL_SOBJECTTYPE {
        get{
            if(GLOBAL_SOBJECTTYPE == NULL){
                GLOBAL_SOBJECTTYPE = Schema.getGlobalDescribe();
            }
            return GLOBAL_SOBJECTTYPE;
        }set;
    }
    @AuraEnabled
    public static Map<String, Object> getInitData() {
        Map<String, Object> result = new Map<String, Object>();
        List<Object> meatadata = new List<Object>();
        for (String key: GLOBAL_SOBJECTTYPE.keySet()) {
            Map<String, Object> data = new Map<String, Object>();
            if (key.endsWith('__mdt')) {
                data.put('apiName', GLOBAL_SOBJECTTYPE.get(key).getDescribe().getName());
                data.put('label', GLOBAL_SOBJECTTYPE.get(key).getDescribe().getLabel());
                data.put('value', data.get('apiName'));
                data.put('info', data.get('apiName'));
                meatadata.add(data);
            }
        }
        result.put('metadata', meatadata);
        return result;
    }
    @AuraEnabled
    public static Map<String, Object> getAllMetadata(String mdtName) {
        Map<String, Object> result = new Map<String, Object>();
        if (GLOBAL_SOBJECTTYPE.containsKey(mdtName)) {
            Map<String, SObjectField> fieldMap = GLOBAL_SOBJECTTYPE.get(mdtName).getDescribe().fields.getMap();
            List<String> fields = new List<String>();
            // String fieldCSV = '', op='';
            for (String key: fieldMap.keySet()) {
                fields.add(fieldMap.get(key).getDescribe().getName());
            }
            result.put('hideNamespacePrefix', mdtName.removeEnd('__mdt').indexOf('__') == -1);
            result.put('type', mdtName);
            result.put('fields', fields);
            result.put('records', Database.query('SELECT ' + String.join(fields,',') + ' FROM ' + mdtName));
            result.put('data', SFDC_UtilityHelper.preparesObjectFields(mdtName,''));
        }
        return result;
    }
    
    @AuraEnabled
    public static Map<String, Object> removeMetadata(String mdtData) {
        System.debug(mdtData);
        List<Object> mdts = (List<Object>)JSON.deserializeUntyped(mdtData);
        for (Object mdt: mdts) {
            Map<String, Object> data = (Map<String, Object>)mdt;
            String mdtType = data.get('type') + '';
            List<Object> records = (List<Object>)data.get('data');
            Set<String> mdtNames = new Set<String>();
            for (Object rec: records) {
                mdtNames.add(mdtType+'.'+rec + '');
            }
            System.debug(data.get('type')+'');
            MetadataService.DeleteResult[] res = mdApiService.deleteMetadata('CustomMetadata', new List<String>(mdtNames));
            System.debug(res);
        }
        return null;
    }
    @AuraEnabled
    public static Map<String, Object> deployMetadata(String mdtData) {
        System.debug(mdtData);
        List<MetadataService.Metadata> mdtList = new List<MetadataService.Metadata>();
        List<Object> mdts = (List<Object>)JSON.deserializeUntyped(mdtData);
        for (Object mdt: mdts) {
            Map<String, Object> data = (Map<String, Object>)mdt;
            System.debug(data.get('data'));
            System.debug(data.get('fields'));
            System.debug(data.get('type'));
            List<Object> records = (List<Object>)data.get('data');
            Map<String, Object> fields = (Map<String, Object>)data.get('fields');
            for (Object rec: records) {
                Map<String, Object> recData = (Map<String, Object>)rec;
                MetadataService.CustomMetadata mdtEntry = new MetadataService.CustomMetadata();
                mdtEntry.fullName = data.get('type') + '.' + recData.get('DeveloperName');
                mdtEntry.label = recData.get('MasterLabel')+'';
                mdtEntry.values = new List<MetadataService.CustomMetadataValue>();
                for (String key: recData.keySet()) {
                    if (key.endsWith('__c')) {
                        System.debug('add '+key+'-_-'+recData.get(key));
                        MetadataService.CustomMetadataValue val = new MetadataService.CustomMetadataValue();
                        val.field = key;
                        val.value = String.valueOf(recData.get(key));
                        if (String.isBlank(val.value)) {
                            val.value = null;
                        }
                        mdtEntry.values.add(val);
                    }
                    /*
                    for (String field: fields.keySet()) {
                    }*/
                }
                mdtList.add(mdtEntry);
            }
        }
        System.debug(mdtList);
        System.debug(JSON.serialize(mdtList));
        MetadataService.CustomMetadata s = new MetadataService.CustomMetadata();
        s.fullName='Test_Metadata__mdt.Test2';
        s.label='Test 2';
        MetadataService.CustomMetadataValue val = new MetadataService.CustomMetadataValue();
        val.field = 'Email__c';
        val.value = 'tests@tes.com';
        s.values = new List<MetadataService.CustomMetadataValue>();
        s.values.add(val);
        val = new MetadataService.CustomMetadataValue();
        val.field = 'Checkbox__c';
        val.value = 'true';
        s.values.add(val);
        val = new MetadataService.CustomMetadataValue();
        val.field = 'Date__c';
        val.value = '2023-12-08';
        s.values.add(val);
        val = new MetadataService.CustomMetadataValue();
        val.field = 'Date_Time__c';
        val.value = '2023-12-30T20:04:00.000Z';
        s.values.add(val);
        //MetadataService.UpsertResult[] res = mdApiService.upsertMetadata(new List<MetadataService.Metadata>{s});
        MetadataService.UpsertResult[] res = mdApiService.upsertMetadata(mdtList);
        System.debug(res);
        // MetadataService.upsertMetadata
        return null;
    }
    /**
     * v3.43
     * @return  SimpleSMSMetadataService.MetadataPort
     * 
     * @description preparing an instance of SimpleSMSMetadataService.MetadataPort with User's sessionId
    **/
    public static MetadataService.MetadataPort mdApiService {
        get {
            if (mdApiService == NULL) {
                mdApiService = new MetadataService.MetadataPort();
                mdApiService.SessionHeader = new MetadataService.SessionHeader_element();
                mdApiService.SessionHeader.sessionId = getUserSessionId();
                if (String.isBlank(mdApiService.SessionHeader.sessionId) || Test.isRunningTest()) {
                    mdApiService.SessionHeader.sessionId = UserInfo.getSessionId();
                }
            }
            return mdApiService;
        }set;
    }
    /**
     * @description GetUserSessionId - this method returns user seesion id in VF context
     * @param void
     * @return String sessionId
     * @author Dharmendra@CRMified
     * 
	**/
    public static String getUserSessionId(){
        PageReference sessionIdPage = Page.SessionId;
        
        String vfContent;
        if (!Test.isRunningTest()) {
            vfContent = sessionIdPage.getContent().toString();
        } else {
            vfContent = '<div>START_SESSION_ID_Test1_END_SESSION_ID</div>';
        }
        System.debug('>vfContent '+ vfContent);
        String sessionId = UserInfo.getSessionId();
        Integer startP = vfContent.indexOf('START_SESSION_ID_') + 'START_SESSION_ID_'.length(),
            endP = vfContent.indexOf('_END_SESSION_ID');
        if(endP > -1 && startP > -1 && endP >= startP){
            sessionId = vfContent.substring(startP, endP);
        }
        return sessionId;
    }
    /**
     System.debug(Schema.getGlobalDescribe().get('Test_Metadata__mdt')
    .getDescribe().fields.getMap()
    .get('Email__c')
    .getDescribe()); 
     */
}