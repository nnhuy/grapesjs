export default grapesjs.plugins.add('bys-command-custom-undo', (editor, options) => {
    const commands = editor.Commands;
    commands.add('custom-undo', {
        run(editor, sender) {
            sender.set('active', 0);
            editor.UndoManager.undo(1);
        },
    });
})