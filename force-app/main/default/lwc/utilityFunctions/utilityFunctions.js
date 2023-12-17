import { ShowToastEvent } from 'lightning/platformShowToastEvent';
const callbackMap = {}
const showToast = (context, toast, overrideToast) => {
    if (context && toast) {
        if (overrideToast && typeof overrideToast == 'function') {
            overrideToast(toast);
        } else {
            var event = new ShowToastEvent(toast);
            context.dispatchEvent(event);
        }
    }
}
const handleErrors = (context, errors, overrideToast, displayToast = true) => {
    // Configure error toast
    let toastParams = {
        title: "Error",
        message: "Unknown error", // Default error message
        variant: "error"
    };
    // Pass the error message if any
    if (errors && !Array.isArray(errors)) {
        errors = [errors];
    }
    var errorMsg = '';
    if (errors && errors.length > 0) {
        if (errors[0]) {
            if (typeof errors == 'object') {
                let error = errors[0];
                if (error.body) {
                    error = error.body;
                }
                if (error.pageErrors && error.pageErrors.length > 0) {
                    errorMsg = error.pageErrors[0].message;
                } else if (error.fieldErrors) {
                    let fieldWithErrors = {}
                    errorMsg = _extractFieldsErrorMsg(error.fieldErrors, fieldWithErrors);
                } else if (error.message) {
                    errorMsg = error.message
                }
            } else {
                errorMsg = errors[0];
            }
        }
    }
    toastParams.message = errorMsg;
    if (toastParams.message) {
        if (overrideToast && typeof overrideToast == 'function') {
            overrideToast(toastParams);
        } else {
            if (displayToast) {
                showToast(context, toastParams);
            } else {
                console.log('Error: ', toastParams)
            }
        }
    }

    // Extracting fields Error Message
    function _extractFieldsErrorMsg(fieldErrors, fieldWithErrors) {
        var keys = Object.keys(fieldErrors);
        var msg = 'Unknown error';
        if (keys.length > 0) {
            msg = '';
            for (var keyInd in keys) {
                let key = keys[keyInd];
                var fErrors = fieldErrors[key];
                fErrors.forEach(function (fErr) {
                    let errorField = key;
                    if (fErr.columnApiName) {
                        errorField = fErr.columnApiName;
                    }
                    if (!fieldWithErrors[errorField]) {
                        fieldWithErrors[errorField] = '';
                    }
                    fieldWithErrors[errorField] += (fieldWithErrors[errorField] != '' ? '\n' : '') + fErr.message;
                    msg += fErr.message + ' \n';
                })
            }
        }
        return msg;
    }
}
const formatDateTime = (dateValue, format) => {
    let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let formatDt = dateValue;
    if (!formatDt) {
        formatDt = '';
    }
    var dateVaule = new Date(formatDt);
    if (dateVaule.toDateString() == 'Invalid Date') {
        return dateValue;
    }
    let oldFormat = format;
    let utcMonth = dateVaule.getMonth();
    format = format.replace(new RegExp('MMM', 'g'), monthNames[utcMonth]);
    format = format.replace(new RegExp('MM', 'g'), utcMonth + 1);
    let utcDate = dateVaule.getDate();
    format = format.replace(new RegExp('dd', 'g'), utcDate < 10 ? '0' + utcDate : utcDate);
    format = format.replace(new RegExp('d', 'g'), utcDate);
    format = format.replace(new RegExp('[yY]{4}', 'g'), dateVaule.getFullYear());

    return oldFormat != format && format ? format : dateValue;
}
const randomKey = (source = 'xAxx-yByy-zCzz-zyx', charactersToReplace = 'xyz') => {
    return source.replace(eval('/[' + charactersToReplace + ']/g'), function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
const refreshView = () => {
    eval('$A.get("e.force:refreshView").fire();');
    for (let key in callbackMap) {
        if (typeof callbackMap[key] == 'object') {
            var callback = callbackMap[key]['callback'];
            var hlpr = callbackMap[key]['hlpr'];
            if (hlpr && typeof callback == 'function') {
                callback(hlpr);
            }
        }
    }
}
const prepareActivityButton = (activityMetadata) => {
    let action = {
        id: activityMetadata.Id,
        actionClass: 'team-action slds-m-bottom_small slds-m-left_xx-small op-75',
        label: activityMetadata.Button_Label__c,
        title: activityMetadata.Button_Label__c,
        icon: activityMetadata.Icon__c,
        iconSize: 'small',
        iconClass: 'fill-white slds-p-right_xx-small',
        subject: activityMetadata.Default_Subject__c,
        shortcut: activityMetadata.Shortcut_Keys__c,
        type: activityMetadata.Type__c,
        name: activityMetadata.DeveloperName
    };

    action.style = '';
    if (activityMetadata.Background_Color__c) {
        let color = activityMetadata.Background_Color__c;
        if (color.indexOf('#') == -1) {
            if (isNaN(color[0])) {
                let variants = ['base', 'neutral', 'brand', 'brand-outline', 'destructive', 'destructive-text', 'inverse', 'success'];
                if (variants.indexOf(color) > -1) {
                    action.variant = color;
                    color = '';
                }
            } else {
                color = 'rgb(' + color + ')';
            }
        }
        if (color) {
            action.style += 'background-color: ' + color + ';';
            action.style += 'border-color: ' + color + ';';
        } else {
            action.style += 'border-color: inherit;';
        }
    }
    if (activityMetadata.Button_Text_Color__c) {
        action.style += 'color:' + activityMetadata.Button_Text_Color__c + ';';
    }
    if (action.shortcut) {
        action.title = action.shortcut;
    }
    return action;
}
/**
 * Used to setuo keydown event to initiate action 
 */
const processShortcut = (event, shortcut) => {
    if (!shortcut) {
        return false;
    }
    let keys = shortcut.split('+');
    if (event.altKey) {
        if (keys.indexOf('Alt') > -1) {
            keys.splice(keys.indexOf('Alt'), 1);
        } else {
            // return false;
        }
    }

    if (event.shiftKey) {
        if (keys.indexOf('Shift') > -1) {
            keys.splice(keys.indexOf('Shift'), 1);
        } else {
            // return false;
        }
    }

    if (event.ctrlKey) {
        if (keys.indexOf('Ctrl') > -1) {
            keys.splice(keys.indexOf('Ctrl'), 1);
        } else {
            // return false;
        }
    }

    if (event.metaKey) {
        if (keys.indexOf('Meta') > -1) {
            keys.splice(keys.indexOf('Meta'), 1);
        } else {
            // return false;
        }
    }
    let key = '';
    if (event.keyCode !== undefined && (event.keyCode > 64 && event.keyCode < 91)) {
        key = String.fromCharCode(event.keyCode).toLowerCase();
    } else {
        key = event.code.toLowerCase().replace('key', '');
    }
    if (keys.length === 1 && keys[0].toLowerCase() === key) {
        return true;
    }
}
const addRefreshViewCallback = (lwcComponentName, context, refreshViewCallback) => {
    if (!callbackMap[lwcComponentName]) {
        callbackMap[lwcComponentName] = {
            hlpr: context,
            callback: refreshViewCallback
        };
    }
}
// exporting methods
export { addRefreshViewCallback, formatDateTime, handleErrors, prepareActivityButton, processShortcut, randomKey, showToast, refreshView};