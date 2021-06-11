export default grapesjs.plugins.add('bys-command-custom-export-template', (editor, options) => {

    const commands = editor.Commands;
    commands.add('custom-export-template', {
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
            const bootstrapCssElement = document.createElement('link');
            bootstrapCssElement.href = `https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/css/bootstrap.min.css`;
            bootstrapCssElement.crossOrigin = `anonymous`;
            bootstrapCssElement.rel = `stylesheet`;
            bootstrapCssElement.integrity = `sha384-+0n0xVW2eSR5OomGNYDnhzAbDsOXxcvSN1TPprVMTNDbiYZCxYbOOl7+AMvyTG2x`;
            headElement.append(bootstrapCssElement);
            const bootstrapScriptElement = document.createElement('script');
            bootstrapScriptElement.src = `https://cdn.jsdelivr.net/npm/bootstrap@5.0.1/dist/js/bootstrap.bundle.min.js`;
            bootstrapScriptElement.integrity = `sha384-gtEjrD/SeCtmISkJkNUaaKMoLD0//ElJ19smozuHV6z3Iehds+3Ulb9Bn9Plx0x4`;
            bootstrapScriptElement.crossOrigin = `anonymous`;
            headElement.append(bootstrapScriptElement);
            const bodyElement = document.createElement('body');
            const allElement = document.createElement('div');
            allElement.innerHTML = editor.getHtml();
            const allElementHasOnLoad = allElement.querySelectorAll('[bys-event="onload"]') || [];
            const scriptTag = document.createElement('script');
            scriptTag.append('\n');
            scriptTag.append(`let sendEmailModal;\n
            function sendEmail() {
                const formSendEmail = document.getElementById('formSendEmail');
                const formSendEmailData = new FormData(formSendEmail);
                for (var pair of formSendEmailData.entries()) {
                    console.log(pair[0] + ', ' + pair[1]);
                }
                sendEmailModal.hide();
                formSendEmail.reset();
            }\n
            function openModalSendEmail() {
                sendEmailModal.show();
            }\n
            `);
            scriptTag.append("window.addEventListener('DOMContentLoaded', function() {\n");
            scriptTag.append(`sendEmailModal = new bootstrap.Modal(document.getElementById('sendEmailModal'), {});\n`);
            allElementHasOnLoad.forEach((e) => {
                const valueOnload = e.getAttribute('bys-value');
                if (valueOnload) {
                    if (e.tagName === 'DIV') {
                        const idOfTag = e.getAttribute('id');
                        let command = `var ${idOfTag}Value = ${valueOnload};\n`;
                        command += `document.getElementById('${idOfTag}').innerHtml = ${idOfTag}Value;\n`
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
                        let command = `var ${idOfTag}SendData = ${JSON.stringify(jsonObject)};\n`;
                        command += `var ${idOfTag}Value = window.parent.Call_API_GetMasterData(${idOfTag}SendData);\n`;
                        command += `if (${idOfTag}SendData.Result) {\n`;
                        command += `for(var i = 0; i < ${idOfTag}Value.Values.length; i++){\n`;
                        command += `var option = document.createElement("option");\n`
                        command += `option.text = ${idOfTag}Value.Values[i];\n`;
                        command += `option.value = ${idOfTag}Value.Values[i];\n`;
                        command += `document.getElementById(${idOfTag}).appendChild(option);\n`;
                        command += `};\n`;
                        command += `}\n`;
                        scriptTag.append(command);
                    }
                }
            });
            scriptTag.append('}\n);');
            headElement.append(scriptTag);
            htmlElement.append(headElement);
            bodyElement.append(allElement);
            const modalSendEmail = createModalSendEmail();
            bodyElement.append(modalSendEmail);
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
        modalSendEmail.innerHTML = `<div id="sendEmailModal" tabindex="-1" aria-labelledby="sendEmailModalLabel" aria-hidden="true" class="modal fade">
        <div class="modal-dialog">
            <form id="formSendEmail">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 id="sendEmailModalLabel" class="modal-title">Modal title
                        </h5>
                        <button type="button" data-bs-dismiss="modal" aria-label="Close" class="btn-close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-3">
                                mailsettingid
                            </div>
                            <div class="col-9">
                                <input class="form-control" name="mailsettingid">
                            </div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-3">
                                state
                            </div>
                            <div class="col-9">
                                <input class="form-control" name="state">
                            </div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-3">
                                linkid
                            </div>
                            <div class="col-9">
                                <input class="form-control" name="linkid">
                            </div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-3">
                                from
                            </div>
                            <div class="col-9">
                                <input class="form-control" name="from">
                            </div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-3">
                                to
                            </div>
                            <div class="col-9">
                                <input class="form-control" name="to">
                            </div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-3">
                                cc
                            </div>
                            <div class="col-9">
                                <input class="form-control" name="cc">
                            </div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-3">
                                bcc
                            </div>
                            <div class="col-9">
                                <input class="form-control" name="bcc">
                            </div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-3">
                                subject
                            </div>
                            <div class="col-9">
                                <input class="form-control" name="subject">
                            </div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-3">
                                body
                            </div>
                            <div class="col-9">
                                <textarea class="form-control" name="body"></textarea>
                            </div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-3">
                                attachfiles
                            </div>
                            <div class="col-9">
                                <input type="file" name="attachfiles">
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" data-bs-dismiss="modal" class="btn btn-secondary">Close</button>
                        <button onclick="sendEmail()" type="button" class="btn btn-primary">Send</button>
                    </div>
                </div>
            </form>
        </div>
    </div>`;
        return modalSendEmail;
    }
})