import { getInfoCloud } from "./commons.js";
import { getOptions } from "../../../helpers.js";

const rootLabel = { step: "get infocloud skjemaoversikt" };
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
    getInfoCloud("/skjemaoversikt", rootLabel);
    getInfoCloud("/api/users/authorized-parties", authorizedPartiesLabel);
    getInfoCloud("/api/users/favorites", favoritesLabel);
    getInfoCloud("/api/users/current", currentLabel);
};
