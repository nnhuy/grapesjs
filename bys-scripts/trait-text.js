export default grapesjs.plugins.add('bys-trait-text', (editor, options) => {
    var textType = editor.DomComponents.getType("text");
    var _initialize = textType.model.prototype.initialize;
    textType.model.prototype.initialize = function () {
        _initialize.apply(this, arguments);
        this.removeTrait('id');
        this.get("traits").add({
            type: "select",
            label: "value",
            name: "bys-value",
            options: [ // Array of options
                { value: '', name: '' },
                { value: 'window.parent.CRM_Global_Information.getUserId()', name: 'GetUserId' },
                { value: 'window.parent.CRM_Global_Information.getWorkId()', name: 'GetWorkId' },
            ]
        });
        this.get("traits").add({
            type: "select",
            label: "Event",
            name: "bys-event",
            options: [ // Array of options
                { value: '', name: '' },
                { value: 'onload', name: 'onload' },
            ]
        });
    };
})