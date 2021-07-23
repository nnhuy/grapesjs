export default (editor, opts = {}) => {
    let pfx = editor.getConfig('stylePrefix');
    let btnExp = document.createElement('button');
    let commandName = 'bys-export-zip-promise';

    let config = {
        addExportBtn: 1,
        btnLabel: 'Export to ZIP',
        filenamePfx: 'CRM-PageEditor',
        filename: null,
        root: {
            'style.css': ed => generateCss(ed),
            'script.js': ed => generageScript(ed),
            'index.html': ed =>
                generateHtml(),
        },
        isBinary: null,
        ...opts,
    };

    btnExp.innerHTML = config.btnLabel;
    btnExp.className = `${pfx}btn-prim`;

    // Add command
    editor.Commands.add(commandName, {
        createFile(zip, name, content) {
            const opts = {};
            const ext = name.split('.')[1];
            const isBinary = config.isBinary ?
                config.isBinary(content, name) :
                !(ext && ['html', 'css'].indexOf(ext) >= 0) &&
                !/^[\x00-\x7F]*$/.test(content);

            if (isBinary) {
                opts.binary = true;
            }

            editor.log(['Create file', { name, content, opts }],
                { ns: 'plugin-export' });

            zip.file(name, content, opts);
        },

        async createDirectory(zip, root) {
            root = typeof root === 'function' ? await root(editor) : root;

            for (const name in root) {
                if (root.hasOwnProperty(name)) {
                    let content = root[name];
                    content = typeof content === 'function' ? await content(editor) : content;
                    const typeOf = typeof content;

                    if (typeOf === 'string') {
                        this.createFile(zip, name, content);
                    } else if (typeOf === 'object') {
                        const dirRoot = zip.folder(name);
                        await this.createDirectory(dirRoot, content);
                    }
                }
            }
        },

        run(editor) {
            const zip = new JSZip();
            this.createDirectory(zip, config.root).then(() => {
                zip.generateAsync({ type: 'blob' })
                // zip.generateAsync({ type: 'blob', encodeFileName: 'UTF-8' })
                    .then(content => {
                        const filenameFn = config.filename;
                        let filename = filenameFn ?
                            filenameFn(editor) : `${config.filenamePfx}_${Date.now()}.zip`;
                        saveAs(content, filename);
                    });
            });
        }
    });

    // Add button inside export dialog
    if (config.addExportBtn) {
        editor.on('run:custom-export-template-promise', () => {
            editor.Modal.getContentEl().appendChild(btnExp);
            btnExp.onclick = () => {
                editor.runCommand(commandName);
            };
        });
    }

    function generateCss(editor) {
        let result = '';
        result += createDefaultStyle();
        result += createSendEmailModalStyle();
        result += editor.getCss();
        return result;
    }

    function generageScript(editor) {
        const allElement = document.createElement('div');
        allElement.innerHTML = editor.getHtml();
        const allElementHasOnLoad = allElement.querySelectorAll('[bys-event="systemEvent_onLoad"]') || [];
        let result = `const systemEventOnLoad = async () => {\n`;
        /* build onload script with all div and select has value */
        allElementHasOnLoad.forEach((e) => {
            const valueOnload = e.getAttribute('bys-value');
            if (valueOnload) {
                if (e.tagName === 'DIV') {
                    const idOfTag = e.getAttribute('id');
                    let command = `document.getElementById('${idOfTag}').innerHTML = ${valueOnload};\n`;
                    result += command;
                    result += '\n';
                } else if (e.tagName === 'SELECT') {
                    // create json object
                    const tableNameValue = e.getAttribute('bys-master-data-table');
                    const columnNameValue = e.getAttribute('bys-master-data-column');
                    const whereValue = e.getAttribute('bys-master-data-condition');
                    const orderValue = e.getAttribute('bys-master-data-sort');
                    const jsonObject = {
                        TableName: tableNameValue,
                        Columns: `spkid,${columnNameValue}`,
                        Where: whereValue,
                        Order: orderValue
                    };
                    const idOfTag = e.getAttribute('id');
                    let command = `const ${idOfTag}SendData = ${JSON.stringify(jsonObject)};
                    const ${idOfTag}Value = window.parent.Call_API_GetMasterData(${idOfTag}SendData);
                    if (${idOfTag}Value.Result) {
                        const ${idOfTag}Select = document.getElementById('${idOfTag}');
                        if (${idOfTag}Select.options.length) {
                            while (${idOfTag}Select.options.length) {
                                ${idOfTag}Select.remove(0);
                            }
                        }

                        for(let i = 0; i < ${idOfTag}Value.Values.length; i++){
                            const option = document.createElement("option");
                            option.value = ${idOfTag}Value.Values[i][0];
                            option.text = ${idOfTag}Value.Values[i][1];
                            ${idOfTag}Select.appendChild(option);
                        };
                    };\n`;
                    result += command;
                    result += '\n';
                }
            }
        });
        result += `}

        function systemEvent_onLoad() {
            return systemEventOnLoad();
        }
        \n`;
        /* build send email modal with button has click event */
        const hasSendEmail = allElement.querySelectorAll('button[onclick="openModalSendEmail()"]') || [];
        if (hasSendEmail.length) {
            result += createSendEmailModalScript();
        }
        /* build call incoming function */
        const allElementHasCallIncomingEvent = allElement.querySelectorAll('div[bys-event="onCallIncoming"]') || [];
        let commandCallIncoming = '';
        if (allElementHasCallIncomingEvent.length) {
            allElementHasCallIncomingEvent.forEach(e => {
                const idOfTag = e.getAttribute('id');
                commandCallIncoming += `
                document.getElementById('${idOfTag}').innerHtml = 'onCall_Incoming: callerNumber: ' + callerNumber + ', receivedNumber: ' + ReceivedNumber + ', callId: ' + callid;\n
                `;
            });
        }
        result += `
        function systemEvent_onCall_Incoming(callerNumber, ReceivedNumber, callid){
            ${commandCallIncoming}
        };
        `;
        const scriptFromImport = localStorage.getItem('js-import');
        if (scriptFromImport) {
            result += `\n${scriptFromImport}\n`;
        }
        return result;
    }

    function generateHtml() {
        const htmlElement = document.createElement('html');
        const headElement = document.createElement('head');
        const linkCss = document.createElement('link');
        linkCss.rel = 'stylesheet';
        linkCss.href = './style.css';
        headElement.append(linkCss);
        const linkScript = document.createElement('script');
        linkScript.src = './script.js';
        const bodyElement = document.createElement('body');
        const allElement = document.createElement('div');
        allElement.innerHTML = editor.getHtml();
        /* build send email modal with button has click event */
        const hasSendEmail = allElement.querySelectorAll('button[onclick="openModalSendEmail()"]') || [];
        if (hasSendEmail.length) {
            const modalSendEmail = createModalSendEmail();
            bodyElement.append(modalSendEmail);
        }
        htmlElement.append(headElement);
        bodyElement.append(allElement);
        bodyElement.append(linkScript);
        htmlElement.append(bodyElement);
        return htmlElement.outerHTML;
    }

    function createModalSendEmail() {
        const modalSendEmail = document.createElement('div');
        modalSendEmail.innerHTML = `<div id="sendEmailModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <span class="close" onclick="closeModalSendEmail()">&times;</span>
            <p class="text-center">Send Email</p>
        </div>
        <div class="modal-body">
            <form id="formSendEmail">
                <div class="d-flex mt-2">
                    <div class="w-25">
                        mailsettingid
                    </div>
                    <div class="w-75">
                        <input class="form-control" pattern="[0-9]+" name="mailsettingid" placeholder="使用するメールセッティングＩＤ">
                    </div>
                </div>
                <div class="d-flex mt-2">
                    <div class="w-25">
                        state
                    </div>
                    <div class="w-75">
                        <input class="form-control" pattern="[0-1]{1}" name="state" placeholder="0：送信しないでＤＢのみ登録, 1：以上はそのまま送信する">
                    </div>
                </div>
                <div class="d-flex mt-2">
                    <div class="w-25">
                        linkid
                    </div>
                    <div class="w-75">
                        <input class="form-control" pattern="[0-9]+" name="linkid" placeholder="DB紐づけなどに使用出来る任意数値設定。spkidなどをいれてリレーション時などに使用する">
                    </div>
                </div>
                <div class="d-flex mt-2">
                    <div class="w-25">
                        from
                    </div>
                    <div class="w-75">
                        <input class="form-control" pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$" name="from" placeholder="送信者の情報 構文：名前<aaa@bbb.co.jp>">
                    </div>
                </div>
                <div class="d-flex mt-2">
                    <div class="w-25">
                        to
                    </div>
                    <div class="w-75">
                        <input class="form-control" pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$" name="to" placeholder="to。複数はカンマ区切り。構文はfrom同様">
                    </div>
                </div>
                <div class="d-flex mt-2">
                    <div class="w-25">
                        cc
                    </div>
                    <div class="w-75">
                        <input class="form-control" pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$" name="cc" placeholder="cc。複数はカンマ区切り。構文はfrom同様">
                    </div>
                </div>
                <div class="d-flex mt-2">
                    <div class="w-25">
                        bcc
                    </div>
                    <div class="w-75">
                        <input class="form-control" pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$" name="bcc" placeholder="bcc。複数はカンマ区切り。構文はfrom同様">
                    </div>
                </div>
                <div class="d-flex mt-2">
                    <div class="w-25">
                        subject
                    </div>
                    <div class="w-75">
                        <input class="form-control" name="subject" placeholder="件名">
                    </div>
                </div>
                <div class="d-flex mt-2">
                    <div class="w-25">
                        body
                    </div>
                    <div class="w-75">
                        <textarea rows="4" class="form-control" name="body" placeholder="本文"></textarea>
                    </div>
                </div>
                <div class="d-flex mt-2">
                    <div class="w-25">
                        attachfiles
                    </div>
                    <div class="w-75">
                        <input id="send-email-file" type="file" name="attachfiles">
                    </div>
                </div>
                <div class="d-flex justify-content-center mt-2">
                    <button type="button" onclick="closeModalSendEmail()">Close</button>
                    <button type="button" class="ms-2" onclick="sendEmail()">Send</button>
                </div>
            </form>
        </div>
    </div>
</div>`;
        return modalSendEmail;
    }

    function createDefaultStyle() {
        const styleElement = `
        /* Global style */
        .d-flex {
            display: flex;
        }
    
        .w-25 {
            width: 25%;
        }
    
        .w-50 {
            width: 50%;
        }
    
        .w-75 {
            width: 75%;
        }
    
        .w-100 {
            width: 100%;
        }
    
        .form-control {
            width: 100%;
            border: 1px solid gray;
            border-radius: 0.25rem;
            height: 2rem;
            padding: 0.5rem;
        }
    
        .mt-2 {
            margin-top: 0.5rem;
        }
    
        .justify-content-center {
            justify-content: center;
        }
    
        .ms-2 {
            margin-left: 0.5rem;
        }
    
        .text-center {
            text-align: center;
        }\n`;
        return styleElement;
    }

    function createSendEmailModalStyle() {
        const styleElement = `
        /* The Modal (background) */
        .modal {
            display: none;
            position: fixed;
            z-index: 1;
            padding-top: 100px;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgb(0, 0, 0);
            background-color: rgba(0, 0, 0, 0.4);
        }
    
        /* Modal Content */
        .modal-content {
            position: relative;
            background-color: #fefefe;
            margin: auto;
            padding: 0;
            width: 40%;
            box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
            -webkit-animation-name: animatetop;
            -webkit-animation-duration: 0.4s;
            animation-name: animatetop;
            animation-duration: 0.4s
        }
    
        /* Add Animation */
        @-webkit-keyframes animatetop {
            from {
                top: -300px;
                opacity: 0
            }
    
            to {
                top: 0;
                opacity: 1
            }
        }
    
        @keyframes animatetop {
            from {
                top: -300px;
                opacity: 0
            }
    
            to {
                top: 0;
                opacity: 1
            }
        }
    
        /* The Close Button */
        .close {
            float: right;
            font-size: 28px;
            font-weight: bold;
            position: absolute;
            right: 1rem;
            top: 0.5rem;
        }
    
        .close:hover,
        .close:focus {
            color: #000;
            text-decoration: none;
            cursor: pointer;
        }
    
        .modal-header {
            padding: 1rem;
            border-bottom: 1px solid lightgray;
        }
    
        .modal-header p {
            margin: 0;
        }
    
        .modal-body {
            padding: 2px 16px;
        }
        
        input:invalid {
            border-color: red;
        }\n
        `;
        return styleElement;
    }

    function createSendEmailModalScript() {
        const scriptElement = `
        var modalSendEmail;
        window.addEventListener('DOMContentLoaded', function () {
            modalSendEmail = document.getElementById("sendEmailModal");
            window.onclick = function (event) {
                if (event.target == modalSendEmail) {
                    closeModalSendEmail();
                }
            }
            document.getElementById('send-email-file').addEventListener('change', validateFileSize, false);
        });

        function validateFileSize(event) {
            const file = event.target.files[0];
            /* if file size is more than 25mb, alert and remove it */
            if (file.size > 1024 * 25) {
                alert('Please choo file less than 25MB');
                event.target.value = null;
            }
        }

        function closeModalSendEmail() {
            modalSendEmail.style.display = "none";
            const formSendEmail = document.getElementById('formSendEmail');
            formSendEmail.reset();
        }

        function openModalSendEmail() {
            modalSendEmail.style.display = "block";
        }

        function sendEmail() {
            const formSendEmail = document.getElementById('formSendEmail');
            const formSendEmailData = new FormData(formSendEmail);
            for (var pair of formSendEmailData.entries()) {
                console.log(pair[0] + ', ' + pair[1]);
            }
            if (formSendEmail.checkValidity()) {
                closeModalSendEmail();
                formSendEmail.reset();
                window.parent.Call_API_SendMail(
                    formSendEmailData.get('mailsettingid'),
                    formSendEmailData.get('state'),
                    formSendEmailData.get('linkid'),
                    formSendEmailData.get('from'),
                    formSendEmailData.get('to'),
                    formSendEmailData.get('cc'),
                    formSendEmailData.get('bcc'),
                    formSendEmailData.get('subject'),
                    formSendEmailData.get('body'),
                    formSendEmailData.get('attachfiles')
                );
            }
        }\n`;
        return scriptElement;
    }
};