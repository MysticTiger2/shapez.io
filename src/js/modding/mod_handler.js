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
let ModRegister = {buildings: {
        [Symbol.iterator]: function* ()
        {
            let properties = Object.keys(this);
            for (let i of properties) {
                yield [i, this[i]];
        }
    }
}};
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
    let testimg = "https://i.redd.it/2qw5udhpru351.jpg";
    let secondimg = "https://i.ibb.co/6wsd9xK/ghost-doggo.png";
    let exampleName = {default: "en", en: "Painter (Half)", es: "Pintor (Medio)"};
    let exampleDesc = {default: "en", en: "Allows you to color just the left half of a shape."};
    addVariant({name: "halfpainter", Tnames: exampleName, Tdescriptions: exampleDesc, size: {w:2, h:1}, speed: 1/6, category: "painter", components: {ItemAcceptor: {slots: testslots}, ItemEjector: {slots: testslots2}, ItemProcessor: {inputsPerCharge: 2, type: "painter"}}, image: testimg, bpimage: secondimg}, "tiger_testmod");
    //addLangFromMod({en: {buildings: {painter: {tiger_testmod_halfpainter: {name: "Half Painter"}}}}});
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
    ModSprites[vName + "_bp"] = AtlasSpriteFromSrc(variant.bpimage);

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

export function CurrentVariantSpeed(variant, upgradeLevel)
{
    return globalConfig.beltSpeedItemsPerSecond * upgradeLevel * globalConfig.buildingSpeeds[variant]
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

export function modsHaveSprite(key) //only works with blueprint, building sprites
{
    if (!/^(sprites\/(buildings|blueprints)\/[^-]+-)/.test(key))
        return false;
    let refinedKey = key.replace(/^(sprites\/(buildings|blueprints)\/[^-]+-)/, "").replace(".png", "");
    refinedKey += key.includes("blueprints") ? "_bp" : "";
    return refinedKey in ModSprites;
}

export function getSpriteFromMods(key) //only works with blueprint, building sprites
{
    return ModSprites[key.replace(/^(sprites\/(buildings|blueprints)\/[^-]+-)/, "").replace(".png", "") + (key.includes("blueprints") ? "_bp" : "")];
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

function addLangFromMod(lang) //{en_us: {}, es: {}, etc}
{
    //not implemented
}

export function getModTranslation(variant, lookingFor)//variant looks like "tiger_testmod_halfpainter"
{
    //checks for existant variant in mods and returns undefined if none found
    let modVariantFound;
    for (const [key, value] of ModRegister.buildings)
    {
        if (ModRegister.buildings[key].hasOwnProperty(variant))
        {
            modVariantFound = ModRegister.buildings[key][variant];
            break;
        }
    }
    if (!modVariantFound)
    {
        return undefined;
    }

    let lang = root.app.settings.getAllSettings().language;
    switch (lookingFor)
    {
        case "name":
            return modVariantFound.Tnames[lang] || modVariantFound.Tnames.default;
        case "description":
            return modVariantFound.Tdescriptions[lang] || modVariantFound.Tdescriptions.default;
    }
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