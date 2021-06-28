import traitSelect from './trait-select.js';
import traitText from './trait-text.js';
import traitButton from './trait-button.js';
import traitCheckbox from './trait-checkbox.js';
import commandExportTemplate from './command-export-template.js';
import commandExportTemplatePromise from './command-export-template-promise.js';
import commandImportTemplate from './command-import-template.js';
import commandUndo from './command-undo.js';
import commandRedo from './command-redo.js';
import exportZip from './export-zip.js';
import exportZipPromise from './export-zip-promise.js';
import importFileZip from './command-import-file-zip.js';

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
        traitCheckbox,
        commandExportTemplate,
        commandExportTemplatePromise,
        commandImportTemplate,
        commandUndo,
        commandRedo,
        exportZip,
        exportZipPromise,
        importFileZip
    ],
    pluginsOpts: {

    },
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
    id: 'bys-undo',
    className: 'fa fa-undo',
    command: 'custom-undo',
    attributes: { title: 'Undo' },
    active: false,
});
panelManager.addButton('options', {
    id: 'bys-redo',
    className: 'fa fa-repeat',
    command: 'custom-redo',
    attributes: { title: 'Redo' },
    active: false,
});
panelManager.addButton('options', {
    id: 'bys-import-template',
    className: 'fa fa-download',
    command: 'custom-import-template',
    attributes: { title: 'Import' },
    active: false,
});
// panelManager.addButton('options', {
//     id: 'bys-export-template',
//     className: 'fa fa-code',
//     command: 'custom-export-template',
//     attributes: { title: 'Custom view code' },
//     active: false,
// });
panelManager.addButton('options', {
    id: 'bys-export-template-promise',
    className: 'fa fa-code',
    command: 'bys-export-zip-promise',
    attributes: { title: 'Download' },
    active: false,
});
panelManager.addButton('options', {
    id: 'bys-import-file-zip',
    className: 'fa fa-file-archive-o',
    command: 'custom-import-file-zip',
    attributes: { title: 'Import file zip' },
    active: false,
});
const pageTitle = document.createElement('div');
pageTitle.innerHTML = 'CRM PageEditor';
pageTitle.classList.add('page-title');
panelManager.getPanelsEl().getElementsByClassName("gjs-pn-devices-c")[0].prepend(pageTitle);

var blockManager = editor.BlockManager;
blockManager.add('blank-form', {
  label: 'Blank Form',
  media: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22 5.5c0-.3-.5-.5-1.3-.5H3.4c-.8 0-1.3.2-1.3.5v3c0 .3.5.5 1.3.5h17.4c.8 0 1.3-.2 1.3-.5v-3zM21 8H3V6h18v2zM22 10.5c0-.3-.5-.5-1.3-.5H3.4c-.8 0-1.3.2-1.3.5v3c0 .3.5.5 1.3.5h17.4c.8 0 1.3-.2 1.3-.5v-3zM21 13H3v-2h18v2z"/><rect width="10" height="3" x="2" y="15" rx=".5"/></svg>',
  content: {
    type: 'form',
    components: [
        {
            // content: `<div data-gjs-type="default" draggable="true" data-highlightable="1" class="gjs-row" id="ixop"><div data-gjs-type="default" draggable="true" data-highlightable="1" class="gjs-cell" id="i5oz"></div></div>`
            // components: [
            //     { type: 'input' },
            //   ]
        }
    ]
  },
  category: { id: 'forms', label: 'Forms' },
});