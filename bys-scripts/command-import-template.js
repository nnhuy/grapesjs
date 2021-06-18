export default grapesjs.plugins.add('bys-command-custom-import-template', (editor, options) => {

    const commands = editor.Commands;
    let codeViewer = editor && editor.CodeManager.getViewer('CodeMirror').clone();
    let btnImp = document.createElement("button");
    let container = document.createElement("div");
    let pfx = 'gjs-';
    // Init import button
    btnImp.innerHTML = 'Import';
    btnImp.className = pfx + 'btn-prim ' + pfx + 'btn-import';
    btnImp.onclick = () => {
        let code = codeViewer.editor.getValue();
        editor.DomComponents.getWrapper().set('content', '');
        editor.setComponents(code);
        editor.Modal.close();
    };
    // Init code viewer
    codeViewer.set({
        codeName: 'htmlmixed',
        theme: 'hopscotch',
        readOnly: 0
    });
    commands.add('custom-import-template', {
        run(editor, sender) {
            let md = editor.Modal;
            let viewer = codeViewer.editor;
            md.setTitle('Import template');
            // Init code viewer if not yet instantiated
            if (!viewer) {
                let txtarea = document.createElement('textarea');
                let labelEl = document.createElement('div');
                labelEl.className = pfx + 'import-label';
                labelEl.innerHTML = 'Paste all your code here below and click import';
                container.appendChild(labelEl);
                container.appendChild(txtarea);
                container.appendChild(btnImp);
                codeViewer.init(txtarea);
                viewer = codeViewer.editor;
            }
            md.setContent('');
            md.setContent(container);
            codeViewer.setContent('');
            md.open();
            viewer.refresh();
            sender && sender.set('active', 0);
        },
    });
})