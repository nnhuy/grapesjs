import traitSelect from './trait-select.js';
import traitText from './trait-text.js';
import traitButton from './trait-button.js';
import commandExportTemplate from './command-export-template.js';
import commandExportTemplatePromise from './command-export-template-promise.js';
import exportZip from './export-zip.js';
import exportZipPromise from './export-zip-promise.js';

var editor = grapesjs.init({
    showOffsets: 1,
    noticeOnUnload: 0,
    container: '#gjs',
    height: '100%',
    fromElement: true,
    storageManager: { autoload: 0 },
    selectorManager: { componentFirst: true },
    plugins: [
        'gjs-blocks-basic',
        'grapesjs-plugin-forms',
        // 'grapesjs-plugin-export',
        traitSelect,
        traitText,
        traitButton,
        commandExportTemplate,
        commandExportTemplatePromise,
        exportZip,
        exportZipPromise
    ],
    styleManager: {
        clearProperties: 1,
        sectors: [{
            name: 'General',
            open: false,
            buildProps: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom']
        }, {
            name: 'Flex',
            open: false,
            buildProps: ['flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'align-content', 'order', 'flex-basis', 'flex-grow', 'flex-shrink', 'align-self']
        }, {
            name: 'Dimension',
            open: false,
            buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
        }, {
            name: 'Typography',
            open: false,
            buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-shadow'],
        }, {
            name: 'Decorations',
            open: false,
            buildProps: ['border-radius-c', 'background-color', 'border-radius', 'border', 'box-shadow', 'background'],
        }, {
            name: 'Extra',
            open: false,
            buildProps: ['transition', 'perspective', 'transform'],
        }
        ],
    },
    assetManager: {
        assets: [],
        noAssets: '',
        stylePrefix: 'am-',
        upload: 0,
        uploadName: 'files',
        headers: {},
        params: {},
        credentials: 'include',
        multiUpload: true,
        autoAdd: 1,
        customFetch: '',
        // uploadFile: (e) => {
        //     const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
        //     // TODO: upload image here
        //     for (let i = 0; i < files.length; i++) {
        //         console.log(files[i]);
        //         editor. AssetManager.add('http://placehold.it/350x250/459ba8/fff/image2.jpg');
        //     }
        // },
        embedAsBase64: 1,
        handleAdd: '',
        dropzone: 0,
        openAssetsOnDrop: 1,
        dropzoneContent: '',
        beforeUpload: null,
        showUrlInput: true
    }
});

const panelManager = editor.Panels;
panelManager.removeButton('options', 'export-template');
panelManager.addButton('options', {
    id: 'bys-export-template',
    className: 'fa fa-code',
    command: 'custom-export-template',
    attributes: { title: 'Custom view code' },
    active: false,
});
panelManager.addButton('options', {
    id: 'bys-export-template-promise',
    className: 'fa fa-code',
    command: 'custom-export-template-promise',
    attributes: { title: 'Custom view code' },
    active: false,
});
// panelManager.addButton('options', {
//     id: 'bys-export-zip',
//     className: 'fa fa-file-archive-o',
//     command: 'bys-export-zip',
//     attributes: { title: 'Export Zip' },
//     active: false,
// });
// panelManager.addButton('options', {
//     id: 'bys-export-zip-promise',
//     className: 'fa fa-file-archive-o',
//     command: 'bys-export-zip-promise',
//     attributes: { title: 'Export Zip' },
//     active: false,
// });
