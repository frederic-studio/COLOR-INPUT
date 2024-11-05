// Fetch color data from JSON file
let colorData = {}; 

fetch('color-input.json')
    .then(response => response.json())
    .then(data => {
        colorData = data;
    })
    .catch(error => console.error('Error fetching color data:', error));

const colorInputContainer = document.querySelectorAll('.COLOR-INPUT-CONTAINER-SIMPLE');
const rgbRegex = /rgb\(\d{1,3},\s?\d{1,3},\s?\d{1,3}\)/i;
const hslRegex = /hsl\(\d{1,3},\s?\d{1,3},\s?\d{1,3}\)/i;
const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/i;

colorInputContainer.forEach((container) => {
    const inputText = container.querySelector('input[type=text]');
    const inputColor = container.querySelector('input[type=color]');
    const warning = container.querySelector('.warning');
    let currentFormat = 'rgb';

    inputText.addEventListener('input', (event) => {
        findFormatAndConvert(event.target.value);
    });

    inputText.addEventListener('blur', () => {
        if (!findFormatAndConvert(inputText.value)) {
            toggleWarning('add');
        }
    });

    inputColor.addEventListener('input', (e) => {
        updateUIColors(e.target.value);

        // Format the values based on the current format
        if (currentFormat === 'rgb') {
            const [r, g, b] = hexToRGB(e.target.value);
            inputText.value = `rgb(${r}, ${g}, ${b})`;
        } else if (currentFormat === 'hsl') {
            const [h, s, l] = hexToHSL(e.target.value);
            inputText.value = `hsl(${h}, ${s}, ${l})`;
        } else if (currentFormat === 'hex') {
            inputText.value = e.target.value.toUpperCase();
        }

        if (!findFormatAndConvert(inputText.value)) {
            toggleWarning('add');
        }
    });

    function findFormatAndConvert(value) {
        const hexColor = findHexByColorName(value.toLowerCase());

        if (hexColor) {
            inputColor.value = hexColor.toUpperCase();
            updateUIColors(hexColor);
            currentFormat = 'hex';
            toggleWarning('remove');
            return true;
        }

        if (rgbRegex.test(value)) {
            const [r, g, b] = value.match(/\d+/g).map(Number);
            const hexColor = rgbToHex(r, g, b);
            inputColor.value = hexColor;
            updateUIColors(hexColor);
            currentFormat = 'rgb';
            toggleWarning('remove');
            return true;
        }

        if (hslRegex.test(value)) {
            const [h, s, l] = value.match(/\d+/g).map(Number);
            const hexColor = hslToHex(h, s, l);
            inputColor.value = hexColor;
            updateUIColors(hexColor);
            currentFormat = 'hsl';
            toggleWarning('remove');
            return true;
        }

        if (hexRegex.test(value)) {
            inputColor.value = value.toUpperCase();
            updateUIColors(value);
            currentFormat = 'hex';
            toggleWarning('remove');
            return true;
        }

        return false;
    }

    function findHexByColorName(colorName) {
        const hex = Object.keys(colorData).find(hex => colorData[hex].toLowerCase() === colorName);
        return hex || false;
    }

    function toggleWarning(action) {
        const warningSpans = warning.querySelectorAll('span');
        if (action === 'add') {
            warning.classList.add('show');
            warningSpans.forEach((span, index) => {
                setTimeout(() => {
                    span.classList.add('show');
                }, index * 35);
            });
        } else if (action === 'remove') {
            warning.classList.remove('show');
            warningSpans.forEach((span, index) => {
                setTimeout(() => {
                    span.classList.remove('show');
                }, index * 25);
            });
        }
    }

    function updateUIColors(color) {
        const hslColor = hexToHSL(color);
        if (hslColor) {
            const [h, s, l] = hslColor;
            const borderColor = hslToHex(h, s, Math.max(10, Math.min(90, l)));
            inputColor.parentElement.style.border = `2px solid ${borderColor}`;
        }
    }
});

function copyColor(e) {
    const container = e.parentElement;
    const inputText = container.querySelector('input[type=text]');
    const span = container.querySelector('span.copy');
    
    // Only copy if the input value is valid and not empty
    if (inputText.value && !container.querySelector('.warning.show')) {
        navigator.clipboard.writeText(inputText.value);
        span.classList.add("show");
        setTimeout(() => {
            span.classList.remove("show");
        }, 1000);
    }
}
    
    
    
    
    
    // Color conversion functions
    function hexToRGB(hex) {
        if (!hex?.startsWith('#')) return [0, 0, 0];
        const rgb = hex.slice(1).match(/.{2}/g)
            .map(x => Math.min(255, parseInt(x, 16) || 0));
        return rgb.length === 3 ? rgb : [0, 0, 0];
    }
    
    function rgbToHex(r, g, b) {
        return `#${[r, g, b].map(x => {
            const capped = Math.max(0, Math.min(255, Math.round(x)));
            const hex = capped.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('')}`;
    }
    
    function hslToRgb(h, s, l) {
        h = Math.max(0, Math.min(360, h));
        h = (h % 360 + 360) % 360 / 360;
        s = Math.max(0, Math.min(100, s)) / 100;
        l = Math.max(0, Math.min(100, l)) / 100;
        
        if (s === 0) return [l, l, l].map(x => Math.round(Math.min(255, x * 255)));
        
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
    
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        
        return [
            hue2rgb(p, q, h + 1/3),
            hue2rgb(p, q, h),
            hue2rgb(p, q, h - 1/3)
        ].map(x => Math.min(255, Math.round(x * 255)));
    }
    
    function hslToHex(h, s, l) {
        h = Math.max(0, Math.min(360, h));
        s = Math.max(0, Math.min(100, s));
        l = Math.max(0, Math.min(100, l));
        
        const rgb = hslToRgb(h, s, l);
        return rgbToHex(...rgb);
    }
    
    function hexToHSL(hex) {
        let [r, g, b] = hexToRGB(hex);
        r /= 255;
        g /= 255;
        b /= 255;
    
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
    
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
    
        return [
            Math.max(0, Math.min(360, Math.round(h * 360))),
            Math.max(0, Math.min(100, Math.round(s * 100))),
            Math.max(0, Math.min(100, Math.round(l * 100)))
        ];
    } 






    // Color state management
const ColorState = {
    _color: {
        hex: '#000000',
        rgb: [0, 0, 0],
        hsl: [0, 0, 0]
    },
    
    updateFromHex(hex) {
        this._color.hex = hex;
        this._color.rgb = hexToRGB(hex);
        this._color.hsl = hexToHSL(hex);
        return this._color;
    },
    
    updateFromRGB(r, g, b) {
        const hex = rgbToHex(r, g, b);
        return this.updateFromHex(hex);
    },
    
    updateFromHSL(h, s, l) {
        const hex = hslToHex(h, s, l);
        return this.updateFromHex(hex);
    },
    
    get currentColor() {
        return { ...this._color };
    }
};

const formatConfigs = {
    hsl: {
        labels: ['H:', 'S:', 'L:'],
        maxValues: [360, 100, 100],
        units: ['°', '%', '%'],
        getValue: color => color.hsl,
        setValue: (h, s, l) => ColorState.updateFromHSL(h, s, l)
    },
    rgb: {
        labels: ['R:', 'G:', 'B:'],
        maxValues: [255, 255, 255],
        units: ['', '', ''],
        getValue: color => color.rgb,
        setValue: (r, g, b) => ColorState.updateFromRGB(r, g, b)
    },
    hex: {
        labels: [''],
        maxValues: [null],
        units: [''],
        getValue: color => [color.hex],
        setValue: hex => ColorState.updateFromHex(hex.startsWith('#') ? hex : '#' + hex)
    }
};

let currentFormat = 'hsl';

function updateInputWidth(input) {
    const value = input.value;
    const max = input.getAttribute('max');
    const min = input.getAttribute('min');
    
    if (max) {
        const numValue = parseInt(value, 10);
        input.value = Math.max(parseInt(min, 10), Math.min(parseInt(max, 10), numValue));
    }
    
    const width = value.length;
    input.style.width = `${Math.max(width, min ? min.toString().length : 1)}ch`;
    if (max) {
        input.style.maxWidth = `${max.toString().length}ch`;
    }
}

function updateUIColors(container, color) {
    const { hex, hsl } = color;
    const textColor = hslToHex(hsl[0], hsl[1], hsl[2] < 50 ? Math.min(100, hsl[2] + 50) : Math.max(0, hsl[2] - 50));
    const borderColor = hslToHex(hsl[0], hsl[1], Math.max(10, Math.min(90, hsl[2])));
    
    container.querySelectorAll('input, label, h6').forEach(el => el.style.color = textColor);
    container.querySelectorAll('svg path').forEach(path => path.style.fill = textColor);
    container.querySelector('.color-input').style.border = `2px solid ${borderColor}`;
}

function createInputGroup(container) {
    const numberInputDiv = container.querySelector('.number-input');
    numberInputDiv.innerHTML = ''; // Clear existing inputs
    
    const config = formatConfigs[currentFormat];
    const inputs = [];
    
    config.labels.forEach((label, i) => {
        const labelEl = document.createElement('label');
        labelEl.htmlFor = label;
        labelEl.innerHTML = `${label}
            <input type="${currentFormat === 'hex' ? 'text' : 'number'}"
                   id="${label}" name="${label}"
                   ${config.maxValues[i] ? `min="0" max="${config.maxValues[i]}"` : ''}
                   value="0">
            <span>${config.units[i]}</span>`;
        
        numberInputDiv.appendChild(labelEl);
        inputs.push(labelEl.querySelector('input'));
    });
    
    return inputs;
}

function setupContainer(container) {
    const colorPicker = container.querySelector('input[type="color"]');
    const inputs = createInputGroup(container);
    
    function updateFromPicker() {
        const color = ColorState.updateFromHex(colorPicker.value);
        const values = formatConfigs[currentFormat].getValue(color);
        
        inputs.forEach((input, i) => {
            input.value = values[i];
            updateInputWidth(input);
        });
        
        updateUIColors(container, color);
    }
    
    function updateFromInputs() {
        const values = inputs.map(input => input.value);
        const color = formatConfigs[currentFormat].setValue(...values);
        colorPicker.value = color.hex;
        updateUIColors(container, color);
    }
    
    // Event Listeners
    colorPicker.addEventListener('input', updateFromPicker);
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            updateInputWidth(input);
            updateFromInputs();
        });
    });
    
    // Initial update
    updateFromPicker();
}

function changeCurrentFormat() {
    currentFormat = currentFormat === 'hsl' ? 'rgb' : 
                   currentFormat === 'rgb' ? 'hex' : 'hsl';
    document.querySelectorAll('.color-input-container').forEach(setupContainer);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.color-input-container').forEach(setupContainer);
});