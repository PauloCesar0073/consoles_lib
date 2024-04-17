/*
 * @license MIT
 * GitHub: https://github.com/PauloCesar0073/consoles_lib
 * @Author: PauloCesar0073
 */

class Consoles_lib {
    /**
     * Cria uma nova instância de Consoles_lib.
     * @param {HTMLElement} consoleElement - O elemento onde será exibido o conteúdo.
     * @param {number} [defaultDelay=40] - O atraso padrão entre cada caractere (em milissegundos) para animação de texto.
     */
    constructor(consoleElement, defaultDelay = 40) {
        this.consoleElement = consoleElement;
        this._textQueue = [];
        this.currentTimeout = null;
        this.defaultDelay = defaultDelay;
    }

    /**
     * Adiciona um elemento à fila de exibição no console.
     * @param {Object} elementConfig - Configuração do elemento a ser exibido.
     * @param {string} elementConfig.type - O tipo do elemento ('textAnimation', 'text', 'html', 'formattedCode').
     * @param {string} elementConfig.content - O conteúdo a ser exibido.
     * @param {Object} [elementConfig.style] - Estilo CSS a ser aplicado ao elemento.
     * @param {number} [elementConfig.delay] - Atraso específico para animação de texto.
     * @param {Array<Object>} [elementConfig.code] - Lista de partes do código (para 'formattedCode').
     * @param {string} [elementConfig.language] - Linguagem do código (para 'formattedCode').
     */
    addElement(elementConfig) {
        this._textQueue.push(elementConfig);
        if (this._textQueue.length === 1) {
            this._showNext();
        }
    }

    /**
     * Limpa o console, removendo todo o conteúdo.
     */
    clearConsole() {
        this.consoleElement.textContent = '';
    }

    /**
     * Exibe o próximo elemento da fila de exibição.
     * @private
     */
    async _showNext() {
        if (this._textQueue.length > 0) {
            const elementConfig = this._textQueue[0];

            switch (elementConfig.type) {
                case 'textAnimation':
                    await this._displayTextWithAnimation(elementConfig.content, elementConfig.style, elementConfig.delay);
                    break;
                case 'text':
                    this._displayText(elementConfig.content, elementConfig.style);
                    break;
                case 'html':
                    this._displayHtmlElement(elementConfig.element);
                    break;
                case 'formattedCode':
                    this._displayFormattedCode(elementConfig.code, elementConfig.language);
                    break;
            }

            this._textQueue.shift();
            this._showNext();
        }
    }

    /**
     * Exibe texto no console com um estilo opcional.
     * @param {string} text - O texto a ser exibido.
     * @param {Object} [style] - Estilo CSS a ser aplicado ao texto.
     * @private
     */
    _displayText(text, style) {
        const textLines = text.split('\n'); // Divide o texto em linhas separadas por \n

        textLines.forEach((line, index) => {
            const span = document.createElement('span');
            span.textContent = line;
            this._applyStyle(span, style);
            this.consoleElement.appendChild(span);

            if (index < textLines.length - 1) {
                this.consoleElement.appendChild(document.createElement('br')); // Adiciona <br> para nova linha
            }
        });

        this.consoleElement.scrollTop = this.consoleElement.scrollHeight;
    }

    /**
     * Exibe um texto com animação de digitação no console.
     * @param {string} text - O texto a ser exibido com animação.
     * @param {Object} [style] - Estilo CSS a ser aplicado ao texto.
     * @param {number} [delay=this.defaultDelay] - O atraso entre cada caractere (em milissegundos).
     * @private
     */
    async _displayTextWithAnimation(text, style, delay = this.defaultDelay) {
        for (let char of text) {
            const span = document.createElement('span');
            if (char === '\n') {
                this.consoleElement.appendChild(document.createElement('br')); // Adiciona <br> para nova linha
            } else {
                span.textContent = char;
                this._applyStyle(span, style);
                this.consoleElement.appendChild(span);
                this.consoleElement.scrollTop = this.consoleElement.scrollHeight;
            }
            await this._delay(delay);
        }
    }

    /**
     * Exibe um elemento HTML no console.
     * @param {HTMLElement} element - O elemento HTML a ser exibido.
     * @private
     */
    _displayHtmlElement(element) {
        this.consoleElement.appendChild(element);
        this.consoleElement.scrollTop = this.consoleElement.scrollHeight;
    }

    /**
     * Exibe código formatado no console.
     * @param {Array<Object>} code - Lista de partes do código a serem formatadas.
     * @param {string} language - O formato do código (por exemplo, 'kotlin', 'python', 'javascript').
     * @private
     */
    _displayFormattedCode(code, language) {
        const formattedCode = this.generateFormattedCode(code, language);
        formattedCode.forEach(element => {
            this.addElement(element);
        });
    }

    /**
     * Gera um snippet de código formatado com base no formato especificado.
     * @param {Array<Object>} code - Lista de partes do código a serem formatadas.
     * @param {string} language - O formato do código (por exemplo, 'kotlin', 'python', 'javascript').
     * @returns {Array<Object>} Uma lista de objetos representando os elementos formatados.
     */
    generateFormattedCode(code, language) {
        const elements = [];
        elements.push({
            type: 'textAnimation',
            content: ` ${language}\n\n`,
            style: { color: '#939393', fontSize: '10px' }
        });

        code.forEach(({ content, styles }) => {
            const combinedStyle = { color: '#3d3d3d', ...styles };
            elements.push({
                type: 'textAnimation',
                content: content,
                style: combinedStyle
            });
        });

        return elements;
    }
    /**
     * Cria um botão de cópia para o código formatado.
     * @param {Array<Object>} code - Lista de partes do código a serem copiadas.
     * @returns {HTMLButtonElement} O elemento HTML do botão de cópia.
     */
    createCopyButton(code) {
        const button = document.createElement('button');
        button.textContent = 'Copiar Código';
        button.style.color = '#ffffff';
        button.style.backgroundColor = 'transparent';
        button.style.padding = '2px 4px';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.cursor = 'pointer';
        button.style.right= '10px';
        button.style.position =  'absolute';

        const codeToCopy = code.map(({ content }) => content).join('');
        button.onclick = () => {
            navigator.clipboard.writeText(codeToCopy)
                .then(() => {
                    button.textContent = 'Copiado!'; // Restaura o texto original após 1,5 segundos
                    setTimeout(() => {
                        button.textContent = 'Copiar Código';
                    }, 1500);
                })
                .catch((error) => {
                    console.error('Erro ao copiar código:', error);
                });
        };

        return button;
    }
    /**
     * Aplica estilos a um elemento HTML.
     * @param {HTMLElement} element - O elemento HTML ao qual os estilos serão aplicados.
     * @param {Object} style - Estilo CSS a ser aplicado ao elemento.
     * @private
     */
    _applyStyle(element, style) {
        if (style) {
            Object.assign(element.style, style);
        }
    }

    /**
     * Aguarda um atraso especificado em milissegundos.
     * @param {number} ms - O tempo de atraso em milissegundos.
     * @returns {Promise<void>} Uma promessa que resolve após o atraso.
     * @private
     */
    async _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

