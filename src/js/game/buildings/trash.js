import { enumDirection, Vector } from "../../core/vector";
import { ItemAcceptorComponent } from "../components/item_acceptor";
import { ItemEjectorComponent } from "../components/item_ejector";
import { enumItemProcessorTypes, ItemProcessorComponent } from "../components/item_processor";
import { Entity } from "../entity";
import { MetaBuilding, defaultBuildingVariant } from "../meta_building";
import { enumHubGoalRewards } from "../tutorial_goals";
import { GameRoot } from "../root";
import { StorageComponent } from "../components/storage";
import { T } from "../../translations";
import { formatBigNumber } from "../../core/utils";
import { variantExists, variantDims, addAvailableVariants, queryComponents } from "../../modding/mod_handler";

/** @enum {string} */
export const enumTrashVariants = { storage: "storage" };

const trashSize = 5000;

export class MetaTrashBuilding extends MetaBuilding {
    constructor() {
        super("trash");
    }

    isRotateable(variant) {
        return variant !== defaultBuildingVariant;
    }

    getSilhouetteColor() {
        return "#cd7d86";
    }

    /**
     * @param {GameRoot} root
     * @param {string} variant
     * @returns {Array<[string, string]>}
     */
    getAdditionalStatistics(root, variant) {
        if (variant === enumTrashVariants.storage) {
            return [[T.ingame.buildingPlacement.infoTexts.storage, formatBigNumber(trashSize)]];
        }
        return [];
    }

    getDimensions(variant) {
        switch (variant) {
            case defaultBuildingVariant:
                return new Vector(1, 1);
            case enumTrashVariants.storage:
                return new Vector(2, 2);
            default:
                if (variantExists("trash", variant))
                    return variantDims("trash", variant);
                assertAlways(false, "Unknown trash variant: " + variant);
        }
    }

    /**
     * @param {GameRoot} root
     */
    getAvailableVariants(root) {
        if (root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_storage)) {
            return [defaultBuildingVariant, enumTrashVariants.storage].concat(addAvailableVariants(root.hubGoals.level, "trash"));;
        }
        return super.getAvailableVariants(root).concat(addAvailableVariants(root.hubGoals.level, "trash"));;
    }

    /**
     * @param {GameRoot} root
     */
    getIsUnlocked(root) {
        return root.hubGoals.isRewardUnlocked(enumHubGoalRewards.reward_cutter_and_trash);
    }

    /**
     * Creates the entity at the given location
     * @param {Entity} entity
     */
    setupEntityComponents(entity) {
        // Required, since the item processor needs this.
        entity.addComponent(
            new ItemEjectorComponent({
                slots: [],
            })
        );

        entity.addComponent(
            new ItemAcceptorComponent({
                slots: [
                    {
                        pos: new Vector(0, 0),
                        directions: [
                            enumDirection.top,
                            enumDirection.right,
                            enumDirection.bottom,
                            enumDirection.left,
                        ],
                    },
                ],
            })
        );
    }

    /**
     *
     * @param {Entity} entity
     * @param {number} rotationVariant
     * @param {string} variant
     */
    updateVariants(entity, rotationVariant, variant) {
        switch (variant) {
            case defaultBuildingVariant: {
                if (!entity.components.ItemProcessor) {
                    entity.addComponent(
                        new ItemProcessorComponent({
                            inputsPerCharge: 1,
                            processorType: enumItemProcessorTypes.trash,
                        })
                    );
                }
                if (entity.components.Storage) {
                    entity.removeComponent(StorageComponent);
                }

                entity.components.ItemAcceptor.setSlots([
                    {
                        pos: new Vector(0, 0),
                        directions: [
                            enumDirection.top,
                            enumDirection.right,
                            enumDirection.bottom,
                            enumDirection.left,
                        ],
                    },
                ]);
                entity.components.ItemEjector.setSlots([]);
                entity.components.ItemProcessor.type = enumItemProcessorTypes.trash;
                break;
            }
            case enumTrashVariants.storage: {
                if (entity.components.ItemProcessor) {
                    entity.removeComponent(ItemProcessorComponent);
                }
                if (!entity.components.Storage) {
                    entity.addComponent(new StorageComponent({}));
                }

                entity.components.Storage.maximumStorage = trashSize;
                entity.components.ItemAcceptor.setSlots([
                    {
                        pos: new Vector(0, 1),
                        directions: [enumDirection.bottom],
                    },
                    {
                        pos: new Vector(1, 1),
                        directions: [enumDirection.bottom],
                    },
                ]);

                entity.components.ItemEjector.setSlots([
                    {
                        pos: new Vector(0, 0),
                        direction: enumDirection.top,
                    },
                    {
                        pos: new Vector(1, 0),
                        direction: enumDirection.top,
                    },
                ]);
                break;
            }
            default:
                let modVarExists = queryComponents("trash", variant, entity.components);
                if (modVarExists)
                    break;
                assertAlways(false, "Unknown trash variant: " + variant);
        }
    }
}
