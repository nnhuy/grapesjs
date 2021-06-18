export default grapesjs.plugins.add('bys-command-custom-redo', (editor, options) => {
    const commands = editor.Commands;
    commands.add('custom-redo', {
        run(editor, sender) {
            sender.set('active', 0);
            editor.UndoManager.redo(1);
        },
    });
})