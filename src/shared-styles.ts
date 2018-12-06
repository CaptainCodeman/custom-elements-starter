import { html } from "lit-html"

export const sharedStyles = html`
<style>
  :host {
    display: block;
    box-sizing: border-box;
  }

  * {
    box-sizing: border-box;
  }

  :host([hidden]), [hidden] { 
    display: none !important;
  }
</style>`
