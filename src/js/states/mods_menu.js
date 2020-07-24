import { TextualGameState } from "../core/textual_game_state";
import { formatSecondsToTimeAgo, makeDiv } from "../core/utils";
import { allApplicationSettings } from "../profile/application_settings";
import { T } from "../translations";
import { waitNextFrame } from "../core/utils";
import * as mod_handler from '../modding/mod_handler';
import { deleteMod } from "../modding/mod_saving";

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
                <button class="styledButton moddingImport">${T.mods.import}</button>
                &nbsp;&nbsp;<span style="color:gray;font-size:13px">${T.mods.versionPrefix} ${mod_handler.version}</span>&nbsp;&nbsp;
                <button class="styledButton moddingHelp">${T.mods.helpSymbol}</button>
            </div>
            <div class="modsContainer"></div>

        `;
    }
    
    onEnter(payload) {
        this.trackClicks(this.htmlElement.querySelector(".moddingHelp"), this.onHelpClicked, {
            preventDefault: false,
        });
        this.trackClicks(this.htmlElement.querySelector(".moddingImport"), this.handleImportRequest, {
            preventDefault: false,
        });
        this.renderStoredMods();
    }

    onHelpClicked() {
        var win = window.open();
        win.document.write('<iframe src="' + T.mods.helpPage  + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>');
    }


    handleImportRequest() {
        var input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";

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
                        //const reader2 = new FileReader();
                        //reader2.readAsDataURL(file)
                        //reader2.addEventListener("load", event => {
                            mod_handler.loadNewMod(file.name, contents, false);//reader2.result);
                        //});
                        this.renderStoredMods();
                    });
                    reader.addEventListener("error", error => {
                        this.dialogs.showWarning(
                            T.mods.importError.title,
                            T.mods.importError.text + ":<br><br>" + error
                        );
                    });
                    reader.readAsText(file, "utf-8");
                });
            }
        };
        input.click();
    }

    renderStoredMods() {
        const oldContainer = this.htmlElement.querySelector(".modsContainer .mods");
        if (oldContainer) {
            oldContainer.remove();
        }
        const mods = mod_handler.mods;
        if (Object.keys(mods).length > 0) {
            const parent = makeDiv(this.htmlElement.querySelector(".modsContainer"), null, ["mods"]);

            for (let i = 0; i < Object.keys(mods).length; ++i) {
                const elem = makeDiv(parent, null, ["mod"]);

                makeDiv(
                    elem,
                    null,
                    ["name"],
                    Object.keys(mods)[i]
                );

                const deleteButton = document.createElement("button");
                deleteButton.innerHTML = "🗑";
                deleteButton.classList.add("styledButton", "deleteMod");
                elem.appendChild(deleteButton);

                this.trackClicks(deleteButton, () => this.delMod(Object.keys(mods)[i]));
            }
        }
    }

    async delMod(mod)
    {//FIXME
        await deleteMod(mod + ".json"); //FIXME  requires that mod files use .json and not .Json, .JSON, .JSOn, etc - otherwise mod can't be deleted
        this.renderStoredMods();
    }//FIXME  ty

}
