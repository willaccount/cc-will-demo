// panel/index.js, this filename needs to match the one registered in package.json
Editor.Panel.extend({
    // css style for panel
    style: `
    :host{
        background-color: pink;
        font-family: Arial, Helvetica, sans-serif;
        color: black;
        padding-left: 20px;
    }
    .container {
        display: flex;
        width: 400px;
        flex-direction: column;
        border-radius: 5px;
        background-color: #f2f2f2;
        padding: 20px;
    }
    
    body {
        background-color: pink;
        font-family: Arial, Helvetica, sans-serif;
    }

    label {
        font-size: 20px;
    }
    
    input[type=text] {
        width: 100%;
        height: 30px;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
        resize: vertical;
        margin-bottom: 20px;
        margin-top: 5px;
        font-size: 16px;
    }
    
    ui-button {
        display:inline-block;
        padding:0.46em 1.6em;
        border:0.1em solid #000000;
        margin: 0 0.2em 0.2em 0;
        border-radius:0.12em;
        box-sizing: border-box;
        text-decoration:none;
        font-family:'Roboto',sans-serif;
        color:#000000;
        text-shadow: 0 0.04em 0.04em rgba(0,0,0,0.35);
        background:#42cc8c;
        text-align:center;
        transition: all 0.15s;
        height: 40px;
        font-size: 20px;
    }
    
    ui-button:hover{
        text-shadow: 0 0 2em rgba(255,255,255,1);
        color:#FFFFFF;
        border-color:#FFFFFF;
    }
  `,

    // html template for panel
    template: `
    <h1>Clone New Project: <span id="NewProject"></span></h1>
    <form class="container">
        <label>Scene Name:</label>
        <input type="text" placeholder="6999" id="sceneName"></input>
        <label> Release Path:</label>
        <input type="text" placeholder="cc-release-8/cc-fighting-da-ga-6999" id="scenePath">
        <ui-button id="cloneScene">Clone Scene</ui-button>
    </form> 
  `,
    // element and variable binding
    $: {
        newProject: '#NewProject',
        sceneName: '#sceneName',
        scenePath: '#scenePath',
        cloneScene: '#cloneScene',
    },

    // method executed when template and styles are successfully loaded and initialized
    ready () {
        /*this.$btn.addEventListener('confirm', () => {
          Editor.Ipc.sendToMain('slot:clicked');
        });*/
        this.setupMenu();
        this.bindFunction();
    },

    setupMenu() {

    },

    bindFunction() {
        this.$cloneScene.addEventListener('confirm', () => {
            Editor.Ipc.sendToMain('slot:clone', this.$sceneName.value, this.$scenePath.value);
            //Editor.Ipc.sendToMain('slot:clone', this.$sceneName.value, "cc-release-8/DevTest");
        });
    },

    // register your ipc messages here
    messages: {
        'slot:hello'(event) {
            this.$label.innerText = 'Hello!';
        }
    }
});