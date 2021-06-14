export default (editor, opts = {}) => {
  let pfx = editor.getConfig('stylePrefix');
  let btnExp = document.createElement('button');
  let commandName = 'bys-export-zip';

  let config = {
    addExportBtn: 1,
    btnLabel: 'Export to ZIP',
    filenamePfx: 'grapesjs_template',
    filename: null,
    root: {
      css: {
        'style.css': ed => ed.getCss(),
      },
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
    editor.on('run:custom-export-template', () => {
      editor.Modal.getContentEl().appendChild(btnExp);
      btnExp.onclick = () => {
        editor.runCommand(commandName);
      };
    });
  }

  function generateHtml() {
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
          let command = `var ${idOfTag}SendData = ${JSON.stringify(jsonObject)};
                        var ${idOfTag}Value = window.parent.Call_API_GetMasterData(${idOfTag}SendData);
                        if (${idOfTag}Value.Result) {
                          for(var i = 0; i < ${idOfTag}Value.Values.length; i++){
                            var option = document.createElement("option");
                            option.text = ${idOfTag}Value.Values[i];
                            option.value = ${idOfTag}Value.Values[i];
                            document.getElementById('${idOfTag}').appendChild(option);
                          };
                        }\n`;
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
};