import isDarkColor from 'is-dark-color';
import colorsObj from 'css-spec-colors';
import clipboardCopy from 'clipboard-copy';

import { UIActionTypes, UIAction } from '../types';

import './ui.css';

const $input = document.querySelector('.input');
const $list = document.querySelector('.list');
const clipboardIcon = `<svg class="button__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
  <use xlink:href="#clipboard-icon"/>
</svg>`;
const colors = Object.values(colorsObj);

// Generate color list markup
function colorsMarkup(
  colors: Array<{ name: string; hex: string; rgb: string; hsl: string }>,
): string {
  return colors
    .map(
      (color) => `
        <li
          class="item${isDarkColor(color.hex) ? ' item--dark' : ''}"
          data-color-name="${color.name}"
          style="background-color: ${color.hex};"
        >
          <div class="item__name">${color.name}</div>
          <div class="item__buttons">
            <button class="button" type="button" data-color-button="${color.hex}">
              <span class="button__inner">
                <span class="button__text">${color.hex}</span>
                ${clipboardIcon}
              </span>
            </button>
            <button class="button" type="button" data-color-button="${color.rgb}">
              <span class="button__inner">
                <span class="button__text">${color.rgb}</span>
                ${clipboardIcon}
              </span>
            </button>
            <button class="button" type="button" data-color-button="${color.hsl}">
              <span class="button__inner">
                <span class="button__text">${color.hsl}</span>
                ${clipboardIcon}
              </span>
            </button>
          </div>
        </li>
      `,
    )
    .join('');
}

// Sends a message to the plugin worker
function postMessage({ type, payload }: UIAction): void {
  parent.postMessage({ pluginMessage: { type, payload } }, '*');
}

// Close the plugin if pressing Esc key when the input is not focused
function closeWithEscapeKey(): void {
  const tagExceptions = ['input', 'textarea'];

  document.addEventListener('keydown', function (event: KeyboardEvent) {
    try {
      const target = event.target as HTMLElement;

      if (
        event.code.toString().toLowerCase() === 'escape' &&
        !tagExceptions.includes(target.tagName.toLowerCase())
      ) {
        postMessage({ type: UIActionTypes.CLOSE });
      }
    } catch (error) {
      console.error(error);
    }
  });
}

// Attach event listeners (for this specific demo)
function listeners(): void {
  if (!$input) {
    return;
  }

  $input.addEventListener('input', function (event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value.trim();

    if (!$list) {
      return;
    }

    if (!value) {
      $list.innerHTML = colorsMarkup(colors);
    }

    const filteredColors = colors.filter((color) => color.name.includes(value));

    $list.innerHTML = colorsMarkup(filteredColors);
  });

  document.addEventListener(
    'click',
    async function (event: MouseEvent) {
      const target = event.target as HTMLElement & { ['data-color-button']: string };
      const colorValue = target.getAttribute('data-color-button');

      if (colorValue) {
        clipboardCopy(colorValue).then(() => {
          const $text = target.querySelector('.button__text') as HTMLDivElement;

          if (!$text) {
            return;
          }

          const buttonText = $text.innerText;
          $text.innerText = 'Copied!';

          setTimeout(() => {
            $text.innerText = buttonText;
          }, 1000);
        });
      }
    },
    true,
  );
}

(function init(): void {
  // Check if necessary DOM elements are in place
  if (!$input || !$list) {
    postMessage({ type: UIActionTypes.NOTIFY, payload: "Required DOM elements don't exist" });
    return;
  }

  // Populate list of colors
  $list.innerHTML = colorsMarkup(colors);

  // Initialize all the things
  closeWithEscapeKey();
  listeners();
})();
