export default grapesjs.plugins.add('bys-trait-checkbox', (editor, options) => {
    var textType = editor.DomComponents.getType("checkbox");
    var _initialize = textType.model.prototype.initialize;
    textType.model.prototype.initialize = function () {
        _initialize.apply(this, arguments);
        this.removeTrait('id');
    };
})