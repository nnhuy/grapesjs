export default grapesjs.plugins.add('bys-trait-select', (editor, options) => {
    editor.DomComponents.addType('select', {
        model: {
            defaults: {
                traits: [
                    // Strings are automatically converted to text types
                    'name', // Same as: { type: 'text', name: 'name' }
                    {
                        type: 'select', // Type of the trait
                        label: 'Value', // The label you will see in Settings
                        name: 'bys-value', // The name of the attribute/property to use on component
                        options: [
                            { value: '', name: '' },
                            { value: 'masterdata', name: 'GetMasterdata' },
                            { value: 'other', name: 'Other' },
                        ],
                        changeProp: 1,
                    },
                    {
                        type: "select",
                        label: "Event",
                        name: "bys-event",
                        options: [ // Array of options
                            { value: '', name: '' },
                            { value: 'onload', name: 'onload' },
                        ]
                    }
                ]
            },
            init() {
                // Also the listener changes from `change:attributes:*` to `change:*`
                this.listenTo(this, 'change:bys-value', this.valueChange);
            },
            updated(property, value, prevValue) {

            },
            valueChange() {
                this.attributes.attributes['bys-value'] = this.getTrait('bys-value').props().value;
                switch (this.getTrait('bys-value').props().value) {
                    case 'masterdata':
                        if (!this.getTrait('bys-master-data-table')) {
                            this.addTrait({
                                type: 'select', // Type of the trait
                                label: 'Table', // The label you will see in Settings
                                name: 'bys-master-data-table', // The name of the attribute/property to use on component
                                options: [
                                    { value: '', name: '' },
                                    { value: 'Table 1', name: 'Table 1' },
                                    { value: 'Table 2', name: 'Table 2' },
                                    { value: 'Table 3', name: 'Table 3' }
                                ]
                            });
                            this.addTrait({
                                type: 'select', // Type of the trait
                                label: 'Column', // The label you will see in Settings
                                name: 'bys-master-data-column', // The name of the attribute/property to use on component
                                options: [
                                    { value: '', name: '' },
                                    { value: 'Column 1', name: 'Column 1' },
                                    { value: 'Column 2', name: 'Column 2' },
                                    { value: 'Column 3', name: 'Column 3' }
                                ]
                            });
                            this.addTrait({
                                type: 'text', // Type of the trait
                                label: 'Where', // The label you will see in Settings
                                name: 'bys-master-data-condition', // The name of the attribute/property to use on component
                            });
                            this.addTrait({
                                type: 'select', // Type of the trait
                                label: 'Order', // The label you will see in Settings
                                name: 'bys-master-data-sort', // The name of the attribute/property to use on component
                                options: [
                                    { value: '', name: '' },
                                    { value: 'ascending', name: 'Ascending' },
                                    { value: 'descending', name: 'Descending' }
                                ]
                            });
                            this.listenTo(this, 'change:bys-master-data-table', this.dataTableChange);
                        }
                        break;
                    default:
                        this.removeTrait('bys-master-data-table');
                        this.removeTrait('bys-master-data-column');
                        this.removeTrait('bys-master-data-condition');
                        this.removeTrait('bys-master-data-sort');
                        break;
                }
            }
        }
    });

    editor.TraitManager.addType('bys-master-data-table', {
        onEvent({ elInput, component }) {
            // `elInput` is the result HTMLElement you get from `createInput`
            console.log(elInput);
            console.log(component);
            // const inputType = elInput.querySelector('.href-next__type');
            // let href = '';

            // switch (inputType.value) {
            //     case 'url':
            //         const valUrl = elInput.querySelector('.href-next__url').value;
            //         href = valUrl;
            //         break;
            //     case 'email':
            //         const valEmail = elInput.querySelector('.href-next__email').value;
            //         const valSubj = elInput.querySelector('.href-next__email-subject').value;
            //         href = `mailto:${valEmail}${valSubj ? `?subject=${valSubj}` : ''}`;
            //         break;
            // }

            // component.addAttributes({ href });
        },
        onUpdate({ elInput, component }) {
            console.log(elInput);
            console.log(component);
            const href = component.getAttributes().href || '';
            const inputType = elInput.querySelector('.href-next__type');
            let type = 'url';

            if (href.indexOf('mailto:') === 0) {
                const inputEmail = elInput.querySelector('.href-next__email');
                const inputSubject = elInput.querySelector('.href-next__email-subject');
                const mailTo = href.replace('mailto:', '').split('?');
                const email = mailTo[0];
                const params = (mailTo[1] || '').split('&').reduce((acc, item) => {
                    const items = item.split('=');
                    acc[items[0]] = items[1];
                    return acc;
                }, {});
                type = 'email';

                inputEmail.value = email || '';
                inputSubject.value = params.subject || '';
            } else {
                elInput.querySelector('.href-next__url').value = href;
            }

            inputType.value = type;
            inputType.dispatchEvent(new CustomEvent('change'));
        },

    });
})