import traitSelect from './trait-select.js';
import traitText from './trait-text.js';
import traitButton from './trait-button.js';
import commandExportTemplate from './command-export-template.js';



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
        traitSelect,
        traitText,
        traitButton,
        commandExportTemplate
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