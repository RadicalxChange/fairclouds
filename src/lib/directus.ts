import { createDirectus, rest, } from '@directus/sdk';

const directus = createDirectus('https://cms.fairclouds.life').with(rest());

export default directus;