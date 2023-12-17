import { LightningElement, track } from 'lwc';
import apex_getInitData from '@salesforce/apex/SFDC_UtilityCtlr.getInitData';
import apex_getAllMetadata from '@salesforce/apex/SFDC_UtilityCtlr.getAllMetadata';
import apex_deployMetadata from '@salesforce/apex/SFDC_UtilityCtlr.deployMetadata';
import apex_removeMetadata from '@salesforce/apex/SFDC_UtilityCtlr.removeMetadata';
export default class MdtManager extends LightningElement {
    @track
    data = { allowMdtSelect: false, dvName:'DeveloperName', dvLabel: 'Custom Metadata Record Name' };

    @track
    metadataConfig;
    metadataList=[];

    connectedCallback() {
        this._loadMetadata();
    }
    get disallowDelete() {
        return this.metadataConfig?.allowDelete !== true;
    }
    _prepareSelectedMdt() {
        let self = this;
        self.data.selectedOption = self.data.metadata?.find((rec) => rec.value == self.data.mdtName);
        if (self.metadataConfig)
            self.metadataConfig.allowConfig = false;
        console.log('>>_prepareSelectedMdt', self.data.selectedOption);
        if (self.data.mdtName && !self.data.selectedOption) {
            self.data.mdtName = '';
        }
        if (!self.data.mdtName) {
            self.metadataConfig = null
        }
    }
    _loadMetadata() {
        console.log('_loadMetadata');
        let self = this;
        self._prepareSelectedMdt();
        apex_getInitData()
        .then(result => {
            console.log('_loadMetadata', result);
            if (result) {
                self.data.metadata = result.metadata;
                self._prepareSelectedMdt();
            }
        })
        .catch(error => {
            console.log('_loadMetadata > error', error);
            self.actionCalling = '';
        })
        .finally(() => {
            self.data.allowMdtSelect = self.data.metadata?.length > 0;
        });
    }
    _getAllMetadata(name) {
        console.log('_getAllMetadata');
        let self = this;
        if (!self.metadataConfig) {
            self.metadataConfig = {};
        }
        self.metadataConfig.isLoading = true;
        apex_getAllMetadata({
            mdtName: name
        })
        .then(result => {
            // console.log('_getAllMetadata', JSON.stringify(result));
            console.log('_getAllMetadata', result);
            if (result) {
                self.metadataConfig = { draftValues: [] };
                delete result.data.fields['QualifiedApiName'];
                delete result.data.fields['Label'];
                let cols = Object.values(result.data.fields),
                    columns = [];
                // console.log(cols.length);
                cols.forEach(col => {
                    col.type = col.typeTable;
                    col.fieldName = col.value;
                    if (!col.typeAttributes) {
                        col.typeAttributes = {};
                    }
                    if (col.value == 'DeveloperName' || col.value == 'MasterLabel') {
                        col.typeAttributes.required = true;
                        col.editable = true;
                        self.data.dvName = 'DeveloperName', self.data.dvLabel = 'Custom Metadata Record Name';
                    } else if (col.value == 'Id' || col.value == 'Language' || col.value == 'SystemModstamp' || result['hide' + col.value]) {
                        col.hide = true;
                    } else if (col.editable = col.value.indexOf('__c') > -1) {
                        if (col.type == 'picklist') {
                            col.type = 'text';
                            // console.log(col.type, cl.optioons);
                            // console.log(JSON.stringify(col.options));
                            col.typeAttributes.options = col.options;
                        }
                        col.editable = true;
                    }
                    if (!col.hide) {
                        columns.push(col);
                    }
                    console.log(col.typeAttributes);
                });
                self.metadataConfig.columns = columns;
                self.metadataConfig.cols = JSON.parse(JSON.stringify(cols));
                self.metadataConfig.data = result.records;
                self.metadataConfig.type = result.type;
            }
        })
        .catch(error => {
            console.log('_getAllMetadata > error', error);
            self.actionCalling = '';
        })
        .finally(() => {
            self.metadataConfig.isLoading = false;
        });
    }
    handleRefresh() {
        console.log('handleRefresh');
        this._loadMetadata();
    }
    handleRefreshMetaData() {
        console.log('handleRefreshMetaData');
        let self = this;
        self._prepareSelectedMdt();
        self._getAllMetadata(self.data.mdtName);
    }
    handleChange(evt) {
        console.log('handleChange');
        let self = this;
        
        switch (evt.target.dataset.key) {
            case 'listbox-mdt':
                // console.log(JSON.stringify(evt.detail));
                self.data.mdtName = evt.detail.value;
                self.metadataConfig = {};
                if (evt.detail.value) {
                    self._getAllMetadata(self.data.mdtName);
                }
                self._prepareSelectedMdt();
                break;
            case 'listbox-column':
                self.metadataConfig.value = evt.detail.value;
                break;
        }
    }
    handleClick(evt) {
        console.log('handleClick');
        let self = this;
        
        switch (evt.target.dataset.key) {
            case 'configure-column':
                console.log(evt.target.dataset.index);
                self.metadataConfig.value = [];
                self.metadataConfig.options = [];
                self.metadataConfig.requiredOptions = ['Id'];
                self.metadataConfig.requiredOptions = [];
                self.metadataConfig.cols.forEach(col => {
                    self.metadataConfig.options.push({ label: col.label + ' (' + col.fieldName + ')', value: col.fieldName });
                    if (!col.hide) {
                        self.metadataConfig.value.push(col.fieldName);
                        if (col.typeAttributes?.required) {
                            self.metadataConfig.requiredOptions.push(col.fieldName);
                        }
                    }
                })
                console.log(self.metadataConfig);
                self.metadataConfig.allowConfig = true;
            break;
        }
    }
    handleClickConfigCancel() {
        console.log('handleClickConfigCancel');
        let self = this;
        self.metadataConfig.allowConfig = false;
    }
    handleClickConfigSave(evt) {
        console.log('handleClickConfigSave');
        let self = this;
        console.log(self.metadataConfig.value);
        let cols = []
        self.metadataConfig.cols.forEach(col => {
            col.hide = true;
            if (self.metadataConfig.value.indexOf(col.fieldName) > -1) {
                col.hide = false;
                cols.push(col);
            }
        })
        self.metadataConfig.columns = cols;
        self.metadataConfig.allowConfig = false;
    }
    _validate() {
        let self = this;
        let data = {};
        self.metadataConfig.data.forEach(rec => {
            data[rec.Id] = rec;
        })
        self.metadataConfig.draftValues.forEach(rec => {
            if (data[rec.Id]) {
                for (let key in rec) {
                    console.log(key, rec[key], data[rec.Id][key]);
                    data[rec.Id][key] = rec[key];
                }
            }
        })
        console.log('---', JSON.stringify(data));
        return { isValidate: true, data: Object.values(data) };
    }
    handleDeployMetadata() {
        console.log('handleDeployMetadata');
        let self = this, 
            validity = this._validate();
        if (validity.isValidate) {
            let fields = {};
            self.metadataConfig.isLoading = true;
            self.metadataConfig.columns.forEach(col => {
                fields[col.value] = { type: col.typeSFDC };
            })
            let data = [{
                type: self.metadataConfig.type,
                data: validity.data,
                fields: fields
            }];
            console.log(JSON.stringify(data));
            apex_deployMetadata({ 
                mdtData: JSON.stringify(data) 
            })
            .then(result => {
                self.metadataConfig.draftValues = [];
                console.log(result);
                // self._getAllMetadata(self.data.mdtName);
            })
            .catch(error => {
                console.log(error);
            })
            .finally(() => {
                console.log('finally');
                self.metadataConfig.isLoading = false;
            })
        }
    }
    handleAddMetadata() {
        console.log('handleAddMetadata');
        let self = this;
        console.log('handleAddMetadata', self.metadataConfig.data);
        console.log('handleAddMetadata', JSON.stringify(self.metadataConfig.data));
        let ind = 0;
        self.metadataConfig.data.forEach(row => {
            if (!row.Id || row.Id.indexOf('new-') === 0) {
                ind++;
            }
        })
        let rec = { Id: 'new-' + ind };
        self.metadataConfig.data.push(rec);
        self.metadataConfig.data = JSON.parse(JSON.stringify(self.metadataConfig.data));
        if (!self.metadataConfig.draftValues) {
            self.metadataConfig.draftValues = [];
        }
        window.setTimeout(() => {
            // self.metadataConfig.draftValues = JSON.parse(JSON.stringify(self.metadataConfig.draftValues));
            self.metadataConfig.isLoading = false;
        }, 1000)
        self.metadataConfig.draftValues.push({ MasterLabel: '', DeveloperName: '', Id: rec.Id });
        self.metadataConfig.isLoading = true;
        console.log('handleAddMetadata>', JSON.stringify(self.metadataConfig.data));
    }
    handleCellChange(evt) {
        console.log('handleCellChange');
        let self = this;
        console.log('draftValues', evt.detail.draftValues);
        console.log('draftValues', evt.target.draftValues);
        let reassign = false
        var values = JSON.parse(JSON.stringify(evt.target.draftValues));
            console.log(values);
        values.forEach((row) => {
            if (row.hasOwnProperty('DeveloperName')) {
                let val = (row.DeveloperName + '').trim();
                let a = "", e = !1, f = !1;
                if (val.length > 0) {
                    for (let i = 0; i < val.length; i++) {
                        var b = val.charAt(i);
                        "a" <= b && "z" >= b || "A" <= b && "Z" >= b || "0" <= b && "9" >= b ? (!e && ("0" <= b && "9" >= b) && (a += "X"),
                            a += b,
                            e = !0,
                            f = !1) : e && !f && (a += "_",
                                f = !0)
                    }
                }
                console.log(a);
                console.log(a, row.DeveloperName);
                if (row.DeveloperName !== a) {
                    row.DeveloperName = a;
                    reassign = true;
                }
            }
        })
        console.log('>reassign',reassign, evt.target.draftValues);
        self.metadataConfig.draftValues = evt.target.draftValues;
        if (reassign) {
            console.log(JSON.stringify(values));
            self.metadataConfig.isLoading = true;
            setTimeout(() => {
                self.metadataConfig.draftValues = JSON.parse(JSON.stringify(values));
                self.metadataConfig.isLoading = false;
            }, 100)
        }
    }
    handleRowSelectedName(evt) {
        console.log('handleRowSelectedName', JSON.stringify(evt.detail));
        let self = this;
        const selectedRows = evt.detail.selectedRows;
        // Display that fieldName of the selected rows
        for (let i = 0; i < selectedRows.length; i++) {
            console.log('You selected: ' + selectedRows[i]);
        }
        self.metadataConfig.selectedRows = evt.detail.selectedRows;
        self.metadataConfig.allowDelete = evt.detail.selectedRows.length > 0;
    }
    handleCheck(evt) {
        console.log('handleAddMetadata>', JSON.stringify(this.metadataConfig));
    }
    handleCancelDatatable(evt) {
        console.log('handleCancelDatatable draftValues');
        console.log('draftValues', evt.target?.draftValues);
        let self = this;
        let data = [];
        self.metadataConfig.data.forEach(rec => {
            if (rec.Id.indexOf('new-') === -1) {
                data.push(rec);
            }
        })
        self.metadataConfig.data = data;
        self.metadataConfig.data = JSON.parse(JSON.stringify(self.metadataConfig.data));
        self.metadataConfig.draftValues = [];
    }
    handleSaveDatatable() {
        console.log('=>>')
        // this._validate();
        this.handleDeployMetadata();
    }
    handleDeleteMetadata() {
        console.log('handleDeleteMetadata');
        let self = this;
        let data = {};
        console.log('->>> ',self.metadataConfig.selectedRows);
        console.log('->>> ',JSON.stringify(self.metadataConfig.selectedRows));
        self.metadataConfig.isLoading = self.metadataConfig.selectedRows.length > 0;
        self.metadataConfig.selectedRows.forEach(rec => {
            if (rec.Id.indexOf('new-') === -1) {
                data[rec.DeveloperName] = true;
            }
        })
        data = Object.keys(data);
        console.log(JSON.stringify(data));
        if (data.length > 0) {
            data = [{
                type: self.metadataConfig.type,
                data: data
            }];
            apex_removeMetadata({ 
                mdtData: JSON.stringify(data) 
            })
            .then(result => {
                // self.metadataConfig.draftValues = [];
                // console.log(result);
            })
            .catch(error => {
                console.log(error);
            })
            .finally(() => {
                console.log('handleDeleteMetadata finally');
                self.metadataConfig.isLoading = false;
            })
        } else {
            setTimeout(() => {
                self.metadataConfig.isLoading = false;
            }, 1000)
        }
        // self.metadataConfig.draftValues.forEach(rec => {
        //     if (data[rec.Id]) {
        //         for (let key in rec) {
        //             console.log(key, rec[key], data[rec.Id][key]);
        //             data[rec.Id][key] = rec[key];
        //         }
        //     }
        // })
        // console.log('---', JSON.stringify(data));
        // return { isValidate: true, data: Object.values(data) };
    }
}