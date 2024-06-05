import { createDirectus, rest, } from '@directus/sdk';

type Home = {

}

type Schema = {
  home: Home[];
}

const directus = createDirectus<Schema>('https://directus--fairclouds-u18160.vm.elestio.app/').with(rest());

export default directus;