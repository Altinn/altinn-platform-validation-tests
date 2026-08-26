import { fetchTestData, getOptions } from "../../../helpers.js";
import { getInfoCloud, searchInfoCloud } from "./commons.js";

export function setup() {
    return fetchTestData("portaler/words.txt");
}

const rootLabel = { step: "get infocloud søk" };
const authorizedPartiesLabel = { step: "authorizedParties" };
const favoritesLabel = { step: "favorites" };
const currentLabel = { step: "current" };

export const options = getOptions([
    rootLabel,
    authorizedPartiesLabel,
    favoritesLabel,
    currentLabel,
]);

/**
 * @param {string[]} words The words to search for, one drawn per iteration.
 * @returns {void} Nothing. The checks record what came back.
 */
export default function (words) {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    searchInfoCloud(randomWord, rootLabel);
    getInfoCloud("/api/users/authorized-parties", authorizedPartiesLabel);
    getInfoCloud("/api/users/favorites", favoritesLabel);
    getInfoCloud("/api/users/current", currentLabel);
};
