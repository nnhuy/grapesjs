export default grapesjs.plugins.add('bys-command-custom-import-file-zip', (editor, options) => {
    const zip = new JSZip();
    const commands = editor.Commands;
    const btnImportZip = document.getElementById('upload-file-zip');
    btnImportZip.addEventListener('change', (e) => {
        const fileInput = e.target.files[0];
        zip.loadAsync(fileInput).then(files => {
            files.forEach(function (relativePath, zipEntry) {  // 2) print entries
                console.log(zipEntry);
                console.log(relativePath);
                zip.file(relativePath).async("string").then(function (data) {
                    const fileType = relativePath.split('.')[1];
                    switch (fileType) {
                        case 'html':
                            editor.setComponents(data);
                            break;
                        case 'css':
                            editor.setStyle(data);
                            break;
                        case 'js':
                            localStorage.setItem('js-import', data);
                            break;
                        default:
                            break;
                    }
                });
            });
        })
    })
    commands.add('custom-import-file-zip', {
        run(editor, sender) {
            btnImportZip.click();
            sender && sender.set('active', 0);
        },
    });
})