import { LitElement, html, property, customElement, PropertyValues } from 'lit-element';
import { SVGTemplateResult } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { sharedStyles } from './shared-styles';
import { chevron_left, chevron_right } from './icons';

declare global {
  interface DocumentEventMap {
    'page-changed': CustomEvent<Number>;
  }

  interface HTMLElementTagNameMap {
    'page-numbers': PageNumbersElement
  }
}

interface PageLink {
  page: number
  content: string | SVGTemplateResult | any
  class: string
  active: boolean
  disabled: boolean
}

@customElement('page-numbers' as any)
export class PageNumbersElement extends LitElement {
  @property({ type: Number })
  public count: number = 0

  @property({ type: Number })
  public size: number = 10
  
  @property({ type: Number })
  public page: number = 1

  @property({ type: Number })
  public delta: number = 1

  public links: PageLink[] = []

  shouldUpdate(changedProperties: PropertyValues) {
    return this.count > 0 && this.size > 0 && this.page > 0 && this.delta > 0
  }

  onPageChange(e: Event) {
    this.dispatchEvent(new CustomEvent('page-changed', {
      bubbles: true,
      composed: true,
      detail: 1,
    }))
  }

  createPageLinks(page: number, count: number, delta: number) : PageLink[] {
    const range: PageLink[] = []

    const start = Math.min(count - delta * 2, Math.max(2, page - delta))
    const finish = Math.max(delta * 2 + 1, Math.min(count - 1, page + delta))

    for (let i = start; i <= finish; i++) {
      range.push({
        page: i,
        content: String(i),
        class: 'page',
        active: page === i,
        disabled: false,
      })
    }
  
    if (page - delta > 2) {
      range.unshift({
        page: Math.ceil((page - delta) / 2),
        content: unsafeHTML('&hellip;'),
        class: 'div',
        active: false,
        disabled: false,
      })
    }

    if (page + delta < count - 1) {
      range.push({
        page: page + delta + Math.floor((count - page - delta) / 2),
        content: unsafeHTML('&hellip;'),
        class: 'div',
        active: false,
        disabled: false,
      })
    }
  
    range.unshift({
      page: 1,
      content: '1',
      class: 'page',
      active: page === 1,
      disabled: false,
    })

    range.unshift({
      page: page - 1,
      content: chevron_left,
      class: 'prev',
      active: false,
      disabled: page === 1,
    })

    range.push({
      page: count,
      content: String(count),
      class: 'page',
      active: page === count,
      disabled: false,
    })

    range.push({
      page: page + 1,
      content: chevron_right,
      class: 'next',
      active: false,
      disabled: page === count,
    })
  
    return range
  }

  render() {
    const pages = Math.ceil(this.count / this.size)
    this.links = this.createPageLinks(this.page, pages, this.delta)
    
    return html`
<style>
  :host {
    display: flex;
    flex-wrap: nowrap;
  }

  a {
    display: inline-block;
    margin: 0.2em;
    padding: 0.3em;
    border: 0.05em solid #aaa;
    border-radius: 0.4em;
    text-decoration: none;
    min-width: 2em;
    text-align: center;
    fill: #444;
    color: #444;
    background-color: #fff;
    order: 0;
  }

  a[active] {
    font-weight: bold;
    color: #333;
    border-color: #666;
  }

  a[disabled] {
    fill: #999;
    color: #999;
    background-color: #eee;
    border-color: #ccc;
  }

  .div {
    background-color: transparent;
    border-color: transparent;
  }

  svg {
    width: 1.2em;
    height: 1.2em;
    display: inline-block;
    vertical-align: text-bottom;
  }
</style>
${this.links.map(link => html`${link.disabled
  ? html`<a class="${link.class}" disabled>${link.content}</a>`
  : html`<a class="${link.class}" href="?page=${link.page}" ?active="${link.active}">${link.content}</a>`}`)}
`
  }

  static get styles() {
    return [
      sharedStyles
    ]
  }
}
