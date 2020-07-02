import { TextualGameState } from "../core/textual_game_state";
import { formatSecondsToTimeAgo } from "../core/utils";
import { allApplicationSettings } from "../profile/application_settings";
import { T } from "../translations";

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
                <!---<form class="mform" style="margin: 0; padding: 0; display: inline">
                    <label class="uploadlabel" for="fileElem">${T.mods.import}</label>
                    <input type="file" id="fileElem" multiple accept=".txt" style="font-size:13px; display: inline;">
                </form>-->
                <button class="styledButton moddingFileLocation">${T.mods.fileLocation}</button>
                &nbsp;&nbsp;<span style="color:gray;font-size:13px">${T.mods.versionPrefix}1</span>&nbsp;&nbsp;
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
        //document.querySelector('input').addEventListener('input', this.handleFiles);
    }

    onHelpClicked() {
        var win = window.open();
        win.document.write('<iframe src="' + T.mods.helpPage  + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>');
    }

    onFileLocClicked() {
        window.open("file:///C:/Users/camqu/AppData/Roaming/shapez.io/");
        //Tiger~ idk what I'm doing so this does nothing
    }

    /*handleFiles(e) {
        console.log(e.target.files)
    }*/

}
