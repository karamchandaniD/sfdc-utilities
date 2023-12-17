import { api, LightningElement, track } from 'lwc';
const KEYS_TO_EXCLUDE = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'], KEY_ENTER = 'Enter', TAB_KEY = 'Tab', ESC_KEY = 'Escape';
export default class Listbox extends LightningElement {
    @track
    data = {
        inputKey: 'lookup-search',
        isAllSelected: false,
        selectAllLabel: 'Select All', // can be dynamically in future with user input
        deselectAllLabel: 'Deselect All', // can be dynamically in future with user input
        allOptionSelectedText: 'Selected all options', // can be dynamically in future with user input
        splitByChar: ','
    };
    // To hide label, specify label-hidden. Default is standard" 
    _variantStandard = 'standard';
    _variantLabelHidden = 'label-hidden';
    @api
    get variant() {
        return this._variant;
    }
    set variant(val) {
        if (!val) {
            val = this._variantStandard;
        }
        val = val + '';
        if (val.toLowerCase() == this._variantStandard) {
            this._variant = this._variantStandard;
        } else if (val.toLowerCase() == this._variantLabelHidden) {
            this._variant = this._variantLabelHidden;
        } else {
            this._variant = this._variantStandard;
        }
    }
    // Define label that you want to be display for selection
    @api label;
    get showLabel() {
        return this.variant == this._variantLabelHidden ? false : this.label !== undefined;
    }
    // Define that help text to be displayed along with label
    @api helptext = '';
    get showHelptext() {
        if (this.helptext !== undefined && (this.helptext + '').trim().length > 0) {
            return true;
        }
        return false;
    }
    get labelClass() {
        return 'slds-form-element__label slds-truncate' + (this.showHelptext ? ' show-help-info' : '');
    }
    // 
    @api
    placeholder = "Search...";
    get cplaceholder() {
        return this.data.isAllSelected ?
            this.data.allOptionSelectedText :
            this.data.selectedLabels && this.data.selectedLabels.length > 0 ?
                this.data.selectedLabels.length < 4 ? this.data.selectedLabels.join(',') : 'Selected ' + this.data.selectedLabels.length + ' options' :
                this.placeholder;
    }
    // 
    @api
    get allowMultiSelection() {
        return this._allowMultiSelection === undefined ? false : this._allowMultiSelection;
    }
    set allowMultiSelection(data) {
        this._allowMultiSelection = data;
    }
    // 
    @api isreadonly = false;
    // 
    @api disabled = false;
    // 
    @api
    get masterSelection() {
        return this.allowMultiSelection ? this._masterSelection === undefined ? true : this._masterSelection : false;
    }
    set masterSelection(data) {
        this._masterSelection = data;
    }
    // 
    @api allowOnlySelection = false;
    get displayOnlyChoice() {
        return this.allowOnlySelection && this.allowMultiSelection;
    }
    @api
    get options() {
        return this.optionToDisplay;
    }
    set options(val) {
        console.log('val',val, typeof val);
        if (!val) {
            val = [];
        }
        this.data.options = Array.isArray(val) ? val : Object.values(val);
        this.data.isAllSelected = false;
        this.data.selectedLabels = this.data.selectedOptions = [];
        this._processOptions();
        console.log('val',JSON.stringify(val));
    }
    @api
    get value() {
        console.log('->get value', (this.data._value == undefined ? '' : this.data._value))
        return this.data._value == undefined ? '' : this.data._value;
    }
    set value(val) {
        console.log('->set value', (val));
        this.data._value = this.data._value === undefined ? '' : this.data._value;
        this.data._oldValue = this.data._value;
        if (val !== undefined && this.data._value != val) {
            this.data._value = (val + '');
            this.data._value = this.data._value.trim();
            this._processOptions();
        }
    }
    @api 
    get editedValue(){
        console.log('->get editedValue', (val));
        return this.value;
    }
    set editedValue(val){
        console.log('->set editedValue', (val));
    }
    @api
    get displayInfo() {
        return this._displayInfo ? true : false;
    }
    set displayInfo(data) {
        this._displayInfo = data;
    }
    @api
    get splitByChar() {
        return this._splitByChar === undefined || (this._spliByChar + '').trim().length == 0 ? this.data.splitByChar : this._splitByChar;
    }
    set splitByChar(data) {
        this._splitByChar = data;
    }
    _processOptions() {
        console.log('_processOptions');
        let self = this;
        let selectedOptions = self.value.split(self.splitByChar);
        if (Array.isArray(self.data.options)) {
            self.data._options = [];
            self.data.options.forEach(function (option) {
                let opt = Object.fromEntries(Object.entries(option));
                if (opt.label !== undefined) {
                    if (opt.value == undefined) {
                        opt.value = opt.label;
                        if (opt.key !== undefined) {
                            opt.value = opt.key;
                        }
                    }
                    if (selectedOptions.indexOf(opt.value) > -1) {
                        if (opt.checked !== true) {
                            opt.checked = true;
                        }
                    } else {
                        if (opt.checked === true) {
                            opt.checked = false;
                        }
                    }

                    if (opt.title === undefined) {
                        opt.title = opt.label;
                        if (self.displayInfo && opt.info !== undefined && (opt.info + '').length > 0) {
                            opt._info = '(' + (opt.info + '').trim() + ')';
                            opt.title += ' ' + opt._info;
                            opt.displayInfo = true;
                        }
                    }
                    opt.className = 'slds-listbox__item';
                    self.data._options.push(opt);
                }
            })
        }
        console.log('_processOptions', selectedOptions?.length, selectedOptions);
        if (selectedOptions.length > 0) {
            self._prepareSelectedValues();
        }
    }
    get optionToDisplay() {
        if (!this.data._options) {
            this.data._options = [];
        }
        return this.data._options;
    }
    /** Start of lwc dynamic properties */
    get selectAllOptionLabel() {
        return this.data.isAllSelected ? this.data.deselectAllLabel : this.data.selectAllLabel;
    }
    get comboboxClass() {
        return ' slds-combobox_container ';
    }
    get showMasterSelection() {
        return this.data.noOptionFound ? false : this.masterSelection;
    }
    @track
    comboboxClasses = ['slds-combobox', 'slds-dropdown-trigger', 'slds-dropdown-trigger_click'];
    get lookupComboboxClass() {
        return this.comboboxClasses.join(' ');
    }
    get showIcon() {
        return this.iconName && typeof this.iconName == 'string' ? true : false;
    }
    get allowSearch() {
        return this.isreadonly ? false : true;
    }
    get showReadOnlySearchBox() {
        return !this.allowSearch;
    }
    get allowSelection() {
        return this.allowMultiSelection || !this.data.valueSelected;
    }
    get singleSelectedOption() {
        return this.data.valueSelected ? this.data._options[this.data.selectedIndex] : {};
    }
    /** End of lwc dynamic properties */
    /**
     * Key Navigation
     */
    listBoxKey = 'listbox-id-object';
    get listBoxClass (){
        let sc = 'slds-dropdown slds-dropdown_length-with-icon-' + 5 + ' slds-dropdown_fluid ' ;
        return sc;
    }
    highlighItemClass = 'slds-theme_shade';
    /** Starts of element functions */
    _lookupCombobox() {
        let self = this;
        return self.template.querySelector('div[data-key="lookupcombobox"]');
    }
    _getElementsByDataKey(key) {
        let self = this;
        return self.template.querySelectorAll('[data-key="' + key + '"]');
    }
    _getElementsBySearchKey(searchKey) {
        let self = this;
        return self.template.querySelectorAll(searchKey);
    }

    _searchInput() {
        let self = this;
        return self.template.querySelector('input[data-key="' + self.data.inputKey + '"]');
    }
    _getUserInput() {
        let self = this;
        let searchInput = self._searchInput();
        if (searchInput) {
            return searchInput.value;
        }
        return '';
    }
    _restUserInput() {
        let self = this;
        let searchInput = self._searchInput();
        if (searchInput) {
            searchInput.value = '';
            self._prepareNoOptionFound('');
        }
    }
    _inputFocus() {
        let self = this;
        self.doHide = true;
        window.setTimeout(function () {
            self._inputFocusOnly(self);
        }, 250);
    }
    _inputFocusOnly(hlpr) {
        let searchInput = hlpr._searchInput();
        if (searchInput) {
            searchInput.focus();
        }
    }
    _show() {
        let self = this;
        if (self.comboboxClasses.indexOf('slds-is-open') == -1) {
            self.comboboxClasses.push('slds-is-open');
        }
    }
    _hide() {
        let self = this;
        let lookupCombobox = self._lookupCombobox();
        if (lookupCombobox) {
            let clsIndex = self.comboboxClasses.indexOf('slds-is-open');
            if (clsIndex > -1) {
                self.comboboxClasses.splice(clsIndex, 1);
                self._restUserInput();
            }
        }
    }

    /** End of element functions */
    handleFocus() {
        // console.log('---handleFocus');
        // this._show();
    }
    handleClick() {
        this._show();
    }
    handleBlur(evt) {
        let self = this;
        self.doHide = true
        self.handleFocusLost();
    }
    handleFocusLost() {
        let self = this;
        window.setTimeout(function () {
            if (self.doHide == true) {
                self._hide();
            }
        }, 150);
        let focusLostEvent = new CustomEvent('focuslost', {});
        this.dispatchEvent(focusLostEvent);
    }
    handleKeyUp(evt) {
        if (KEYS_TO_EXCLUDE.indexOf(evt.key) == -1 && KEY_ENTER != evt.key) {
            let self = this;
            self.searchedKey = evt.currentTarget.value;
            self._doSearch();
        }
    }
    _doSearch(){
        let self = this;
        self._prepareNoOptionFound(self.searchedKey);
    }
    _prepareNoOptionFound(val){
        val = val === undefined ? '' : (val + '').toLowerCase();
        let self = this;
        self.data.noOptionFound = true;
        if (!self.data._options) {
            self.data._options = [];
        }
        self.data.showingOption = 0;
        let selectedAll = true;
        self.data._options.forEach(function (option) {
            option.isHide = option.label !== undefined && (option.label + '').toLowerCase().indexOf(val) == -1;
            // let isHighlighted = option.className && option.className.indexOf(self.highlighItemClass) > -1;
            self._maintainOptionClass(option);
            if (!option.isHide) {
                self.data.showingOption++;
                self.data.noOptionFound = false;
                if(!option.checked){
                    selectedAll = false
                }
            }
        })
        self.data.isAllSelected = selectedAll;
    }
    handleKeyDown(evt) {
        let self = this;
        if (ESC_KEY === evt.key) {
            self._hide();
        } else if (TAB_KEY !== evt.key) {
            self._show();
        }
    }

    handlePanel() {
        let self = this;
        self.doHide = false;
        if (self.cRecordNotFound) {
            window.setTimeout(() => {
                self._hide();
            }, 10);
        }
    }
    handleSelection(evt) {
        let index = evt.currentTarget.dataset.index;
        evt.preventDefault();
        this._handleRecordSelection(index);
    }
    _hightlightRow(index){
        let self = this;
        let visibleEles = self._getElementsBySearchKey('li[data-index="' + index + '"]');
        if (visibleEles && visibleEles.length > 0) {
            visibleEles[0].className = visibleEles[0].className.trim();
            if (visibleEles[0].className.indexOf(self.highlighItemClass) == -1) {
                visibleEles[0].className += ' ' + self.highlighItemClass;
            }
        }
    }
    _handleRecordSelection(selectedIndex, doHighlight) {
        let self = this;
        if(!self.allowMultiSelection){
            self.data._options.forEach(function(option, index){
                if(index != selectedIndex){
                    option.checked = false;
                }
            })
        }
        if (self.data._options[selectedIndex]) {
            self.data._options[selectedIndex].checked = self.data._options[selectedIndex].checked === true ? false : true;
        }
        self._prepareSelectedValues();
        if(doHighlight){
            setTimeout(() => {
                // self._hightlightRow(selectedIndex);
            }, 1000);
        }
    }
    handleCheckClick(evt) {
        let self = this;
        let index = evt.currentTarget.dataset.index;
        if (self.data._options[index]) {
            self.data._options[index].checked = self.data._options[index].checked === true ? false : true;
        }
        self._inputFocus();
        evt.stopPropagation();
    }
    
    handleChangeMasterSelection(evt) {
        let self = this;
        self.data.isAllSelected = !self.data.isAllSelected;
        self.data._options.forEach(function (option) {
            if (!option.isHide) {
                option.checked = self.data.isAllSelected;
            }
        })
        self._prepareSelectedValues();
    }
    handleOptionOnlyClick(evt) {
        let self = this;
        self.data._options.forEach(function (option) {
            option.checked = false;
        })
        evt.preventDefault();
    }
    _prepareSelectedValues() {
        console.log('_prepareSelectedValues');
        let self = this;
        self.data.valueSelected = false;
        let selectedAll = true;
        let selectedOptions = {};
        let selectedLabels = {};
        if (self.data._options) {
            self.data._options.forEach(function (option, index) {
                console.log('_prepareSelectedValues', option.checked, option.value, option);
                if (option.checked) {
                    selectedOptions[option.value] = option;
                    selectedLabels[option.label] = option;
                    self.data.valueSelected = !self.allowMultiSelection;
                    self.data.selectedIndex = index;
                } else if (!option.isHide) {
                    selectedAll = false;
                }
                self._maintainOptionClass(option);
            })
        }
        self.data.isAllSelected = selectedAll;
        self._inputFocus();
        self.data.selectedLabels = Object.keys(selectedLabels);
        self.data.selectedOptions = Object.keys(selectedOptions);
        let selectedVal = self.data.selectedOptions.join(self.splitByChar);
        if (self.data._value === undefined) {
            self.data._value = '';
        }
        if (self.data._oldValue === undefined) {
            self.data._oldValue = '';
        }
        console.log('_prepareSelectedValues', self.data._value+'-', self.data._oldValue+'-', selectedVal+'-');
        if (self.data._value != selectedVal || self.data._value != self.data._oldValue) {
            self.data._value = selectedVal;
            try {
                console.log('change', {
                    options: self.data.selectedOptions,
                    value: self.data._value,
                    splitBy: self.splitByChar
                })
                let changeEvent = new CustomEvent('change', {
                    detail: {
                        options: self.data.selectedOptions,
                        value: self.data._value,
                        splitBy: self.splitByChar
                    }
                });
                self.dispatchEvent(changeEvent);
            } catch (e) {
                console.log('error onchange ', e);
            }
            try {
                console.log('cellChange', {
                    options: self.data.selectedOptions,
                    value: self.data._value,
                    splitBy: self.splitByChar
                })
                let changeEvent = new CustomEvent('cellChange', {
                    detail: {
                        options: self.data.selectedOptions,
                        value: self.data._value,
                        splitBy: self.splitByChar
                    }
                });
                self.dispatchEvent(changeEvent);
            } catch (e) {
                console.log('error onchange ', e);
            }
        }
    }
    _maintainOptionClass(option) {
        option.className = 'slds-listbox__item display-flex ';
        if (this.displayInfo) {
            option.className += ' display-flex';
        }
        if (option.isHide) {
            option.className += ' slds-hide';
        }
    }
    @api
    get validity() {
        return true;
    }
    @api
    showHelpMessageIfInvalid() {
        return '';
    }
}