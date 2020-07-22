import { globalConfig } from "../core/config.js";
import { gMetaBuildingRegistry } from "../core/global_registries";
import { MetaBuilding } from "../game/meta_building.js";
import { enumDirection, Vector } from "../core/vector";
import { enumItemType } from "../game/base_item";
import { makeOffscreenBuffer } from "../core/buffer_utils";
import { AtlasSprite, SpriteAtlasLink } from "../core/sprites";
//import { initMetaBuildingRegistry } from "../game/meta_building_registry";
import { GameRoot } from "../game/root";
import { ShapeItem } from "../game/items/shape_item.js";
import { ShapeDefinition } from "../game/shape_definition.js";
import { enumItemProcessorTypes } from "../game/components/item_processor.js";

export const version = "7a+g";
export const supportedTargetVersions = ["7a+g"];
let mods = {};
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
let ModProcessors = {};
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
    if (!file.name.endsWith(".json"))
    {
        return "invalid format";
    }

    let modid = file.name.replace(/.json$/, "") //file name should be same as modid
    mods[modid] = JSON.parse(text);
    let thisMod = mods[modid];

    //assumes mod defines variants object
    for (const key in thisMod.variants)
    {
        addVariant(thisMod.variants[key], modid)
    }
}

function addVariant(variant, modid)
{
    //parse varient to use proper data types
    variant.dimensions = new Vector(variant.size[0], variant.size[1])
    if (variant.components != undefined && variant.components.ItemAcceptor != undefined)
    {
        variant.components.ItemAcceptor.slots.forEach( (slot, count) => {
            variant.components.ItemAcceptor.slots[count] = {pos: new Vector(slot.pos[0], slot.pos[2]), directions: slot.directions, filter: slot.filter};
        });
    }
    if (variant.components != undefined && variant.components.ItemEjector != undefined)
    {
        variant.components.ItemEjector.slots.forEach( (slot, count) => {
            variant.components.ItemEjector.slots[count] = {pos: new Vector(slot.pos[0], slot.pos[2]), direction: slot.direction};
        });
    }

    let vName = modid + "_" + variant.name;
    ModRegister.buildings[variant.category] = ModRegister.buildings[variant.category] || {};
    ModRegister.buildings[variant.category][vName] = variant;
    globalConfig.buildingSpeeds[vName] = variant.speed[0]/variant.speed[1];
    let img = {};
    ModSprites[vName] = AtlasSpriteFromSrc(variant.image, vName);
    ModSprites[vName + "_bp"] = AtlasSpriteFromSrc(variant.bpimage, vName + "_bp");
    if (variant.components.ItemProcessor != undefined)
    {
        ModProcessors[vName] = new Function("items", "itemsBySlot", variant.components.ItemProcessor.func);
        enumItemProcessorTypes[vName] = vName; //not useful as an Enum but allows serialization
    }
}

//not in use yet. use to add actual building categories
function addBuilding(building, modid)
{
    let bName = modid + "_" + building.name;
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
            entityComponents.ItemProcessor.type = variant;//ModRegister.buildings[building][variant].components.ItemProcessor.type;
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

export function DoModProcessor(type, items, itemsBySlot)
{
    if (ModProcessors[type] == undefined)
        return undefined;
    let outItems = ModProcessors[type](items, itemsBySlot);
    let itemsOutput = [];
    outItems.forEach( item =>
        {
            itemsOutput.push({
                item: new ShapeItem(new ShapeDefinition({
                    layers: []
                })),
                requiredSlot: item.slot,
            });
            item.layers.forEach(layer =>
                {
                    itemsOutput[itemsOutput.length-1].item.definition.layers.push([
                        layer[0] || null,
                        layer[1] || null,
                        layer[2] || null,
                        layer[3] || null,
                    ])
                })
            /*for (let layer in item.layers)
            {
                console.log(item.layers);
                console.log(layer);
                itemsOutput[itemsOutput.length-1].item.definition.layers.push([
                    layer[0] || null,
                    layer[1] || null,
                    layer[2] || null,
                    layer[3] || null,
                ])
            }*/
        }
    )
    return itemsOutput;
}

function fromAnonymousToShapeItem(anonObj)
{
    //new ShapeItem()
}

/**** immedient TODO  (from most to least important)
 * getAvailableVariants()
 * updateVariants()
 * isRotateable(variant)  (in trash)
 * 
 * getAdditionalStatistics()
 * 
 */