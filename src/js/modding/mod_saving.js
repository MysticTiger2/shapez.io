import { mods, loadNewMod } from "./mod_handler";
import { createLogger } from "../core/logging";

const logger = createLogger("storage/browser"); //idk what param should be ~Tiger

export let GAME_NEEDS_RELOADED = false;

export function saveMod(fileName, text)
{
    if (canUseLocalStorage())
        writeFileAsync(fileName, text); //overwrites saved mods with the same name, which is good
}

let currentBusyFilename = false;

async function writeFileAsync(filename, contents) {
    if (currentBusyFilename === filename) {
        logger.warn("Attempt to write", filename, "while write process is not finished!");
    }

    currentBusyFilename = filename;
    window.localStorage.setItem(filename, contents);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            currentBusyFilename = false;
            resolve();
        }, 0);
    });
}

export async function loadMods()
{
    if (canUseLocalStorage)
    {
        let localStorageMods = getModLocalStorageList();
        for (let i = 0; i < localStorageMods.length; i++)
        {
            let contents = await readFileAsync(localStorageMods[i]);
            loadNewMod(localStorageMods[i], contents, true);
        }
    }
}

async function readFileAsync(filename) {
    if (currentBusyFilename === filename) {
        logger.warn("Attempt to read", filename, "while write progress on it is ongoing!");
    }

    return new Promise((resolve, reject) => {
        const contents = window.localStorage.getItem(filename);
        if (!contents) {
            // File not found
            //setTimeout(() => reject(FILE_NOT_FOUND), randomDelay());
            console.warn("mod file not found: " + filename);
            return;
        }

        // File read, simulate delay
        setTimeout(() => resolve(contents), 0);
    });
}

export async function deleteMod(name)
{
    if (!modIsSaved(name.replace(/\.json/i, "")))
        return;
    if (canUseLocalStorage)
    {
        //remove from LS
        await localStorage.removeItem(name);
    }
    //remove from list
    delete mods[name.replace(/\.json/i, "")];
    //set game dirty
    GAME_NEEDS_RELOADED = true;
}

function modIsSaved(name)
{
    let list = getModNameList();
    for (let i = 0; i < list.length; i++)
    {
        if (list[i] == name)
        {
            return true;
        }
    }
    return false;//[].indexOf(getModNameList(), name);
}

/*function getModList() //from mods in game, not files saved in local storage
{
    return mods;
}*/

function getModNameList()
{
    return Object.keys(mods);
}

function getModLocalStorageList()
{
    return Object.keys(localStorage).filter(key => /^.+_.+.json$/i.test(key));
}



function canUseLocalStorage()
{//TODO
    return true;
}