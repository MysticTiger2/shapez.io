import { TextualGameState } from "../core/textual_game_state";
import { formatSecondsToTimeAgo } from "../core/utils";
import { allApplicationSettings } from "../profile/application_settings";
import { T } from "../translations";
import { waitNextFrame } from "../core/utils";
import * as mod_handler from '../modding/mod_handler.js';

export class ModsState extends TextualGameState {
    constructor() {
        super("ModsState");
    }

    getStateHeaderTitle() {
        return T.mods.title;
    }

    getMainContentHTML() {
        return `

            <div class="upperLinks">
                <button class="styledButton moddingFileLocation">${T.mods.fileLocation}</button>
                <button class="styledButton moddingImport">${T.mods.import}</button>
                &nbsp;&nbsp;<span style="color:gray;font-size:13px">${T.mods.versionPrefix} ${mod_handler.version}</span>&nbsp;&nbsp;
                <button class="styledButton moddingHelp">${T.mods.helpSymbol}</button>
            </div>


        `;
    }
    
    onEnter(payload) {
        this.trackClicks(this.htmlElement.querySelector(".moddingHelp"), this.onHelpClicked, {
            preventDefault: false,
        });
        this.trackClicks(this.htmlElement.querySelector(".moddingFileLocation"), this.onFileLocClicked, {
            preventDefault: false,
        });
        this.trackClicks(this.htmlElement.querySelector(".moddingImport"), this.handleImportRequest, {
            preventDefault: false,
        });
    }

    onHelpClicked() {
        var win = window.open();
        win.document.write('<iframe src="' + T.mods.helpPage  + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>');
    }

    onFileLocClicked() {//shouldn't be called
        window.open("file:///C:/Users/camqu/AppData/Roaming/shapez.io/");
        //Tiger~ idk what I'm doing so this does nothing yet
    }


    handleImportRequest() {
        var input = document.createElement("input");
        input.type = "file";
        input.accept = ".js";

        input.onchange = e => {
            const file = input.files[0];
            if (file) {
                waitNextFrame().then(() => {
                    //this.app.analytics.trackUiClick("import_savegame");
                    //const closeLoader = this.dialogs.showLoadingDialog();
                    const reader = new FileReader();
                    reader.addEventListener("load", event => {
                        // @ts-ignore
                        const contents = event.target.result;
                        const reader2 = new FileReader();
                        reader2.readAsDataURL(file)
                        reader2.addEventListener("load", event => {
                            mod_handler.loadNewMod(file, contents, reader2.result);
                        });
                    });
                    reader.addEventListener("error", error => {
                        this.dialogs.showWarning(
                            T.mods.dialogs.importError.title,
                            T.mods.dialogs.importError.text + ":<br><br>" + error
                        );
                    });
                    reader.readAsText(file, "utf-8");
                });
            }
        };
        input.click();
    }


}
