import { globalConfig } from "../core/config.js";
import { gMetaBuildingRegistry } from "../core/global_registries";
import { MetaBuilding } from "../game/meta_building.js";
import { enumDirection, Vector } from "../core/vector";

export const version = "7a+g";
export const supportedTargetVersions = ["7a+g"];
let ModRegister = {buildings: {}}; 

export function loadNewMod(file, text, url) {
    if (!file.name.endsWith(".js"))
    {
        return "invalid format";
    }
    let scriptele = document.createElement("script");
    scriptele.src = url;
    scriptele.type = "module";
    document.body.appendChild(scriptele);

    //for testing:
    addVariant({name: "halfpainter", size: {w:2, h:1}, speed: 1/6, category: "painter"}, "tiger_testmod")
}

function addVariant(variant, modid)
{
    //parse varient to use proper data types
    variant.dimensions = new Vector(variant.size.w, variant.size.h)

    let vName = modid + "_" + variant.name;
    ModRegister.buildings[variant.category] = ModRegister.buildings[variant.category] || {};
    ModRegister.buildings[variant.category][vName] = variant;
    globalConfig.buildingSpeeds[vName] = variant.speed;
    
}

//not in use yet. use to add actual building categories
function addBuilding(building, modid)
{
    let bName = modid + "_" + building.name;
    //globalConfig.buildingSpeeds[bName] = building.speed; -- this is for variants I think
    //window[bName] = function () {super(bName)}


    //gMetaBuildingRegistry.register(NewBuildingClass);
}

export function variantExists(buildingCate, variant)
{
    if (ModRegister.buildings[buildingCate] == undefined)
        return false;
    return ModRegister.buildings[buildingCate][variant] != undefined;
}

export function variantDims(building, variant)
{
    return ModRegister.buildings[building][variant].dimensions;
}

export function addAvailableVariants(hubLevel, building) //TODO only add if unlocked
{
    if (ModRegister.buildings[building] == undefined)
        return [];
    return Object.keys(ModRegister.buildings[building]);
}

export function queryComponents(building, variant, entityComponents) //modify entCom as output, return true for existant mod variant or false for nonexistent
{
    if (ModRegister.buildings[building] == undefined || ModRegister.buildings[building][variant] == undefined)
        return false;
    
}




/**** immedient TODO  (from most to least important)
 * getAvailableVariants()
 * updateVariants()
 * isRotateable(variant)  (in trash)
 * 
 * add support for getAdditionalStatistics()
 * 
 */