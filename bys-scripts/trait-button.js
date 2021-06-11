export default grapesjs.plugins.add('bys-trait-button', (editor, options) => {
    var textType = editor.DomComponents.getType("button");
    var _initialize = textType.model.prototype.initialize;
    textType.model.prototype.initialize = function () {
        _initialize.apply(this, arguments);

        this.get("traits").add({
            type: "select",
            label: "Click",
            name: "onclick",
            options: [ // Array of options
                { value: '', name: '' },
                { value: 'openModalSendEmail()', name: 'sendEmail' }
            ]
        });
        // this.get("traits").add({
        //     type: "select",
        //     label: "Event",
        //     name: "bys-event",
        //     options: [ // Array of options
        //         { value: '', name: '' },
        //         { value: 'onclick', name: 'onclick' },
        //     ]
        // });
    };
})