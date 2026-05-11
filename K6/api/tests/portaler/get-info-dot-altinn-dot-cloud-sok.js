import { getInfoCloud } from "./commons.js";
import { getOptions } from "../../../helpers.js";

import http from 'k6/http';

export function setup() {
    const response = http.get(
        'https://raw.githubusercontent.com/Altinn/altinn-platform-validation-tests/refs/heads/main/K6/testdata/portaler/words.txt'
    );

    return response.body
        .split('\n')
        .map(w => w.trim())
        .filter(Boolean);
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

export default function (words) {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const encodedWord = encodeURIComponent(randomWord);
    getInfoCloud(`/sok/?q=${encodedWord}`, rootLabel);
    getInfoCloud("/api/users/authorized-parties", authorizedPartiesLabel);
    getInfoCloud("/api/users/favorites", favoritesLabel);
    getInfoCloud("/api/users/current", currentLabel);
};
