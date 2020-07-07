import { Mod } from "./mod";

export const version = "7a+g";
export const supportedTargetVersions = ["7a+g"];

export function loadNewMod(file, text, url) {
    if (!file.name.endsWith(".js"))
    {
        return "invalid format";
    }
    let scriptele = document.createElement("script");
    scriptele.src = url;
    scriptele.type = "module"
    document.body.appendChild(scriptele);
}

