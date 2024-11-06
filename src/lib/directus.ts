import { createDirectus, rest, } from '@directus/sdk';

const directus = createDirectus('https://directus--fairclouds-u18160.vm.elestio.app/').with(rest());

export default directus;