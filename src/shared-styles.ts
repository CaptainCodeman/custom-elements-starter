import { css } from "lit-element"

export const sharedStyles = css`
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
`
