/**
 * One validation error inside a problem details body.
 *
 * @typedef {object} ValidationErrorDto
 * @property {string} code Error code, e.g. "AM.VLD-00049".
 * @property {string} [title] Short description of the error.
 * @property {Array<string>} [paths] The fields the error is about.
 */

/**
 * The problem details body Altinn APIs answer an error with.
 *
 * @typedef {object} AltinnProblemDetails
 * @property {string} code Error code, e.g. "AM-00042", or "STD-00000" for validation errors.
 * @property {string} [title] Short description of the error.
 * @property {number} [status] The HTTP status code.
 * @property {string} [detail] Longer description, specific to this occurrence.
 * @property {Array<ValidationErrorDto>} [validationErrors] The validation errors, for a validation problem.
 */

export const AltinnProblemDetails = undefined;
export const ValidationErrorDto = undefined;
