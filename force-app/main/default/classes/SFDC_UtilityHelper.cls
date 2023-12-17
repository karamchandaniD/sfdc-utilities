public class SFDC_UtilityHelper {
	/**
     * returning Map<String, sObjectType> the result of Schema.getGlobalDescribe
     * 
     **/
    public static Map<String, sObjectType> GLOBAL_SOBJECTTYPE {
        get {
            if (GLOBAL_SOBJECTTYPE == NULL) {
                GLOBAL_SOBJECTTYPE = Schema.getGlobalDescribe();
            }
            return GLOBAL_SOBJECTTYPE;
        }
        set;
    }
    /**
     * Operations
     */
    static Map<String, String> OP_EQUALS {
        get {
            if (OP_EQUALS == null) {
                OP_EQUALS = new Map<String, String> {
                    'label' => 'Equals',
                    'value' => '='
                };
            }
            return OP_EQUALS;
        }
        set;
    }

    static Map<String, String> OP_IS_NULL {
        get {
            if (OP_IS_NULL == null) {
                OP_IS_NULL = new Map<String, String> {
                    'label' => 'Is null',
                    'value' => 'is_null'
                };
            }
            return OP_IS_NULL;
        }
        set;
    }

    static Map<String, String> OP_IS_NOT_NULL {
        get {
            if (OP_IS_NOT_NULL == null) {
                OP_IS_NOT_NULL = new Map<String, String> {
                    'label' => 'Is not null',
                    'value' => 'is_not_null'
                };
            }
            return OP_IS_NOT_NULL;
        }
        set;
    }

    static Map<String, String> OP_NOT_EQUALS {
        get {
            if (OP_NOT_EQUALS == null) {
                OP_NOT_EQUALS = new Map<String, String> {
                    'label' => 'Does not equal',
                    'value' => '<>'
                };
            }
            return OP_NOT_EQUALS;
        }
        set;
    }

    static Map<String, String> OP_GREATER_THAN {
        get {
            if (OP_GREATER_THAN == null) {
                OP_GREATER_THAN = new Map<String, String> {
                    'label' => 'Greater than',
                    'value' => '>'
                };
            }
            return OP_GREATER_THAN;
        }
        set;
    }

    static Map<String, String> OP_GREATER_THAN_EQUAL {
        get {
            if (OP_GREATER_THAN_EQUAL == null) {
                OP_GREATER_THAN_EQUAL = new Map<String, String> {
                    'label' => 'Greater than or equal',
                    'value' => '>='
                };
            }
            return OP_GREATER_THAN_EQUAL;
        }
        set;
    }

    static Map<String, String> OP_LESS_THAN {
        get {
            if (OP_LESS_THAN == null) {
                OP_LESS_THAN = new Map<String, String> {
                    'label' => 'Less than',
                    'value' => '<'
                };
            }
            return OP_LESS_THAN;
        }
        set;
    }

    static Map<String, String> OP_LESS_THAN_EQUAL {
        get {
            if (OP_LESS_THAN_EQUAL == null) {
                OP_LESS_THAN_EQUAL = new Map<String, String> {
                    'label' => 'Less than or equal',
                    'value' => '<='
                };
            }
            return OP_LESS_THAN_EQUAL;
        }
        set;
    }

    static Map<String, String> OP_STARTS {
        get {
            if (OP_STARTS == null) {
                OP_STARTS = new Map<String, String> {
                    'label' => 'Starts with',
                    'value' => 'starts_with'
                };
            }
            return OP_STARTS;
        }
        set;
    }

    static Map<String, String> OP_ENDS {
        get {
            if (OP_ENDS == null) {
                OP_ENDS = new Map<String, String> {
                    'label' => 'Ends With',
                    'value' => 'ends_with'
                };
            }
            return OP_ENDS;
        }
        set;
    }

    static Map<String, String> OP_CONTAINS {
        get {
            if (OP_CONTAINS == null) {
                OP_CONTAINS = new Map<String, String> {
                    'label' => 'Contains',
                    'value' => 'contains'
                };
            }
            return OP_CONTAINS;
        }
        set;
    }
    /**
     * operations related to general type
     */
    static List<Map<String, String>> getGeneralOperations() {
        return new List<Map<String, String>> {
            OP_EQUALS,
            OP_NOT_EQUALS,
            OP_IS_NULL,
            OP_IS_NOT_NULL
        };
    }

    /**
     * operations related to string,phone,email,text,id type
     */
    static List<Map<String, String>> getStringOperations() {
        return new List<Map<String, String>> {
            OP_EQUALS,
            OP_NOT_EQUALS,
            OP_CONTAINS,
            OP_STARTS,
            OP_ENDS,
            OP_IS_NULL,
            OP_IS_NOT_NULL
        };
    }

    static Map<String, String> typeWithltngType = new Map<String, String> {
        'checkbox' => 'checkbox',
        'date' => 'date',
        'datetime' => 'datetime',
        'time' => 'time',
        'email' => 'email',
        'tel' => 'tel',
        'url' => 'url',
        'number' => 'number',
        'textarea' => 'textarea',
        'text' => 'text',
        'combobox' => 'combobox'
    };

    /**
     * operations related to number,date,datetime, type
     */
    static List<Map<String, String>> getNumberOperations() {
        return new List<Map<String, String>> {
            OP_EQUALS,
            OP_NOT_EQUALS,
            OP_GREATER_THAN,
            OP_GREATER_THAN_EQUAL,
            OP_LESS_THAN,
            OP_LESS_THAN_EQUAL,
            OP_IS_NULL,
            OP_IS_NOT_NULL
        };
    }

    /**
     * @description Used to delete SObject records into the database.
     * @return String: secured Id value
     * @param source : Id value that needs to be pass secure SOQL SOSL Injection
     * @note Don't change value of this property.
     * 
     * @author Dharmendra Karamchandani
     **/
    public static String secureIdInjection(String source) {
        if (String.isNotEmpty(source)) {
            //Escaping Single Quotes
            source = String.escapeSingleQuotes(source);
            //Replacing white space Characters
            source = source.replaceAll('[^\\w]', '');
        }
        return source;
    }
    /*******************************************************************************************************
     * @description Method used to get initialization data
     * @return Map<String, Object>
     * @param recordId: current record Id
     * @param sObjectName: sObject API Name
     * @param fields: List of fields API Name
     **/
    @AuraEnabled
    public static Map<String, Object> getInitData(String recordId, String sObjectName, List<String> fields) {
        Map<String, Object> result = new Map<String, Object>();
        sObjectName = secureIdInjection(sObjectName);
        sObjectType sobj;
        if (String.isEmpty(sObjectName)) {
            if (String.isEmpty(recordId)) {
                return result;
            }
        } else {
            sObjectName = sObjectName.toLowerCase();
        }
        if (sobj == null && GLOBAL_SOBJECTTYPE.containsKey(sObjectName)) {
            sobj = GLOBAL_SOBJECTTYPE.get(sObjectName);
        }
        if (sobj == null) {
            recordId = secureIdInjection(recordId);
            if (recordId instanceof Id) {
                sobj = ((Id) recordId).getSobjectType();
            }
        }
        if (sobj != null) {
            result.putAll(preparesObjectFields(sobj, ''));
        }
        return result;
    }

    /*******************************************************************************************************
     * @description Method used to get sObject fields
     * @return Map<String, Object>
     * @param sObjectName: sObject API Name
     * @param relationshipName: sObject Relationship Names
     **/
    @AuraEnabled
    public static Map<String, Object> preparesObjectFields(String sObjectName, String relationshipName) {
        sObjectName = secureIdInjection(sObjectName);
        return preparesObjectFields(GLOBAL_SOBJECTTYPE.get(sObjectName), relationshipName);
    }

    /*******************************************************************************************************
     * @description Method used to get operation details
     * @return List<Map<String, String>>
     * @param ftype: sObject API Name
     **/
    static List<Map<String, String>> getOperations(String ftype) {
        ftype = ftype.toLowerCase();
        switch on ftype {
            when 'text', 'textarea', 'email', 'phone', 'url' {
                return getStringOperations();
            }
            when 'number', 'date', 'datetime', 'time' {
                return getNumberOperations();
            }
            when
            else {
                return getGeneralOperations();
            }
        }
    }

    /*******************************************************************************************************
     * @description Method used to prepare data
     * @return Map<String, String>
     * @param ftype: sObject's field's data type
     **/
    static Map<String, String> prepaerData(String ftype) {
        Map<String, String> result = new Map<String, String>();
        result.put('typeSFDC', ftype);
        ftype = ftype.toLowerCase();
        switch on ftype {
            when 'boolean' {
                result.put('inputtype', 'checkbox');
                result.put('filtertype', 'combobox');
                result.put('typeTable', 'boolean');
            }
            when 'picklist', 'multipicklist' {
                result.put('inputtype', 'combobox');
                result.put('filtertype', 'combobox');
                result.put('typeTable', ftype);
            }
            when 'currency', 'double', 'integer', 'long', 'percent' {
                result.put('inputtype', 'number');
                result.put('filtertype', 'number');
                result.put('typeTable', ftype == 'percent' ? 'percent' : 'number');
            }
            when 'string' {
                result.put('inputtype', 'text');
                result.put('filtertype', 'text');
                result.put('typeTable', 'text');
            }
            when 'phone' {
                result.put('inputtype', 'tel');
                result.put('filtertype', 'text');
                result.put('typeTable', 'phone');
            }
            when 'id', 'reference', 'date', 'datetime', 'time', 'email', 'url', 'textarea' {
                result.put('filtertype', ftype);
                result.put('typeTable', ftype);
                if (ftype == 'date') {
                    result.put('typeTable', 'date-local');
                } else if (ftype == 'datetime') {
                    result.put('typeTable', 'date');
                } else {
                    if (ftype != 'time') {
                        result.put('filtertype', 'text');
                    }
                    if (!(ftype == 'email')) {
                        result.put('typeTable', 'text');
                    }
                }
                /*
                if (!(ftype == 'date' || ftype == 'datetime' || ftype == 'time')) {
                    result.put('filtertype', 'text');
                }
                */
                result.put('inputtype', ftype);
            }
            when
            else {
                result.put('filtertype', 'text');
                result.put('inputtype', 'text');
                result.put('typeTable', 'text');
            }
        }
        return result;
    }

    /*******************************************************************************************************
     * @description Method used to get sObject fields
     * @return Map<String, Object>
     * @param sobj: sObjects API name
     * @param relationshipName: sObjects Relationship Name
     **/
    static Map<String, Object> preparesObjectFields(sObjectType sobj, String relationshipName) {
        Map<String, Object> result = new Map<String, Object>();
        result.put('maxQueryLevel', 5);

        Map<String, Map<String, Object>> referenceFields = new Map<String, Map<String, Object>>();
        Map<String, Map<String, Object>> fields = new Map<String, Map<String, Object>>();
        Map<String, Object> operations = new Map<String, Object>();

        if (sobj == null) {
            return result;
        }

        Schema.DescribeSObjectResult dsr = sobj.getDescribe();
        String sObjectName = dsr.getName();
        result.put('sObjectLabel', dsr.getLabel());
        result.put('sObjectApiName', sObjectName);
        Set<String> objFields = dsr.fields.getMap().keySet();
        if (relationshipName == 'Owner') {
            objFields = new Set<String> {
                'Id',
                'Username',
                'LastName',
                'FirstName',
                'Name',
                'Title',
                'Email',
                'Phone',
                'Alias',
                'IsActive',
                'UserRoleId',
                'ProfileId'
            };
        }
        Set<String> referenceObjFields = new Set<String> {
            'OwnerId',
            'CreatedById',
            'LastModifiedById'
        };
        for (Schema.SObjectField f: dsr.fields.getMap().values()) {

            DescribeFieldResult fr = f.getDescribe();


            // || !fr.isFilterable()
            if (!fr.isAccessible() ) {
                continue;
            }
            // excluding as this is not queryable
            if (fr.getName() == 'CallCenterId' && sObjectName == 'User') {
                continue;
            }

            Map<String, Object> fieldConfig = new Map<String, Object>();
            fieldConfig.put('value', fr.getName());
            fieldConfig.put('label', fr.getLabel());
            fieldConfig.put('sortable', fr.isSortable());
            fieldConfig.put('editable', fr.isUpdateable());

            Map<String, String> data = prepaerData(fr.getType() + '');
            String ftype = data.get('filtertype');
            fieldConfig.putAll(data);
            // storing operations with processing field's type
            if (!operations.containsKey(ftype)) {
                operations.put(ftype, getOperations(ftype));
            }

            if (fr.getReferenceTo().size() > 0 && relationshipName != 'Owner') {
                fieldConfig.put('relationshipName', fr.getRelationshipName());
                fieldConfig.put('sObjectName', fr.getReferenceTo().get(0).getDescribe().getName());
                if (relationshipName == 'Owner' && !referenceObjFields.contains(fr.getName())) {
                    continue;
                }
                if (fr.getReferenceTo().size() == 1) {
                    referenceFields.put(fr.getName(), fieldConfig);
                } else if (referenceObjFields.contains(fr.getName())) {
                    if (fr.getName() == 'OwnerId') {
                        fieldConfig.put('sObjectName', 'User');
                    }
                    referenceFields.put(fr.getName(), fieldConfig);
                    if (objFields.contains(fr.getName()) || objFields.contains(fr.getName().toLowerCase())) {
                        fields.put(fr.getName(), fieldConfig);
                    }
                    continue;
                }
            }
            if (data.get('inputtype') == 'checkbox') {
                fieldConfig.put('filtertype', 'checkbox');
                List<Map<String, String>> options = new List<Map<String, String>>();
                options.add(new Map<String, String> {
                    'label' => 'True',
                    'value' => 'true'
                });
                options.add(new Map<String, String> {
                    'label' => 'False',
                    'value' => 'false'
                });
                fieldConfig.put('options', options);
            } else if (data.get('inputtype') == 'combobox') {
                List<Map<String, String>> options = new List<Map<String, String>>();
                for (Schema.PicklistEntry picklist: fr.getPickListValues()) {
                    options.add(new Map<String, String> {
                        'label' => picklist.getLabel(),
                        'value' => picklist.getValue()
                    });
                }
                fieldConfig.put('options', options);
            }
            fieldConfig.put('ltngInput', typeWithltngType.containsKey(ftype));
            if (objFields.contains(fr.getName()) || objFields.contains(fr.getName().toLowerCase())) {
                fields.put(fr.getName(), fieldConfig);
            }
        }
        operations.put('id', getOperations('id'));
        result.put('fields', fields);
        result.put('referenceFields', referenceFields);
        result.put('operations', operations);
        return result;
    }

    /*******************************************************************************************************
     * @description Method used to get reference fields for sObject
     * @return Map<String, String>
     * @param sObjectName: sObjects API name
     * @param relationshipName: sObjects Relationship Name
     **/
    @AuraEnabled
    public static Map<String, String> getReferenceFieldsForObject(String sObjectName, String relationshipName) {
        // Security Review fixes
        sObjectName = secureIdInjection(sObjectName);
        Map<String, String> fieldList = new Map<String, String>();

        if (relationshipName == 'Owner') {
            return fieldList;
        }
        Schema.DescribeSObjectResult sr = GLOBAL_SOBJECTTYPE.get(sObjectName).getDescribe();

        for (Schema.SObjectField f: sr.fields.getMap().values()) {
            DescribeFieldResult fr = f.getDescribe();

            if (!fr.isAccessible()) {
                continue;
            }
            // excluding as this is not queryable
            if (fr.getName() == 'CallCenterId' && sObjectName == 'User') {
                continue;
            }
            if (fr.getReferenceTo().size() == 1) {
                fieldList.put(fr.getName(), fr.getLabel());
            } else if (fr.getName() == 'OwnerId' && sObjectName != 'User') {
                fieldList.put(fr.getName(), fr.getLabel());
            }
        }

        return fieldList;
    }

    /*******************************************************************************************************
     * @description Method used to get reference fields for sObject
     * @return List<String>
     * @param sObjectName: sObjects API name
     * @param fieldName: sObjects field API Name
     **/
    @AuraEnabled
    public static List<String> getReferenceFieldDetails(String sObjectName, String fieldName) {
        // Security Review fixes
        sObjectName = secureIdInjection(sObjectName);
        List<String> fieldDetails = new List<String>();

        Schema.DescribeSObjectResult sr = GLOBAL_SOBJECTTYPE.get(sObjectName).getDescribe();

        DescribeFieldResult fr = sr.fields.getMap().get(fieldName).getDescribe();

        if (fieldName == 'OwnerId') {
            fieldDetails.add('User');
        } else {
            fieldDetails.add(fr.getReferenceTo().get(0).getDescribe().getName());
        }
        fieldDetails.add(fr.getRelationshipName());

        return fieldDetails;
    }
}