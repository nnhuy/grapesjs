export default grapesjs.plugins.add('bys-command-custom-export-template-promise', (editor, options) => {

    const commands = editor.Commands;
    commands.add('custom-export-template-promise', {
        run(editor, sender, opts = {}) {
            sender && sender.set && sender.set('active', 0);
            const config = editor.getConfig();
            const modal = editor.Modal;
            const pfx = config.stylePrefix;
            this.cm = editor.CodeManager || null;

            if (!this.$editors) {
                const oHtmlEd = this.buildEditor('htmlmixed', 'hopscotch', 'HTML');
                const oCsslEd = this.buildEditor('css', 'hopscotch', 'CSS');
                this.htmlEditor = oHtmlEd.el;
                this.cssEditor = oCsslEd.el;
                const $editors = $(`<div class="${pfx}export-dl"></div>`);
                $editors.append(oHtmlEd.$el).append(oCsslEd.$el);
                this.$editors = $editors;
            }

            modal
                .open({
                    title: config.textViewCode,
                    content: this.$editors
                })
                .getModel()
                .once('change:open', () => editor.stopCommand(this.id));
            const htmlElement = document.createElement('html');
            const headElement = document.createElement('head');
            const defaultStyle = createDefaultStyle();
            headElement.append(defaultStyle);
            const bodyElement = document.createElement('body');
            const allElement = document.createElement('div');
            allElement.innerHTML = editor.getHtml();
            const allElementHasOnLoad = allElement.querySelectorAll('[bys-event="onload"]') || [];
            const scriptTag = document.createElement('script');
            scriptTag.append('\n');
            scriptTag.append("window.addEventListener('DOMContentLoaded', function() {\n");
            /* build onload script with all div and select has value */
            allElementHasOnLoad.forEach((e) => {
                const valueOnload = e.getAttribute('bys-value');
                if (valueOnload) {
                    if (e.tagName === 'DIV') {
                        const idOfTag = e.getAttribute('id');
                        let command = `var ${idOfTag}Value = ${valueOnload};\n`;
                        command += `${idOfTag}Value.then(value => document.getElementById('${idOfTag}').innerHtml = value);\n`
                        scriptTag.append(command);
                    } else if (e.tagName === 'SELECT') {
                        // create json object
                        const tableNameValue = e.getAttribute('bys-master-data-table');
                        const columnNameValue = e.getAttribute('bys-master-data-column');
                        const whereValue = e.getAttribute('bys-master-data-condition');
                        const orderValue = e.getAttribute('bys-master-data-sort');
                        const jsonObject = {
                            TableName: tableNameValue,
                            Columns: columnNameValue,
                            Where: whereValue,
                            Order: orderValue
                        };
                        const idOfTag = e.getAttribute('id');
                        let command = `var ${idOfTag}SendData = ${JSON.stringify(jsonObject)};
                        var ${idOfTag}Value = window.parent.Call_API_GetMasterData(${idOfTag}SendData);
                        ${idOfTag}Value.then(value => {
                            if (value.Result) {
                                for(var i = 0; i < value.Values.length; i++){
                                    var option = document.createElement("option");
                                    option.text = value.Values[i];
                                    option.value = value.Values[i];
                                    document.getElementById('${idOfTag}').appendChild(option);
                                };
                            }
                        });\n`;
                        scriptTag.append(command);
                    }
                }
            });
            scriptTag.append('}\n);');
            headElement.append(scriptTag);
            /* build send email modal with button has click event */
            const hasSendEmail = allElement.querySelectorAll('button[onclick="openModalSendEmail()"]') || [];
            if (hasSendEmail.length) {
                const scriptSendEmail = createSendEmailModalScript();
                const styleSendEmail = createSendEmailModalStyle();
                const modalSendEmail = createModalSendEmail();
                headElement.append(scriptSendEmail);
                headElement.append(styleSendEmail);
                bodyElement.append(modalSendEmail);
            }
            htmlElement.append(headElement);
            bodyElement.append(allElement);
            htmlElement.append(bodyElement);

            this.htmlEditor.setContent(htmlElement.outerHTML);
            this.cssEditor.setContent(editor.getCss());
        },

        stop(editor) {
            const modal = editor.Modal;
            modal && modal.close();
        },

        buildEditor(codeName, theme, label) {
            const input = document.createElement('textarea');
            !this.codeMirror && (this.codeMirror = this.cm.getViewer('CodeMirror'));

            const el = this.codeMirror.clone().set({
                label,
                codeName,
                theme,
                input
            });

            const $el = new this.cm.EditorView({
                model: el,
                config: this.cm.getConfig()
            }).render().$el;

            el.init(input);

            return { el, $el };
        }
    });

    // commands.add('custom-test', {
    //     run(editor, sender, opts = {}) {
    //         console.log('custom test');

    //     },

    //     stop(editor) {
    //         const modal = editor.Modal;
    //         modal && modal.close();
    //     },
    // });

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
                            <input class="form-control" name="mailsettingid">
                        </div>
                    </div>
                    <div class="d-flex mt-2">
                        <div class="w-25">
                            state
                        </div>
                        <div class="w-75">
                            <input class="form-control" name="state">
                        </div>
                    </div>
                    <div class="d-flex mt-2">
                        <div class="w-25">
                            linkid
                        </div>
                        <div class="w-75">
                            <input class="form-control" name="linkid">
                        </div>
                    </div>
                    <div class="d-flex mt-2">
                        <div class="w-25">
                            from
                        </div>
                        <div class="w-75">
                            <input class="form-control" name="from">
                        </div>
                    </div>
                    <div class="d-flex mt-2">
                        <div class="w-25">
                            to
                        </div>
                        <div class="w-75">
                            <input class="form-control" name="to">
                        </div>
                    </div>
                    <div class="d-flex mt-2">
                        <div class="w-25">
                            cc
                        </div>
                        <div class="w-75">
                            <input class="form-control" name="cc">
                        </div>
                    </div>
                    <div class="d-flex mt-2">
                        <div class="w-25">
                            bcc
                        </div>
                        <div class="w-75">
                            <input class="form-control" name="bcc">
                        </div>
                    </div>
                    <div class="d-flex mt-2">
                        <div class="w-25">
                            subject
                        </div>
                        <div class="w-75">
                            <input class="form-control" name="subject">
                        </div>
                    </div>
                    <div class="d-flex mt-2">
                        <div class="w-25">
                            body
                        </div>
                        <div class="w-75">
                            <textarea rows="4" class="form-control" name="body"></textarea>
                        </div>
                    </div>
                    <div class="d-flex mt-2">
                        <div class="w-25">
                            attachfiles
                        </div>
                        <div class="w-75">
                            <input type="file" name="attachfiles">
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
        const styleElement = document.createElement('style');
        styleElement.append(`
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
        }`);
        return styleElement;
    }

    function createSendEmailModalStyle() {
        const styleElement = document.createElement('style');
        styleElement.append(`
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
        }`);
        return styleElement;
    }

    function createSendEmailModalScript() {
        const scriptElement = document.createElement('script');
        scriptElement.append(`var modalSendEmail;
        window.addEventListener('DOMContentLoaded', function () {
            modalSendEmail = document.getElementById("sendEmailModal");
            window.onclick = function (event) {
                if (event.target == modalSendEmail) {
                    closeModalSendEmail();
                }
            }
        });
        function closeModalSendEmail() {
            modalSendEmail.style.display = "none";
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
            window.parent.Call_API_SendMail(formSendEmailData);
            closeModalSendEmail();
            formSendEmail.reset();
        }`);
        return scriptElement;
    }
})