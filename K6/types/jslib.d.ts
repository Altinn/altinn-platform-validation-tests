// Ambient declarations for the modules k6 resolves at runtime but tsc cannot:
// the jslib bundles are fetched over https, and the extensions are compiled
// into the k6 binary.

declare module "https://jslib.k6.io/*";
declare module "k6/x/*";
