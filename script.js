const card = document.getElementById('creditCard');
const inputNumber = document.getElementById('inputNumber');
const inputName = document.getElementById('inputName');
const inputExpiry = document.getElementById('inputExpiry');
const inputCVV = document.getElementById('inputCVV');

const viewNumber = document.getElementById('viewNumber');
const viewName = document.getElementById('viewName');
const viewExpiry = document.getElementById('viewExpiry');
const viewCVV = document.getElementById('viewCVV');
const viewBrand = document.getElementById('viewBrand');

// Função que detecta e aplica a bandeira baseada nos primeiros dígitos [2]
function updateCardBrand(number) {
    // Remove os espaços para validar a string limpa
    const cleanNumber = number.replace(/\s/g, '');
    
    // Remove as classes antigas de tema
    card.classList.remove('visa-theme', 'mastercard-theme', 'elo-theme', 'default-theme');

    if (cleanNumber.startsWith('4')) {
        card.classList.add('visa-theme');
        viewBrand.innerText = 'VISA';
    } else if (cleanNumber.startsWith('5')) {
        card.classList.add('mastercard-theme');
        viewBrand.innerText = 'MASTERCARD';
    } else if (cleanNumber.startsWith('6') || cleanNumber.startsWith('50')) {
        card.classList.add('elo-theme');
        viewBrand.innerText = 'ELO';
    } else {
        card.classList.add('default-theme');
        viewBrand.innerText = cleanNumber.length > 0 ? 'CARD' : 'VISA';
    }
}

// 1. Número do Cartão + Identificador de Bandeira
inputNumber.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.match(/.{1,4}/g)?.join(' ') || '';
    e.target.value = value;
    
    viewNumber.innerText = value || '•••• •••• •••• ••••';
    updateCardBrand(value);
});

// 2. Nome do Titular
inputName.addEventListener('input', (e) => {
    const value = e.target.value.toUpperCase();
    e.target.value = value;
    viewName.innerText = value || 'NOME DO TITULAR';
});

// 3. Validade (MM/AA)
inputExpiry.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value;
    viewExpiry.innerText = value || 'MM/AA';
});

// 4. CVV
inputCVV.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    e.target.value = value;
    viewCVV.innerText = value || '•••';
});

// 5. Rotação Tridimensional Automática
inputCVV.addEventListener('focus', () => card.classList.add('flipped'));

[inputNumber, inputName, inputExpiry].forEach(input => {
    input.addEventListener('focus', () => card.classList.remove('flipped'));
});
