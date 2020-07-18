import { globalConfig } from "../core/config.js";
import { gMetaBuildingRegistry } from "../core/global_registries";
import { MetaBuilding } from "../game/meta_building.js";
import { enumDirection, Vector } from "../core/vector";
import { enumItemType } from "../game/base_item";
import { makeOffscreenBuffer } from "../core/buffer_utils";
import { AtlasSprite, SpriteAtlasLink } from "../core/sprites";
//import { initMetaBuildingRegistry } from "../game/meta_building_registry";
import { GameRoot } from "../game/root";

export const version = "7a+g";
export const supportedTargetVersions = ["7a+g"];
let ModRegister = {buildings: {}};
let ModSprites = {};
var root;

export default class ModHandler
{
    /**
     *
     * @param {GameRoot} rootin_tootin
     */
    constructor(rootin_tootin)
    {
        root = rootin_tootin;
    }

}

export function loadNewMod(file, text, url) {
    if (!file.name.endsWith(".js"))
    {
        return "invalid format";
    }
    let scriptele = document.createElement("script");
    scriptele.src = url;
    scriptele.type = "module";
    document.body.appendChild(scriptele);

    //for testing: ...does not actually work with the mod.js
    let testslots = [{pos: new Vector(0, 0), directions: [enumDirection.left], filter: enumItemType.shape, }, {pos: new Vector(1, 0), directions: [enumDirection.top], filter: enumItemType.color,}];
    let testslots2 = [{ pos: new Vector(1, 0), direction: enumDirection.right }];
    let testimg = "data:image/png;base64,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";
    addVariant({name: "halfpainter", size: {w:2, h:1}, speed: 1/6, category: "painter", components: {ItemAcceptor: {slots: testslots}, ItemEjector: {slots: testslots2}, ItemProcessor: {inputsPerCharge: 2, type: "painter"}}, image: testimg}, "tiger_testmod");
}

function addVariant(variant, modid)
{
    //parse varient to use proper data types
    variant.dimensions = new Vector(variant.size.w, variant.size.h)

    let vName = modid + "_" + variant.name;
    ModRegister.buildings[variant.category] = ModRegister.buildings[variant.category] || {};
    ModRegister.buildings[variant.category][vName] = variant;
    globalConfig.buildingSpeeds[vName] = variant.speed;
    let img = {};
    ModSprites[vName] = AtlasSpriteFromSrc(variant.image);

}

//[{pos: new Vector(0, 0), directions: [enumDirection.left], filter: enumItemType.shape, }, {pos: new Vector(1, 0), directions: [enumDirection.top], filter: enumItemType.color,}]


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
        //modify here
        let ModVariantComponents = ModRegister.buildings[building][variant].components;
        /*for (const [key, value] of ModVariantComponents)
        {
            entityComponents[key] = value; //idk if this would work with things like ItemAcceptor.slots
        }*/
        if (ModRegister.buildings[building][variant].components.ItemAcceptor != undefined)
            entityComponents.ItemAcceptor.setSlots(ModRegister.buildings[building][variant].components.ItemAcceptor.slots)
        if (ModRegister.buildings[building][variant].components.ItemEjector != undefined)
            entityComponents.ItemEjector.setSlots(ModRegister.buildings[building][variant].components.ItemEjector.slots)
        if (ModRegister.buildings[building][variant].components.ItemProcessor != undefined)
        {
            entityComponents.ItemProcessor.inputsPerCharge = ModRegister.buildings[building][variant].components.ItemProcessor.inputsPerCharge;
            entityComponents.ItemProcessor.type = ModRegister.buildings[building][variant].components.ItemProcessor.type;
        }

    return true;
}

export function modsHaveSprite(key)
{
    if (!/^(sprites\/buildings\/[^-]+-)/.test(key))
        return false;
    let refinedKey = key.replace(/^(sprites\/buildings\/[^-]+-)/, "").replace(".png", "");
    return refinedKey in ModSprites;
}

export function getSpriteFromMods(key)
{
    return (ModSprites[key.replace(/^(sprites\/buildings\/[^-]+-)/, "").replace(".png", "")]);
}

function AtlasSpriteFromSrc(source, label)
{
    const dims = 128;

    const [canvas, context] = makeOffscreenBuffer(dims, dims, {
        smooth: false,
        label: label,
    });
    context.fillStyle = "#f77";
    context.fillRect(0, 0, dims, dims);

    /*context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "#eee";
    context.font = "25px Arial";
    context.fillText("???", dims / 2, dims / 2);*/

    // TODO: Not sure why this is set here
    // @ts-ignore
    canvas.src = source;

    const resolutions = ["0.1", "0.25", "0.5", "0.75", "1"];
    const sprite = new AtlasSprite({
        spriteName: label,
    });

    for (let i = 0; i < resolutions.length; ++i) {
        const res = resolutions[i];
        const link = new SpriteAtlasLink({
            packedX: 0,
            packedY: 0,
            w: dims,
            h: dims,
            packOffsetX: 0,
            packOffsetY: 0,
            packedW: dims,
            packedH: dims,
            atlas: canvas,
        });
        sprite.linksByResolution[res] = link;
    }
    return sprite;
}

function ReRegisterAllBuildings()
{
    //initMetaBuildingRegistry();   dont do this
}

export function getModTranslation(variant, lookingFor)//variant looks like "tiger_testmod_halfpainter"
{
    let lang = root.app.settings.getAllSettings().language;
    return undefined;
}

/**** immedient TODO  (from most to least important)
 * getAvailableVariants()
 * updateVariants()
 * isRotateable(variant)  (in trash)
 * 
 * add support for getAdditionalStatistics()
 * 
 */