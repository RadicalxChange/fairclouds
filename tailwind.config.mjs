/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		fontFamily: {
			sans: 'arial, helvetica neue, helvetica, sans-serif',
		},
		extend: {
			colors: {
				primary: '#72AEE9',
				white: '#FFFFFF',
				grey: '#D9D9D9'
			},
			boxShadow: {
        		'cloud': 'inset 0px 0px 6.8px 1px #FFFFFF',
				'large-cloud': 'inset 0px 0px 23.9px 5px #FFFFFF',
				'inverted-cloud': 'inset 0px 0px 6.8px 1px #000000',
				'focus': 'inset 0px 0px 7px 3px #FFFFFF',
      },
			borderRadius: {
				default: '5px',
			}
		},
	},
	plugins: [],
}