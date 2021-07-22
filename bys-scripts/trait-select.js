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
                            { value: 'systemEvent_onLoad', name: 'systemEvent_onLoad' },
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
                console.log('change');
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
                                    { value: 'table1', name: 'table1' },
                                    { value: 'table2', name: 'table2' },
                                    { value: 'table3', name: 'table3' },
                                    { value: 'tjg商品マスタ', name: 'tjg商品マスタ' }
                                ],
                                changeProp: 1,
                            });
                            this.addTrait({
                                type: 'select', // Type of the trait
                                label: 'Column', // The label you will see in Settings
                                name: 'bys-master-data-column', // The name of the attribute/property to use on component
                                options: []
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
                            this.listenTo(this, 'change:bys-master-data-table', this.masterDataTableChange);
                        }
                        break;
                    default:
                        this.removeTrait('bys-master-data-table');
                        this.removeTrait('bys-master-data-column');
                        this.removeTrait('bys-master-data-condition');
                        this.removeTrait('bys-master-data-sort');
                        break;
                }
            },
            masterDataTableChange() {
                const masterDataTableValue = this.getTrait('bys-master-data-table').props().value;
                this.attributes.attributes['bys-master-data-table'] = masterDataTableValue;
                const component = editor.getSelected();
                switch (masterDataTableValue) {
                    case 'table1':
                        this.getTrait('bys-master-data-column').set('options', [
                            { id: 'spkid', name: 'spkid' },
                            { id: 'col1', name: 'col1' },
                            { id: 'col2', name: 'col2' },
                            { id: 'col3', name: 'col3' },
                        ]);
                        break;
                    case 'table2':
                        this.getTrait('bys-master-data-column').set('options', [
                            { id: 'spkid', name: 'spkid' },
                            { id: 'code', name: 'code' },
                            { id: 'result', name: 'result' },
                            { id: 'flag', name: 'flag' },
                        ]);
                        break;
                    case 'table3':
                        this.getTrait('bys-master-data-column').set('options', [
                            { id: 'spkid', name: 'spkid' },
                            { id: 'category', name: 'category' },
                            { id: 'itemnum', name: 'itemnum' },
                            { id: 'itemname', name: 'itemname' },
                            { id: 'price', name: 'price' },
                            { id: 'discount', name: 'discount' },
                            { id: 'tax', name: 'tax' },
                            { id: 'total', name: 'total' },
                            { id: 'shipcost', name: 'shipcost' },
                            { id: 'flag', name: 'flag' },
                        ]);
                        break;
                    case 'tjg商品マスタ':
                        this.getTrait('bys-master-data-column').set('options', [
                            { id: 'spkid', name: 'spkid' },
                            { id: '会社コード', name: '会社コード' },
                            { id: '区分', name: '区分' },
                            { id: '商品番号', name: '商品番号' },
                            { id: '商品名', name: '商品名' },
                            { id: '単価', name: '単価' },
                            { id: '割引', name: '割引' },
                            { id: '税', name: '税' },
                            { id: '商品合計（税込）', name: '商品合計（税込）' },
                            { id: 'お届け間隔', name: 'お届け間隔' },
                            { id: 'プレゼント有無フラグ', name: 'プレゼント有無フラグ' }
                        ]);
                        break;
                    default:
                        this.getTrait('bys-master-data-column').set('options', []);
                        break;
                }

            }
        }
    });

})