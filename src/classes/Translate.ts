import { Interaction } from 'discord.js'
import { Client } from '../utils/classes.js'
import i18n from 'i18n'

export class Translator {
    private _i18n = i18n

    constructor(interaction: Interaction) {
        this._i18n.configure((interaction.client as Client).i18nConfig)
        this._i18n.setLocale(interaction.locale.slice(0, 2))
    }

    /**
     * Get a response in the language set on the server
     * @param {string} phrase - phrase to translate
     * @param {string} params - if is nesesary
     * @returns {string} string
     */
    translate(phrase: string, params?: object): string {
        if (params) return this._i18n.__mf(phrase, params)
        return this._i18n.__(phrase)
    }
}
