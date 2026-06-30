import { getOptions } from "../../../helpers.js";
import { getInfoCloud } from "./commons.js";

const rootLabel = { step: "get infocloud" };
const authorizedPartiesLabel = { step: "authorizedParties" };
const favoritesLabel = { step: "favorites" };
const currentLabel = { step: "current" };

export const options = getOptions([
    rootLabel,
    authorizedPartiesLabel,
    favoritesLabel,
    currentLabel,
]);

export default function () {
    getInfoCloud("/", rootLabel);
    getInfoCloud("/api/users/authorized-parties", authorizedPartiesLabel);
    getInfoCloud("/api/users/favorites", favoritesLabel);
    getInfoCloud("/api/users/current", currentLabel);
};
